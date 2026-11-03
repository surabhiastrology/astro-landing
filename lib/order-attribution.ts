export type OrderSource =
  | "Cart recovery"
  | "WhatsApp"
  | "Meta Ads (tagged)"
  | "Meta click (unverified)"
  | "Google Ads (tagged)"
  | "Organic search"
  | "Referral"
  | "Direct / unattributed";

export type OrderAttribution = {
  source: OrderSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrerHost?: string;
  metaClick?: boolean;
  googleClick?: boolean;
};

export type AttributionSignals = Omit<OrderAttribution, "source">;

const cleanTag = (value: unknown) =>
  typeof value === "string" ? value.trim().slice(0, 100).replace(/[<>"']/g, "") : "";

const cleanHost = (value: unknown) =>
  typeof value === "string" && /^[a-z0-9.-]{1,150}$/i.test(value) ? value.toLowerCase() : "";

export function resolveOrderAttribution(input: unknown, recoveredFromCart = false): OrderAttribution {
  const data = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const utmSource = cleanTag(data.utmSource).toLowerCase();
  const utmMedium = cleanTag(data.utmMedium).toLowerCase();
  const utmCampaign = cleanTag(data.utmCampaign);
  const referrerHost = cleanHost(data.referrerHost);
  const metaClick = data.metaClick === true;
  const googleClick = data.googleClick === true;

  const isMeta = /^(facebook|fb|instagram|ig|meta)$/.test(utmSource) ||
    /(^|\.)(facebook\.com|instagram\.com|l\.facebook\.com)$/.test(referrerHost) || metaClick;
  const isWhatsApp = /^(whatsapp|wa)$/.test(utmSource) ||
    /(^|\.)(wa\.me|whatsapp\.com)$/.test(referrerHost);
  const isGoogle = /^(google|googleads)$/.test(utmSource) || googleClick;
  const isPaid = /^(cpc|ppc|paid|paid_social|paidsocial|social_paid|paidsearch|paid_search)$/.test(utmMedium);

  let source: OrderSource = "Direct / unattributed";
  if (recoveredFromCart) source = "Cart recovery";
  else if (isWhatsApp) source = "WhatsApp";
  else if (isMeta && isPaid) source = "Meta Ads (tagged)";
  else if (isGoogle && (isPaid || googleClick)) source = "Google Ads (tagged)";
  else if (isMeta) source = "Meta click (unverified)";
  else if (/^(google|bing|yahoo|duckduckgo)$/.test(utmSource) ||
    /(^|\.)(google\.[a-z.]+|bing\.com|yahoo\.com|duckduckgo\.com)$/.test(referrerHost)) source = "Organic search";
  else if (referrerHost) source = "Referral";

  return {
    source,
    ...(utmSource ? { utmSource } : {}),
    ...(utmMedium ? { utmMedium } : {}),
    ...(utmCampaign ? { utmCampaign } : {}),
    ...(referrerHost ? { referrerHost } : {}),
    ...(metaClick ? { metaClick } : {}),
    ...(googleClick ? { googleClick } : {}),
  };
}

export function orderSourceLabel(attribution: OrderAttribution | null | undefined) {
  return attribution?.source || "Unknown (before tracking)";
}

export function attributionRazorpayNotes(input: unknown) {
  const attribution = resolveOrderAttribution(input);
  return {
    ...(attribution.utmSource ? { attrUtmSource: attribution.utmSource } : {}),
    ...(attribution.utmMedium ? { attrUtmMedium: attribution.utmMedium } : {}),
    ...(attribution.utmCampaign ? { attrUtmCampaign: attribution.utmCampaign } : {}),
    ...(attribution.referrerHost ? { attrReferrerHost: attribution.referrerHost } : {}),
    ...(attribution.metaClick ? { attrMetaClick: "1" } : {}),
    ...(attribution.googleClick ? { attrGoogleClick: "1" } : {}),
  };
}

export function attributionFromRazorpayNotes(notes: Record<string, unknown> | null | undefined, recoveredFromCart: boolean) {
  return resolveOrderAttribution({
    utmSource: notes?.attrUtmSource,
    utmMedium: notes?.attrUtmMedium,
    utmCampaign: notes?.attrUtmCampaign,
    referrerHost: notes?.attrReferrerHost,
    metaClick: notes?.attrMetaClick === "1",
    googleClick: notes?.attrGoogleClick === "1",
  }, recoveredFromCart);
}
