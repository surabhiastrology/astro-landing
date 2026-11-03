import assert from "node:assert/strict";
import test from "node:test";
import { trackVerifiedPurchaseOnce } from "../lib/meta-checkout-events.ts";

const previousKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const previousWindow = globalThis.window;

function mockWindow() {
  const stored = new Map();
  const timers = [];
  globalThis.window = {
    location: { hostname: "kundalireport.surabhiastrology.com" },
    localStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
    },
    setTimeout: (callback) => timers.push(callback),
  };
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = "rzp_live_test";
  return { stored, timers };
}

test.after(() => {
  globalThis.window = previousWindow;
  if (previousKey === undefined) delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  else process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = previousKey;
});

test("waits to mark a purchase until the pixel function is available", () => {
  const { stored, timers } = mockWindow();
  const calls = [];
  trackVerifiedPurchaseOnce("order_delayedpixel", 999, "Kundali");

  assert.equal(stored.has("meta:purchase:order_delayedpixel"), false);
  assert.equal(timers.length, 1);

  globalThis.window.fbq = (...args) => calls.push(args);
  timers.shift()();
  assert.equal(stored.get("meta:purchase:order_delayedpixel"), "1");
  assert.deepEqual(calls[0][3], { eventID: "purchase_order_delayedpixel" });

  trackVerifiedPurchaseOnce("order_delayedpixel", 999, "Kundali");
  assert.equal(calls.length, 1);
});

test("allows retry when the pixel function throws", () => {
  const { stored } = mockWindow();
  globalThis.window.fbq = () => { throw new Error("pixel unavailable"); };
  trackVerifiedPurchaseOnce("order_retryable", 999, "Kundali");
  assert.equal(stored.has("meta:purchase:order_retryable"), false);

  let calls = 0;
  globalThis.window.fbq = () => { calls += 1; };
  trackVerifiedPurchaseOnce("order_retryable", 999, "Kundali");
  assert.equal(calls, 1);
  assert.equal(stored.get("meta:purchase:order_retryable"), "1");
});

test("allows retry after the pixel never becomes available", () => {
  const { stored, timers } = mockWindow();
  trackVerifiedPurchaseOnce("order_pixeltimeout", 999, "Kundali");
  while (timers.length) timers.shift()();
  assert.equal(stored.has("meta:purchase:order_pixeltimeout"), false);

  let calls = 0;
  globalThis.window.fbq = () => { calls += 1; };
  trackVerifiedPurchaseOnce("order_pixeltimeout", 999, "Kundali");
  assert.equal(calls, 1);
});

test("never sends Preview purchases to the production pixel", () => {
  const { stored } = mockWindow();
  globalThis.window.location.hostname = "test.surabhiastrology.com";
  let calls = 0;
  globalThis.window.fbq = () => { calls += 1; };
  trackVerifiedPurchaseOnce("order_preview", 999, "Kundali");
  assert.equal(calls, 0);
  assert.equal(stored.size, 0);
});
