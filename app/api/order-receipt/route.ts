import crypto from "crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { getCheckoutPlanByReportType } from "@/lib/checkout-plans";

const requestSchema = z.object({
  orderId: z.string().regex(/^order_[a-zA-Z0-9]+$/).max(64),
  receiptToken: z.string().regex(/^[a-f0-9]{64}$/),
});

function privateResponse(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, private" },
  });
}

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return privateResponse({ error: "Receipt not found" }, 404);

    const { orderId, receiptToken } = parsed.data;
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    const order = await razorpay.orders.fetch(orderId);
    const savedTokenHash = order.notes?.receiptTokenHash;
    if (typeof savedTokenHash !== "string" || !/^[a-f0-9]{64}$/.test(savedTokenHash)) {
      return privateResponse({ error: "Receipt not found" }, 404);
    }

    const suppliedTokenHash = crypto.createHash("sha256").update(receiptToken).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(savedTokenHash, "hex"), Buffer.from(suppliedTokenHash, "hex"))) {
      return privateResponse({ error: "Receipt not found" }, 404);
    }

    if (typeof order.notes?.formData !== "string") {
      return privateResponse({ error: "Receipt details unavailable" }, 404);
    }

    const form = JSON.parse(order.notes.formData) as { name?: string; reportType?: string };
    const checkoutPlan = getCheckoutPlanByReportType(form.reportType);
    if (
      !checkoutPlan ||
      order.currency !== "INR" ||
      Number(order.amount) !== checkoutPlan.amount * 100
    ) {
      return privateResponse({ error: "Receipt details unavailable" }, 404);
    }

    let paymentId: string | null = null;
    let isCaptured = false;
    if (order.status === "paid") {
      const payments = await razorpay.orders.fetchPayments(orderId);
      const capturedPayment = payments.items.find(
        (payment) =>
          payment.order_id === orderId &&
          payment.status === "captured" &&
          payment.amount === order.amount &&
          payment.currency === "INR",
      );
      if (capturedPayment) {
        isCaptured = true;
        paymentId = capturedPayment.id;
      }
    }

    return privateResponse({
      status: isCaptured ? "paid" : "pending",
      receipt: {
        name: form.name || "Customer",
        reportType: checkoutPlan.reportType,
        amount: checkoutPlan.amount,
        orderId: order.id,
        paymentId,
      },
    });
  } catch (error) {
    console.error("Order receipt lookup failed:", error);
    return privateResponse({ error: "Unable to check payment status" }, 503);
  }
}
