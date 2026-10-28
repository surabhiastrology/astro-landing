// app/api/create-order/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { getCheckoutAmount, getCheckoutPlanByReportType, supportsUrgentDelivery } from "@/lib/checkout-plans";
import { isApproximateBirthTimeRange } from "@/lib/birth-time";
import { CheckoutRecovery, RECOVERY_CONSENT_TEXT, RECOVERY_DELAY_MS, hashRecoveryToken, isRecoveryCheckoutEnabled, recoveryEnvironment, isWhatsAppOptedOut, normalizeWhatsAppPhone } from "@/lib/checkout-recovery";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });

  try {
    const body = await req.json();
    const form = body?.form;
    const checkoutPlan = getCheckoutPlanByReportType(form?.reportType);

    if (!form || typeof form !== "object" || !checkoutPlan) {
      return NextResponse.json({ error: "Invalid checkout plan" }, { status: 400 });
    }

    if (form.urgentDelivery !== undefined && typeof form.urgentDelivery !== "boolean") {
      return NextResponse.json({ error: "Invalid delivery selection" }, { status: 400 });
    }
    const urgentDelivery = form.urgentDelivery === true;
    if (urgentDelivery && !supportsUrgentDelivery(checkoutPlan)) {
      return NextResponse.json({ error: "Urgent delivery is unavailable for this plan" }, { status: 400 });
    }

    // Use the server-side catalogue amount and canonical report type. Values
    // supplied in the browser can be edited and must never set the charge.
    if (form.tobAccuracy === "approximate" && !isApproximateBirthTimeRange(form.tobApproximateRange)) {
      return NextResponse.json({ error: "Choose an estimated time range" }, { status: 400 });
    }

    const trustedForm = {
      ...form,
      reportType: checkoutPlan.reportType,
      urgentDelivery,
      tobAccuracy: form.tobAccuracy === "approximate" ? "approximate" : "exact",
      tob: form.tobAccuracy === "approximate" ? "" : form.tob,
      tobApproximateRange: form.tobAccuracy === "approximate" ? form.tobApproximateRange : "",
    };
    const receiptToken = crypto.randomBytes(32).toString("hex");
    const recoveryEnabled = isRecoveryCheckoutEnabled;
    // A previously sent link can still be attributed after the send switch is turned off.
    const recoveryAttributionEnabled = recoveryEnabled || process.env.VERCEL_ENV === "production";
    const environment = recoveryEnvironment();
    let recoverySourceHash: string | undefined;
    if (recoveryAttributionEnabled && typeof body?.recoveryToken === "string" && /^[a-f0-9]{64}$/.test(body.recoveryToken)) {
      const candidateHash = hashRecoveryToken(body.recoveryToken);
      await connectDB();
      const source = await CheckoutRecovery.findOne({
        tokenHash: candidateHash,
        phone: normalizeWhatsAppPhone(String(form.phone || "")),
        environment,
        sentAt: { $exists: true },
        clickedAt: { $exists: true },
      }).lean();
      if (source) recoverySourceHash = candidateHash;
    }

    const options = {
      amount: getCheckoutAmount(checkoutPlan, urgentDelivery) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        formData: JSON.stringify(trustedForm),
        receiptTokenHash: crypto.createHash("sha256").update(receiptToken).digest("hex"),
        ...(recoverySourceHash ? { recoverySourceHash } : {}),
      },
    };

    const order = await razorpay.orders.create(options);
    if (recoveryEnabled && body?.recoveryOptIn === true) {
      try {
        const phone = normalizeWhatsAppPhone(String(form.phone || ""));
        if (/^91[6-9]\d{9}$/.test(phone) && !(await isWhatsAppOptedOut(phone))) {
          await connectDB();
          const token = crypto.randomBytes(32).toString("hex");
          await CheckoutRecovery.create({
            orderId: order.id,
            phone,
            name: String(form.name || "").trim().slice(0, 80),
            service: checkoutPlan.service,
            plan: checkoutPlan.plan,
            reportType: checkoutPlan.reportType,
            amountPaise: order.amount,
            environment,
            consentText: RECOVERY_CONSENT_TEXT,
            consentedAt: new Date(),
            dueAt: new Date(Date.now() + RECOVERY_DELAY_MS),
            status: "pending",
            tokenHash: hashRecoveryToken(token),
            returnToken: token,
          });
        }
      } catch (error) {
        // Recovery is optional; a database issue must not interrupt payment.
        console.error("Could not record checkout reminder consent:", error);
      }
    }
    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receiptToken,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
