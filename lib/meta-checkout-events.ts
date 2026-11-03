export const META_PRODUCTION_HOSTNAME = "kundalireport.surabhiastrology.com";

export function isProductionMetaTrackingEnabled() {
  return typeof window !== "undefined" &&
    window.location.hostname === META_PRODUCTION_HOSTNAME &&
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith("rzp_live_") === true;
}

type MetaEventKind = "track" | "trackCustom";
const pendingPurchaseEvents = new Set<string>();
const dispatchedPurchaseEvents = new Set<string>();

/** The event ID must also be forwarded as event_id by any existing CAPI integration. */
export function trackMetaCheckoutEvent(
  kind: MetaEventKind,
  name: string,
  data: Record<string, string | number>,
  eventId: string,
  onDispatched?: () => void,
  onUnavailable?: () => void,
) {
  if (!isProductionMetaTrackingEnabled()) return;

  let attempts = 0;
  const sendWhenReady = () => {
    const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") {
      try {
        fbq(kind, name, data, { eventID: eventId });
        onDispatched?.();
      } catch {
        onUnavailable?.();
      }
      return;
    }

    // The pixel loads after hydration; retain early visibility/input events.
    if (attempts++ < 100) window.setTimeout(sendWhenReady, 200);
    else onUnavailable?.();
  };

  sendWhenReady();
}

export function trackVerifiedPurchaseOnce(orderId: string, amountInr: number, reportType: string) {
  if (!isProductionMetaTrackingEnabled() || !/^order_[a-zA-Z0-9]+$/.test(orderId)) return;
  if (!Number.isFinite(amountInr) || amountInr <= 0) return;

  const key = `meta:purchase:${orderId}`;
  if (pendingPurchaseEvents.has(key) || dispatchedPurchaseEvents.has(key)) return;
  try {
    if (window.localStorage.getItem(key)) return;
  } catch {
    // Private browsing may disable storage; the in-memory sets still guard this page.
  }
  pendingPurchaseEvents.add(key);

  trackMetaCheckoutEvent(
    "track",
    "Purchase",
    { value: amountInr, currency: "INR", content_name: reportType },
    `purchase_${orderId}`,
    () => {
      pendingPurchaseEvents.delete(key);
      dispatchedPurchaseEvents.add(key);
      try {
        window.localStorage.setItem(key, "1");
      } catch {
        // The pixel call succeeded, even if persistent storage is unavailable.
      }
    },
    () => pendingPurchaseEvents.delete(key),
  );
}
