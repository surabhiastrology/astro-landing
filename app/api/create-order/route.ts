// app/api/create-order/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { getCheckoutPlanByReportType } from "@/lib/checkout-plans";

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

    // Use the server-side catalogue amount and canonical report type. Values
    // supplied in the browser can be edited and must never set the charge.
    const trustedForm = { ...form, reportType: checkoutPlan.reportType };
    const receiptToken = crypto.randomBytes(32).toString("hex");

    const options = {
      amount: checkoutPlan.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        formData: JSON.stringify(trustedForm),
        receiptTokenHash: crypto.createHash("sha256").update(receiptToken).digest("hex"),
      },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receiptToken,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
