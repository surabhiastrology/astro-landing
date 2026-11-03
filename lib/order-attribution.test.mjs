import assert from "node:assert/strict";
import test from "node:test";
import { attributionFromRazorpayNotes, attributionRazorpayNotes, orderSourceLabel, resolveOrderAttribution } from "./order-attribution.ts";
import { captureOrderAttribution } from "./order-attribution-client.ts";

test("paid Meta campaign survives the Razorpay notes round trip", () => {
  const notes = attributionRazorpayNotes({ utmSource: "facebook", utmMedium: "paid_social", utmCampaign: "November Reports" });
  const result = attributionFromRazorpayNotes(notes, false);
  assert.equal(result.source, "Meta Ads (tagged)");
  assert.equal(result.utmCampaign, "November Reports");
});

test("Meta click alone is not claimed as an ad-attributed sale", () => {
  assert.equal(resolveOrderAttribution({ metaClick: true }).source, "Meta click (unverified)");
});

test("WhatsApp, search, recovery, direct and old orders remain distinct", () => {
  assert.equal(resolveOrderAttribution({ utmSource: "whatsapp", utmMedium: "chatbot" }).source, "WhatsApp");
  assert.equal(resolveOrderAttribution({ referrerHost: "www.google.com" }).source, "Organic search");
  assert.equal(attributionFromRazorpayNotes({}, true).source, "Cart recovery");
  assert.equal(resolveOrderAttribution({}).source, "Direct / unattributed");
  assert.equal(orderSourceLabel(undefined), "Unknown (before tracking)");
});

test("a browser-supplied source label cannot override the classified source", () => {
  assert.equal(resolveOrderAttribution({ source: "Meta Ads (tagged)" }).source, "Direct / unattributed");
});

test("internal checkout navigation keeps the landing campaign", () => {
  const saved = new Map();
  globalThis.window = {
    location: { search: "?utm_source=facebook&utm_medium=paid_social&utm_campaign=Reports", hostname: "kundalireport.surabhiastrology.com" },
    sessionStorage: {
      getItem: (key) => saved.get(key) || null,
      setItem: (key, value) => saved.set(key, value),
    },
  };
  globalThis.document = { referrer: "https://l.facebook.com/" };
  captureOrderAttribution();
  window.location.search = "?service=Surbhi%20Kundali";
  const checkoutSignals = captureOrderAttribution();
  assert.equal(resolveOrderAttribution(checkoutSignals).source, "Meta Ads (tagged)");
  delete globalThis.window;
  delete globalThis.document;
});
