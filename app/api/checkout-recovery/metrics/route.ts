import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CheckoutRecovery, WhatsAppOptOut } from "@/lib/checkout-recovery";

export async function GET(req: Request) {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "Preview only" }, { status: 403 });
  const secret = process.env.CHECKOUT_RECOVERY_RUN_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const attempts = await CheckoutRecovery.find({ environment: "preview" })
    .select("status messageStatus recoveredAmountInr recoveredOrderId phone sentAt clickedAt")
    .lean();
  const sent = attempts.filter((item) => item.sentAt);
  const recovered = attempts.filter((item) => item.recoveredOrderId);
  const sentPhones = [...new Set(sent.map((item) => item.phone))];
  const optOuts = sentPhones.length
    ? await WhatsAppOptOut.countDocuments({ environment: "preview", phone: { $in: sentPhones } })
    : 0;
  return NextResponse.json({
    consentedPaymentAttempts: attempts.length,
    messagesAccepted: sent.length,
    messagesDelivered: sent.filter((item) => item.messageStatus === "delivered" || item.messageStatus === "read").length,
    linksOpened: sent.filter((item) => item.clickedAt).length,
    paidOrdersRecovered: recovered.length,
    recoveredRevenueInr: recovered.reduce((sum, item) => sum + (Number(item.recoveredAmountInr) || 0), 0),
    optOutsAfterReminder: optOuts,
    messageCostInr: null,
    messageCostNote: "Reconcile delivered marketing messages with WhatsApp Manager billing; Meta delivery webhooks do not include a billed amount.",
  });
}
