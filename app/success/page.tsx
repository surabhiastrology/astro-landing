"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, Mail, MessageCircle, RotateCcw, ShieldCheck } from "lucide-react";

type Receipt = {
  name: string;
  reportType: string;
  amount: number;
  orderId: string;
  paymentId: string | null;
};

type ReceiptState = "checking" | "paid" | "pending" | "unavailable";

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function SuccessPage() {
  const [state, setState] = useState<ReceiptState>("checking");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [orderId, setOrderId] = useState("");
  const [retry, setRetry] = useState(0);

  const checkReceipt = useCallback(async () => {
    const id = new URLSearchParams(window.location.search).get("orderId") || "";
    setOrderId(id);

    if (!/^order_[a-zA-Z0-9]+$/.test(id)) {
      setState("unavailable");
      return;
    }

    const token = sessionStorage.getItem(`order-receipt:${id}`);
    if (!token) {
      setState("unavailable");
      return;
    }

    setState("checking");
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        const response = await fetch("/api/order-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ orderId: id, receiptToken: token }),
        });

        if (response.status === 404) {
          setState("unavailable");
          return;
        }

        if (response.ok) {
          const result = await response.json() as { status?: string; receipt?: Receipt };
          if (result.receipt) setReceipt(result.receipt);
          if (result.status === "paid" && result.receipt) {
            setState("paid");
            return;
          }
        }
      } catch {
        // Retry briefly; a temporary connection issue should not imply failure.
      }

      if (attempt < 7) await new Promise((resolve) => window.setTimeout(resolve, 1800));
    }

    setState("pending");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void checkReceipt(), 0);
    return () => window.clearTimeout(timer);
  }, [checkReceipt, retry]);

  const supportText = orderId
    ? `Hi, I completed checkout but need help confirming my payment. Order reference: ${orderId}`
    : "Hi, I need help confirming my checkout payment.";
  const whatsappUrl = `https://wa.me/919251151330?text=${encodeURIComponent(supportText)}`;
  const emailUrl = `mailto:info@surabhiastrology.com?subject=${encodeURIComponent("Help confirming my payment")}&body=${encodeURIComponent(supportText)}`;

  const isPaid = state === "paid";
  const isChecking = state === "checking";
  const title = isPaid
    ? "Payment confirmed"
    : isChecking
      ? "Checking your payment"
      : state === "pending"
        ? "Your payment is being confirmed"
        : "Let’s confirm your order";
  const description = isPaid
    ? "Your order is safely recorded. We’ll keep you updated as your report is prepared."
    : isChecking
      ? "We’re securely checking Razorpay for the final payment status. This can take a few seconds."
      : state === "pending"
        ? "Razorpay hasn’t confirmed the final status yet. Please don’t pay again; use the order reference below if you contact us."
        : "We couldn’t verify this order from this browser session. If you completed a payment, contact us and we’ll help check it.";

  return (
    <main className="min-h-screen bg-[#FCF7EE] px-4 py-8 sm:py-14 text-[#2A1400]">
      <div className="mx-auto max-w-2xl">
        <header className="mb-7 flex items-center justify-between rounded-2xl border border-[#E8D8B8] bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[#8B1E1E]">SURABHI ASTROLOGY</p>
            <p className="mt-1 text-sm text-[#6B5B4D]">Secure order confirmation</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EC] px-3 py-1.5 text-xs font-semibold text-[#1B4D30]">
            <ShieldCheck size={15} aria-hidden="true" /> Secure checkout
          </span>
        </header>

        <section className="overflow-hidden rounded-3xl border border-[#E8D8B8] bg-white shadow-[0_18px_50px_rgba(61,22,0,0.08)]">
          <div className="px-6 py-9 text-center sm:px-10 sm:py-11">
            <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${isPaid ? "bg-[#E8F5EC] text-[#1B7A43]" : "bg-[#FCF7EE] text-[#8B1E1E]"}`}>
              {isPaid ? <CheckCircle2 size={34} aria-hidden="true" /> : isChecking || state === "pending" ? <Clock3 size={32} aria-hidden="true" /> : <ShieldCheck size={32} aria-hidden="true" />}
            </div>
            <p className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${isPaid ? "bg-[#E8F5EC] text-[#1B4D30]" : "bg-[#FCF7EE] text-[#8B1E1E]"}`}>
              {isPaid ? "Payment received" : isChecking ? "Verifying securely" : state === "pending" ? "Confirmation pending" : "Need a hand?"}
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
            <p className="mx-auto mt-3 max-w-lg leading-7 text-[#6B5B4D]">{description}</p>
          </div>

          {receipt && (
            <div className="mx-5 mb-5 rounded-2xl border border-[#E8D8B8] bg-[#FCF7EE] p-5 sm:mx-8 sm:p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#8B1E1E]">Order summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-[#6B5B4D]">Order</dt><dd className="text-right font-medium">{receipt.reportType}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#6B5B4D]">Amount</dt><dd className="font-semibold">{formatAmount(receipt.amount)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-[#6B5B4D]">Order reference</dt><dd className="break-all text-right font-mono text-xs">{receipt.orderId}</dd></div>
                {isPaid && receipt.paymentId && <div className="flex justify-between gap-4"><dt className="text-[#6B5B4D]">Payment reference</dt><dd className="break-all text-right font-mono text-xs">{receipt.paymentId}</dd></div>}
              </dl>
            </div>
          )}

          {orderId && !receipt && (
            <div className="mx-5 mb-5 rounded-xl bg-[#FCF7EE] px-4 py-3 text-center text-xs text-[#6B5B4D] sm:mx-8">
              Order reference: <span className="break-all font-mono">{orderId}</span>
            </div>
          )}

          <div className="mx-5 mb-6 rounded-2xl border border-[#E8D8B8] p-5 sm:mx-8 sm:p-6">
            <h2 className="mb-4 font-semibold">{isPaid ? "What happens next" : "Need help?"}</h2>
            {isPaid ? (
              <ol className="space-y-4 text-sm text-[#6B5B4D]">
                <li className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-[#1B7A43]" size={18} aria-hidden="true" /><span><strong className="text-[#2A1400]">Your payment is recorded.</strong> You don’t need to submit it again.</span></li>
                <li className="flex gap-3"><Clock3 className="mt-0.5 shrink-0 text-[#8B1E1E]" size={18} aria-hidden="true" /><span>Our team will review your details and prepare your report.</span></li>
                <li className="flex gap-3"><Mail className="mt-0.5 shrink-0 text-[#8B1E1E]" size={18} aria-hidden="true" /><span>We’ll share it with you when it’s ready. If a WhatsApp message doesn’t arrive, your order is still recorded.</span></li>
              </ol>
            ) : (
              <p className="text-sm leading-6 text-[#6B5B4D]">Our support team can check the order reference and help you. Please avoid making another payment while the status is pending.</p>
            )}
          </div>

          <div className="flex flex-col gap-3 px-5 pb-7 sm:flex-row sm:px-8">
            {state !== "paid" && (
              <button onClick={() => setRetry((count) => count + 1)} disabled={isChecking} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#8B1E1E] px-4 font-semibold text-[#8B1E1E] transition hover:bg-[#FCF7EE] disabled:cursor-wait disabled:opacity-60">
                <RotateCcw size={17} aria-hidden="true" /> {isChecking ? "Checking…" : "Check payment again"}
              </button>
            )}
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B7A43] px-4 font-semibold text-white transition hover:bg-[#165f35]">
              <MessageCircle size={18} aria-hidden="true" /> WhatsApp support
            </a>
            <a href={emailUrl} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E8D8B8] px-4 font-semibold text-[#2A1400] transition hover:bg-[#FCF7EE]">
              <Mail size={17} aria-hidden="true" /> Email support
            </a>
          </div>
        </section>

        <p className="mt-6 text-center text-sm text-[#6B5B4D]">Questions? <a href="mailto:info@surabhiastrology.com" className="font-semibold text-[#8B1E1E] underline underline-offset-2">info@surabhiastrology.com</a></p>
        <div className="mt-5 text-center"><Link href="/" className="text-sm font-semibold text-[#8B1E1E] underline underline-offset-4">Return to Surabhi Astrology</Link></div>
      </div>
    </main>
  );
}
