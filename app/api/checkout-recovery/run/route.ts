import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { CheckoutRecovery, isWhatsAppOptedOut } from "@/lib/checkout-recovery";
import { getWhatsAppSenderCredentials } from "@/lib/whatsappEnvironment";

const Order = () => mongoose.connection.collection("orders");

export async function POST(req: Request) {
  // This endpoint is deliberately not a production Vercel cron. Preview jobs
  // must be invoked by an authorized tester or a Preview-only scheduler.
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ error: "Preview only" }, { status: 403 });
  }
  const secret = process.env.CHECKOUT_RECOVERY_RUN_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const allowedPhones = new Set(
    (process.env.CHECKOUT_RECOVERY_TEST_PHONES || "")
      .split(",")
      .map((value) => value.replace(/\D/g, ""))
      .filter(Boolean),
  );
  const templateName = process.env.CHECKOUT_RECOVERY_TEST_TEMPLATE;
  if (!allowedPhones.size || !templateName || !/^[a-z0-9_]+$/.test(templateName)) {
    return NextResponse.json({ error: "Test recipients or template are not configured" }, { status: 503 });
  }

  const { phoneNumberId, token } = getWhatsAppSenderCredentials();
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });
  await connectDB();
  const due = await CheckoutRecovery.find({
    environment: "preview", status: "pending", dueAt: { $lte: new Date() },
  }).sort({ dueAt: 1 }).limit(20).lean();
  const result = { checked: 0, sent: 0, skipped: 0, failed: 0 };

  for (const candidate of due) {
    const claimed = await CheckoutRecovery.findOneAndUpdate(
      { _id: candidate._id, status: "pending" },
      { $set: { status: "processing" } },
      { new: true },
    );
    if (!claimed) continue;
    result.checked++;
    try {
      if (!allowedPhones.has(claimed.phone) || await isWhatsAppOptedOut(claimed.phone)) {
        await CheckoutRecovery.updateOne({ _id: claimed._id }, { $set: { status: "skipped", errorCode: "recipient_not_eligible" } });
        result.skipped++;
        continue;
      }
      const alreadyMessaged = await CheckoutRecovery.exists({
        _id: { $ne: claimed._id }, phone: claimed.phone, environment: "preview",
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
        throw new Error(`meta_${response.status}`);
      }
      await CheckoutRecovery.updateOne({ _id: claimed._id }, {
        $set: { status: "sent", sentAt: new Date(), whatsappMessageId: payload.messages[0].id, messageStatus: "accepted" },
        $unset: { returnToken: "" },
      });
      result.sent++;
    } catch (error) {
      // Never retry an ambiguous API failure automatically: one reminder max.
      await CheckoutRecovery.updateOne({ _id: claimed._id }, { $set: { status: "failed", errorCode: error instanceof Error ? error.message.slice(0, 80) : "unknown" } });
      result.failed++;
    }
  }
  return NextResponse.json(result);
}
