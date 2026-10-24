export const META_PRODUCTION_HOSTNAME = "kundalireport.surabhiastrology.com";

export function isProductionMetaTrackingEnabled() {
  return typeof window !== "undefined" &&
    window.location.hostname === META_PRODUCTION_HOSTNAME &&
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith("rzp_live_") === true;
}

type MetaEventKind = "track" | "trackCustom";

/** The event ID must also be forwarded as event_id by any existing CAPI integration. */
export function trackMetaCheckoutEvent(
  kind: MetaEventKind,
  name: string,
  data: Record<string, string | number>,
  eventId: string,
) {
  if (!isProductionMetaTrackingEnabled()) return;

  let attempts = 0;
  const sendWhenReady = () => {
    if (typeof window.fbq === "function") {
      window.fbq(kind, name, data, { eventID: eventId });
      return;
    }

    // The pixel loads after hydration; retain early visibility/input events.
    if (attempts++ < 100) window.setTimeout(sendWhenReady, 200);
  };

  sendWhenReady();
}

export function trackVerifiedPurchaseOnce(orderId: string, amountInr: number, reportType: string) {
  if (!isProductionMetaTrackingEnabled() || !/^order_[a-zA-Z0-9]+$/.test(orderId)) return;
  if (!Number.isFinite(amountInr) || amountInr <= 0) return;

  const key = `meta:purchase:${orderId}`;
  if (window.localStorage.getItem(key)) return;
  window.localStorage.setItem(key, "1");

  trackMetaCheckoutEvent(
    "track",
    "Purchase",
    { value: amountInr, currency: "INR", content_name: reportType },
    `purchase_${orderId}`,
  );
}
