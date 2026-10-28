import crypto from "node:crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { isWhatsAppPreview } from "@/lib/whatsappEnvironment";

export const RECOVERY_CONSENT_TEXT =
  "Send me order and cart updates on WhatsApp by Surabhi Astrology.";
// Keep the live delay at one hour; shorten only test checkouts for Preview/local QA.
export const RECOVERY_DELAY_MS = isWhatsAppPreview ? 2 * 60 * 1000 : 60 * 60 * 1000;

const recoverySchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  name: String,
  service: String,
  plan: String,
  reportType: String,
  amountPaise: Number,
  environment: { type: String, required: true },
  consentText: String,
  consentedAt: Date,
  dueAt: Date,
  status: { type: String, default: "pending" },
  tokenHash: { type: String, unique: true, sparse: true },
  returnToken: String,
  whatsappMessageId: String,
  messageStatus: String,
  sentAt: Date,
  clickedAt: Date,
  recoveredOrderId: String,
  recoveredAt: Date,
  recoveredAmountInr: Number,
  errorCode: String,
}, { timestamps: true, collection: "checkout_recoveries" });
recoverySchema.index({ environment: 1, status: 1, dueAt: 1 });

const optOutSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  environment: { type: String, required: true },
  optedOutAt: { type: Date, default: Date.now },
}, { collection: "whatsapp_opt_outs" });
optOutSchema.index({ phone: 1, environment: 1 }, { unique: true });

export const CheckoutRecovery = mongoose.models.CheckoutRecovery || mongoose.model("CheckoutRecovery", recoverySchema);
export const WhatsAppOptOut = mongoose.models.WhatsAppOptOut || mongoose.model("WhatsAppOptOut", optOutSchema);

export function recoveryEnvironment() {
  return isWhatsAppPreview ? "preview" : "production";
}

export function normalizeWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

export function hashRecoveryToken(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function isWhatsAppOptedOut(phone: string) {
  await connectDB();
  return Boolean(await WhatsAppOptOut.exists({ phone: normalizeWhatsAppPhone(phone), environment: recoveryEnvironment() }));
}

export async function saveWhatsAppOptOut(phone: string) {
  await connectDB();
  const normalized = normalizeWhatsAppPhone(phone);
  const environment = recoveryEnvironment();
  await WhatsAppOptOut.updateOne(
    { phone: normalized, environment },
    { $set: { optedOutAt: new Date() } },
    { upsert: true },
  );
  await CheckoutRecovery.updateMany(
    { phone: normalized, environment, status: "pending" },
    { $set: { status: "opted_out" } },
  );
}

export async function markRecoveredOrder(tokenHash: string | undefined, paidOrderId: string, amountInr: number) {
  if (!tokenHash || !/^[a-f0-9]{64}$/.test(tokenHash)) return;
  try {
    await connectDB();
    await CheckoutRecovery.updateOne(
      { tokenHash, environment: recoveryEnvironment(), sentAt: { $exists: true }, recoveredOrderId: { $exists: false } },
      { $set: { recoveredOrderId: paidOrderId, recoveredAt: new Date(), recoveredAmountInr: amountInr } },
    );
  } catch (error) {
    // Analytics must never interrupt a captured payment or its receipt.
    console.error("Could not record recovered order:", error);
  }
}
