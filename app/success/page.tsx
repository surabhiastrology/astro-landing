"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, Mail, MessageCircle, RotateCcw, ShieldCheck } from "lucide-react";

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

  const isPaid = state === "paid";
  const isChecking = state === "checking";
  const supportText = orderId
    ? `Hi, I completed checkout but need help confirming my payment. Order reference: ${orderId}`
    : "Hi, I need help confirming my checkout payment.";
  const whatsappUrl = `https://wa.me/919251151330?text=${encodeURIComponent(supportText)}`;
  const emailUrl = `mailto:info@surabhiastrology.com?subject=${encodeURIComponent("Help confirming my payment")}&body=${encodeURIComponent(supportText)}`;

  const copy = {
    support: "Support",
    checking: "We’re checking your payment",
    paid: "Your order is confirmed",
    pending: "Your payment is still being confirmed",
    unavailable: "Need help confirming your order?",
    checkingBody: "We’re securely checking Razorpay for the final payment status. This can take a few seconds.",
    paidBody: "Your payment is recorded. We’ll keep you updated as your report is prepared.",
    pendingBody: "Razorpay hasn’t confirmed the final status yet. Please don’t pay again; share the order reference below if you contact us.",
    unavailableBody: "If you completed a payment, contact us with your order reference and we’ll help check it.",
    receipt: "Payment receipt",
    report: "Report",
    amount: "Amount paid",
    orderReference: "Order reference",
    paymentReference: "Payment reference",
    next: "What happens next",
    stepOne: "Your payment is recorded. You don’t need to submit it again.",
    stepTwo: "Our team will review your details and prepare your report.",
    stepThree: "When it’s ready, we’ll send it on WhatsApp and by email if you provided an email address.",
    pendingHelp: "Our support team can check the order reference. Please don’t make another payment while confirmation is pending.",
    checkAgain: "Check again",
    checkingButton: "Checking…",
    whatsapp: "WhatsApp support",
    email: "Email support",
    returnHome: "Return to Surabhi Astrology",
    brandLine: "Your birth details, prepared with personal care by our team.",
  };

  const title = isPaid ? copy.paid : isChecking ? copy.checking : state === "pending" ? copy.pending : copy.unavailable;
  const description = isPaid ? copy.paidBody : isChecking ? copy.checkingBody : state === "pending" ? copy.pendingBody : copy.unavailableBody;

  return (
    <main className="min-h-dvh bg-[#F7F1E7] px-4 py-5 text-[#2A1400] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between border-b border-[#DCC9A8] pb-4 sm:mb-8 sm:pb-5">
          <Link href="/" aria-label="Surabhi Astrology home" className="leading-none">
            <span className="block font-[var(--font-serif)] text-xl font-semibold tracking-wide text-[#4C2013] sm:text-2xl">Surabhi Astrology</span>
            <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-[0.19em] text-[#8B6A4B]">Personal guidance, thoughtfully prepared</span>
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[#6B3924] transition hover:bg-[#EFE3D0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E1E]">
            <MessageCircle size={17} aria-hidden="true" /> <span className="hidden sm:inline">{copy.support}</span>
          </a>
        </header>

        <div className="overflow-hidden rounded-[26px] border border-[#DCC9A8] bg-[#FFFEFB] shadow-[0_18px_54px_rgba(68,39,17,0.08)]">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
            <section className="order-2 border-t border-[#E8D8B8] bg-[#FCF8F0] lg:order-1 lg:border-r lg:border-t-0">
              <div className="relative h-64 overflow-hidden bg-[#32170F] sm:h-80 lg:h-[340px]">
                <Image
                  src="/astrology-confirmation-still-life.webp"
                  alt="A brass oil lamp beside burgundy astrology books and a subtle birth-chart illustration"
                  fill
                  preload
                  sizes="(max-width: 1023px) 100vw, 42vw"
                  className="object-cover object-[43%_center]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C0D08]/80 via-[#1C0D08]/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F1D5A0]">SURABHI ASTROLOGY</p>
                  <p className="max-w-sm font-[var(--font-serif)] text-2xl leading-tight sm:text-3xl">{copy.brandLine}</p>
                </div>
              </div>

              <div className="p-5 sm:p-7 lg:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7D3AE] bg-white text-[#9B5D17]">
                    <ShieldCheck size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B6A4B]">Order details</p>
                    <h2 className="font-[var(--font-serif)] text-xl font-semibold text-[#4C2013]">{copy.receipt}</h2>
                  </div>
                </div>
                {receipt ? (
                  <dl className="divide-y divide-dashed divide-[#E3D3B7] text-sm sm:text-[15px]">
                    <div className="flex items-start justify-between gap-4 py-3"><dt className="shrink-0 text-[#725F4B]">{copy.report}</dt><dd className="max-w-[68%] text-right font-medium leading-5 text-[#351A11]">{receipt.reportType}</dd></div>
                    <div className="flex items-center justify-between gap-4 py-3"><dt className="text-[#725F4B]">{copy.amount}</dt><dd className="text-lg font-semibold tabular-nums text-[#351A11]">{formatAmount(receipt.amount)}</dd></div>
                    <div className="flex items-start justify-between gap-4 py-3"><dt className="shrink-0 text-[#725F4B]">{copy.orderReference}</dt><dd className="max-w-[68%] break-all text-right font-mono text-[11px] leading-5 text-[#4C392D]">{receipt.orderId}</dd></div>
                    {isPaid && receipt.paymentId && <div className="flex items-start justify-between gap-4 py-3"><dt className="shrink-0 text-[#725F4B]">{copy.paymentReference}</dt><dd className="max-w-[68%] break-all text-right font-mono text-[11px] leading-5 text-[#4C392D]">{receipt.paymentId}</dd></div>}
                  </dl>
                ) : orderId ? (
                  <p className="break-all border-t border-dashed border-[#E3D3B7] pt-4 text-sm text-[#725F4B]">{copy.orderReference}: <span className="font-mono text-xs text-[#4C392D]">{orderId}</span></p>
                ) : (
                  <p className="text-sm leading-6 text-[#725F4B]">Your order details will appear here once we can verify your checkout.</p>
                )}
              </div>
            </section>

            <section className="order-1 bg-white px-5 py-7 sm:px-8 sm:py-9 lg:order-2 lg:px-10 lg:py-10">
              <div className="mb-8 flex items-start gap-4">
                <span className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isPaid ? "bg-[#E8F2E8] text-[#356B43]" : "bg-[#F4EADF] text-[#8B1E1E]"}`}>
                  {isPaid ? <Check size={23} strokeWidth={2.2} aria-hidden="true" /> : isChecking || state === "pending" ? <Clock3 size={22} aria-hidden="true" /> : <ShieldCheck size={22} aria-hidden="true" />}
                </span>
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B6A4B]">{isPaid ? "Payment received" : isChecking ? "Secure check" : "Here to help"}</p>
                  <h1 className="font-[var(--font-serif)] text-3xl font-medium leading-tight text-[#351A11] sm:text-4xl">{isPaid && receipt?.name ? `Thank you, ${receipt.name}` : title}</h1>
                  {isPaid && receipt?.name && <p className="mt-1 text-lg text-[#6B3924]">{title}</p>}
                  <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#5F5145]">{description}</p>
                </div>
              </div>

              {isPaid ? (
                <div className="mb-8 rounded-2xl border border-[#E8D8B8] bg-[#FFFCF6] p-5 sm:p-6">
                  <h2 className="mb-5 font-[var(--font-serif)] text-2xl font-semibold text-[#4C2013]">{copy.next}</h2>
                  <ol className="space-y-4 text-sm leading-6 text-[#5F5145] sm:text-[15px]">
                    {[copy.stepOne, copy.stepTwo, copy.stepThree].map((step, index) => (
                      <li key={step} className="flex gap-4">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#DCC9A8] font-mono text-xs text-[#8B1E1E]">0{index + 1}</span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="mb-8 rounded-2xl border border-[#E8D8B8] bg-[#FFFCF6] p-5 sm:p-6">
                  <p className="mb-5 text-sm leading-6 text-[#5F5145]">{copy.pendingHelp}</p>
                  {state !== "unavailable" && (
                    <button onClick={() => setRetry((count) => count + 1)} disabled={isChecking} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#B99B74] px-4 text-sm font-semibold text-[#5D3522] transition hover:bg-[#FBF5EB] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E1E]">
                      <RotateCcw size={16} aria-hidden="true" /> {isChecking ? copy.checkingButton : copy.checkAgain}
                    </button>
                  )}
                </div>
              )}

              <div className="border-t border-[#E8D8B8] pt-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A4B]">Need help?</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#276A45] px-6 text-sm font-semibold text-white transition hover:bg-[#1E5738] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#276A45] sm:w-auto">
                    <MessageCircle size={17} aria-hidden="true" /> {copy.whatsapp}
                  </a>
                  <a href={emailUrl} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-[#6B3924] underline decoration-[#C8A77D] underline-offset-4 transition hover:text-[#8B1E1E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E1E]">
                    <Mail size={16} aria-hidden="true" /> {copy.email}
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-[#DCC9A8] pt-4 text-xs text-[#806E5D] sm:flex-row">
          <span>info@surabhiastrology.com</span>
          <Link href="/" className="font-semibold text-[#6B3924] underline decoration-[#C8A77D] underline-offset-4">{copy.returnHome}</Link>
        </footer>
      </div>
    </main>
  );
}
