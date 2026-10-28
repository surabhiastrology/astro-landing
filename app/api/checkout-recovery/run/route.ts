import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { CheckoutRecovery, isRecoveryProductionEnabled, isWhatsAppOptedOut, recoveryEnvironment } from "@/lib/checkout-recovery";
import { getWhatsAppSenderCredentials } from "@/lib/whatsappEnvironment";

const Order = () => mongoose.connection.collection("orders");

export async function POST(req: Request) {
  const preview = process.env.VERCEL_ENV === "preview";
  if (!preview && !isRecoveryProductionEnabled) {
    return NextResponse.json({ error: "Recovery is disabled" }, { status: 403 });
  }
  const secret = process.env.CHECKOUT_RECOVERY_RUN_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const allowedPhones = new Set(
    (preview ? process.env.CHECKOUT_RECOVERY_TEST_PHONES || "" : "")
      .split(",")
      .map((value) => value.replace(/\D/g, ""))
      .filter(Boolean),
  );
  const templateName = preview
    ? process.env.CHECKOUT_RECOVERY_TEST_TEMPLATE
    : process.env.CHECKOUT_RECOVERY_LIVE_TEMPLATE;
  if ((preview && !allowedPhones.size) || !templateName || !/^[a-z0-9_]+$/.test(templateName) ||
      (!preview && (!process.env.WHATSAPP_APP_SECRET || process.env.NEXT_PUBLIC_CHECKOUT_RECOVERY_PRODUCTION !== "true"))) {
    return NextResponse.json({ error: "Recovery is not fully configured" }, { status: 503 });
  }

  const { phoneNumberId, token } = getWhatsAppSenderCredentials();
  const environment = recoveryEnvironment();
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });
  await connectDB();
  const due = await CheckoutRecovery.find({
    environment, status: "pending", dueAt: { $lte: new Date() },
  }).sort({ dueAt: 1 }).limit(20).lean();
  const result = { checked: 0, sent: 0, skipped: 0, failed: 0 };

  for (const candidate of due) {
    const claimed = await CheckoutRecovery.findOneAndUpdate(
      { _id: candidate._id, status: "pending" },
      { $set: { status: "processing" } },
      { returnDocument: "after" },
    );
    if (!claimed) continue;
    result.checked++;
    try {
      if ((preview && !allowedPhones.has(claimed.phone)) || await isWhatsAppOptedOut(claimed.phone)) {
        await CheckoutRecovery.updateOne({ _id: claimed._id }, { $set: { status: "skipped", errorCode: "recipient_not_eligible" } });
        result.skipped++;
        continue;
      }
      const alreadyMessaged = await CheckoutRecovery.exists({
        _id: { $ne: claimed._id }, phone: claimed.phone, environment,
        sentAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });
      if (alreadyMessaged) {
        await CheckoutRecovery.updateOne({ _id: claimed._id }, { $set: { status: "skipped", errorCode: "recent_reminder" } });
        result.skipped++;
        continue;
      }
      const [gatewayOrder, localPaid] = await Promise.all([
        razorpay.orders.fetch(claimed.orderId),
        Order().findOne({ orderId: claimed.orderId, status: "Paid" }),
      ]);
      const otherPaid = await Order().findOne({
        "customer.phone": { $in: [claimed.phone, `+${claimed.phone}`] },
        status: "Paid", createdAt: { $gte: claimed.consentedAt },
      });
      if (gatewayOrder.status === "paid" || localPaid || otherPaid) {
        await CheckoutRecovery.updateOne({ _id: claimed._id }, { $set: { status: "paid_before_reminder" } });
        result.skipped++;
        continue;
      }
      if (!claimed.returnToken || !/^[a-f0-9]{64}$/.test(claimed.returnToken)) {
        throw new Error("invalid_return_token");
      }
      // Recheck consent immediately before the only send attempt.
      if (await isWhatsAppOptedOut(claimed.phone)) {
        await CheckoutRecovery.updateOne({ _id: claimed._id }, { $set: { status: "opted_out" } });
        result.skipped++;
        continue;
      }
      const response = await fetch(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: claimed.phone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [{ type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: claimed.returnToken }] }],
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.messages?.[0]?.id) {
        // Persist only Meta's numeric diagnostics; its free-text message may
        // contain request details and must not be stored with recovery data.
        const code = Number.isInteger(payload?.error?.code) ? `_code_${payload.error.code}` : "";
        const subcode = Number.isInteger(payload?.error?.error_subcode) ? `_subcode_${payload.error.error_subcode}` : "";
        throw new Error(`meta_${response.status}${code}${subcode}`);
      }
      await CheckoutRecovery.updateOne({ _id: claimed._id }, {
        $set: {
          status: "sent", sentAt: new Date(), whatsappMessageId: payload.messages[0].id,
          messageStatus: payload.messages[0].message_status === "held_for_quality_assessment"
            ? "held_for_quality_assessment" : "accepted",
        },
        $unset: { returnToken: "" },
      });
      result.sent++;
    } catch (error) {
      // Never retry an ambiguous API failure automatically: one reminder max.
      const errorCode = error instanceof Error && /^(meta_\d{3}(?:_code_\d+)?(?:_subcode_\d+)?|invalid_return_token)$/.test(error.message)
        ? error.message : "recovery_run_error";
      await CheckoutRecovery.updateOne({ _id: claimed._id }, { $set: { status: "failed", errorCode } });
      result.failed++;
    }
  }
  return NextResponse.json(result);
}
