import type { AttributionSignals } from "./order-attribution";

const storageKey = "order-attribution:v1";
const maxAgeMs = 24 * 60 * 60 * 1000;

type StoredAttribution = { signals: AttributionSignals; capturedAt: number };

function externalReferrerHost() {
  try {
    const host = new URL(document.referrer).hostname.toLowerCase();
    return host && host !== window.location.hostname ? host : "";
  } catch {
    return "";
  }
}

export function captureOrderAttribution(): AttributionSignals {
  const params = new URLSearchParams(window.location.search);
  const fresh: AttributionSignals = {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    referrerHost: externalReferrerHost() || undefined,
    metaClick: params.has("fbclid"),
    googleClick: params.has("gclid") || params.has("gbraid") || params.has("wbraid"),
  };
  const hasNewCampaign = Boolean(fresh.utmSource || fresh.utmMedium || fresh.utmCampaign ||
    fresh.metaClick || fresh.googleClick);

  try {
    const stored = JSON.parse(window.sessionStorage.getItem(storageKey) || "null") as StoredAttribution | null;
    // document.referrer can remain the original ad site during internal navigation.
    // Keep the landing campaign unless this page has an explicit new campaign tag.
    if (!hasNewCampaign && stored?.capturedAt && Date.now() - stored.capturedAt < maxAgeMs) {
      return stored.signals;
    }
    window.sessionStorage.setItem(storageKey, JSON.stringify({ signals: fresh, capturedAt: Date.now() }));
  } catch {
    // Private browsing may block session storage; still report this page's signals.
  }
  return fresh;
}
