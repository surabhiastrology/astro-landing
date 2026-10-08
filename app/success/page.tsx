"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, ClipboardList, CreditCard, Headset, IndianRupee, Mail, MessageCircle, RotateCcw, ShieldCheck, Sparkles, Tag } from "lucide-react";

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
    <main className="min-h-dvh bg-[#FCF7EE] text-[#2A1400]">
      <header className="sticky top-0 z-50 border-b border-[#E8D8B8] bg-white px-4 py-1">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between">
          <Link href="/" aria-label="Surabhi Astrology home" className="flex items-center gap-2">
            <img src="/surbhi-astrology-logo.png" alt="Surbhi Astrology — Celebrity Astrologer Surbhi Gupta" className="h-12 w-auto object-contain md:h-16" />
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" className="flex min-h-10 items-center gap-2.5 rounded-xl border border-[#E8D8B8] bg-white px-2.5 py-1.5 text-[#168A55] shadow-[0_2px_8px_rgba(61,22,0,0.04)] transition-colors hover:bg-[#F5FBF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168A55] focus-visible:ring-offset-2 sm:px-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F5EE]">
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.52 3.48A11.79 11.79 0 0 0 12.13 0C5.58 0 .25 5.33.25 11.88c0 2.1.55 4.16 1.59 5.98L.15 24l6.29-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.15-3.5-8.44ZM12.14 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.73.98 1-3.64-.24-.37a9.88 9.88 0 1 1 8.38 4.62Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.51-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.1 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
              </svg>
            </span>
            <span className="hidden text-left leading-tight sm:block"><span className="block text-[11px] font-medium text-[#475569]">Need Help?</span><span className="block text-xs font-semibold">Chat on WhatsApp →</span></span>
          </a>
        </div>
      </header>

      <div className="px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">

        <div className="overflow-hidden rounded-[26px] border border-[#DCC9A8] bg-[#FFFEFB] shadow-[0_18px_54px_rgba(68,39,17,0.08)]">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
            <section aria-label="Order receipt" className="order-2 border-t border-[#E8D8B8] bg-[#FCF8F0] lg:order-1 lg:border-r lg:border-t-0">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="relative mb-7 hidden aspect-[16/9] overflow-hidden rounded-2xl bg-[#F2E7D4] md:block">
                  <Image
                    src="/surbhi-kundali-report-mobile-banner.png"
                    alt="Surbhi Kundali report prepared by Surabhi Astrology"
                    fill
                    sizes="(max-width: 1023px) 50vw, 42vw"
                    className="object-cover"
                  />
                </div>

                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4EADF] text-[#C8A84B]">
                    <ClipboardList size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B1E1E]">Order receipt</p>
                    <h2 className="font-serif text-xl font-semibold text-[#2A1400]">{copy.receipt}</h2>
                  </div>
                </div>

                {receipt ? (
                  <dl className="divide-y divide-dashed divide-[#E3D3B7]">
                    <div className="flex items-center gap-3 py-3.5 sm:gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#C8A84B]"><ClipboardList size={17} aria-hidden="true" /></span>
                      <dt className="shrink-0 text-sm text-[#6B4423]">{copy.report}</dt>
                      <dd className="ml-auto max-w-[62%] text-right text-sm font-medium leading-5 text-[#2A1400] sm:text-[15px]">{receipt.reportType}</dd>
                    </div>
                    <div className="flex items-center gap-3 py-3.5 sm:gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#C8A84B]"><IndianRupee size={18} aria-hidden="true" /></span>
                      <dt className="text-sm text-[#6B4423]">{copy.amount}</dt>
                      <dd className="ml-auto text-xl font-semibold tabular-nums text-[#2A1400]">{formatAmount(receipt.amount)}</dd>
                    </div>
                    <div className="flex items-center gap-3 py-3.5 sm:gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#C8A84B]"><Tag size={17} aria-hidden="true" /></span>
                      <dt className="shrink-0 text-sm text-[#6B4423]">{copy.orderReference}</dt>
                      <dd className="ml-auto max-w-[62%] break-all text-right font-mono text-[11px] leading-5 text-[#4C392D]">{receipt.orderId}</dd>
                    </div>
                    {isPaid && receipt.paymentId && (
                      <div className="flex items-center gap-3 py-3.5 sm:gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#C8A84B]"><CreditCard size={17} aria-hidden="true" /></span>
                        <dt className="shrink-0 text-sm text-[#6B4423]">{copy.paymentReference}</dt>
                        <dd className="ml-auto max-w-[62%] break-all text-right font-mono text-[11px] leading-5 text-[#4C392D]">{receipt.paymentId}</dd>
                      </div>
                    )}
                  </dl>
                ) : orderId ? (
                  <p className="break-all border-t border-dashed border-[#E3D3B7] pt-4 text-sm text-[#6B4423]">{copy.orderReference}: <span className="font-mono text-xs text-[#4C392D]">{orderId}</span></p>
                ) : (
                  <p className="text-sm leading-6 text-[#6B4423]">Your order details will appear here once we can verify your checkout.</p>
                )}

                <div aria-live="polite" className={`mt-6 flex items-center gap-3 rounded-2xl p-4 sm:p-5 ${isPaid ? "bg-[#EEF4E9]" : "bg-[#F7F0E4]"}`}>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isPaid ? "bg-[#2D8A58] text-white" : "bg-[#F1E3C8] text-[#8B1E1E]"}`}>
                    {isPaid ? <ShieldCheck size={24} aria-hidden="true" /> : isChecking || state === "pending" ? <Clock3 size={22} aria-hidden="true" /> : <ShieldCheck size={22} aria-hidden="true" />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#2A1400]">{isPaid ? "Payment successful" : isChecking ? "Checking your payment" : state === "pending" ? "Payment confirmation pending" : "Need help confirming?"}</p>
                    <p className="mt-0.5 text-sm leading-5 text-[#6B4423]">{isPaid ? "Your payment has been securely processed." : description}</p>
                  </div>
                </div>
              </div>
            </section>

            <section aria-label="Payment confirmation" aria-live="polite" className="order-1 bg-white px-5 py-7 sm:px-8 sm:py-9 lg:order-2 lg:px-10 lg:py-10">
              <div className="mb-7 flex items-start gap-4 sm:mb-8">
                <span className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isPaid ? "bg-[#19965A] text-white" : "bg-[#F4EADF] text-[#8B1E1E]"}`}>
                  {isPaid ? <Check size={25} strokeWidth={2.5} aria-hidden="true" /> : isChecking || state === "pending" ? <Clock3 size={23} aria-hidden="true" /> : <ShieldCheck size={23} aria-hidden="true" />}
                </span>
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B1E1E]">{isPaid ? "Payment received" : isChecking ? "Secure payment check" : "Payment support"}</p>
                  <h1 className="font-serif text-[30px] font-medium leading-tight text-[#2A1400] sm:text-4xl">{isPaid && receipt?.name ? <>Thank you, <span className="text-[#8B1E1E]">{receipt.name}</span></> : title}</h1>
                  {isPaid && receipt?.name && <p className="mt-1 text-lg font-semibold text-[#C8A84B]">Your order is confirmed!</p>}
                  <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#6B4423]">{description}</p>
                </div>
                {isPaid && <Sparkles className="mt-2 hidden shrink-0 text-[#B9782E] sm:block" size={23} aria-hidden="true" />}
              </div>

              {isPaid ? (
                <div className="mb-7 rounded-2xl border border-[#E8D8B8] bg-[#FFFCF6] p-5 sm:mb-8 sm:p-6">
                  <h2 className="mb-5 flex items-center gap-2.5 font-serif text-2xl font-semibold text-[#2A1400]">
                    <Sparkles size={20} className="text-[#C8A84B]" aria-hidden="true" /> {copy.next}?
                  </h2>
                  <ol className="relative space-y-5 before:absolute before:bottom-5 before:left-[15px] before:top-5 before:border-l-2 before:border-dashed before:border-[#D9B681]">
                    {[
                      { title: "Payment received", detail: copy.stepOne },
                      { title: "Our team prepares your report", detail: "Our team will review your details and prepare your personalized Surbhi Kundali report." },
                      { title: "Report delivered to you", detail: "When it’s ready, we’ll send it on WhatsApp and by email if you provided an email address." },
                    ].map((step, index) => (
                      <li key={step.title} className="relative flex gap-3.5 sm:gap-4">
                        <span className="z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6C9A4] bg-[#F9EAE2] text-xs font-semibold text-[#8B1E1E]">0{index + 1}</span>
                        <div className="pt-0.5">
                          <h3 className="font-serif text-base font-semibold leading-5 text-[#2A1400]">{step.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-[#6B4423]">{step.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="mb-7 rounded-2xl border border-[#E8D8B8] bg-[#FFFCF6] p-5 sm:mb-8 sm:p-6">
                  <p className="mb-5 text-sm leading-6 text-[#6B4423]">{copy.pendingHelp}</p>
                  {state !== "unavailable" && (
                    <button onClick={() => setRetry((count) => count + 1)} disabled={isChecking} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#B99B74] px-4 text-sm font-semibold text-[#5D3522] transition hover:bg-[#FBF5EB] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E1E]">
                      <RotateCcw size={16} aria-hidden="true" /> {isChecking ? copy.checkingButton : copy.checkAgain}
                    </button>
                  )}
                </div>
              )}

              <div className="border-t border-[#E8D8B8] pt-5 sm:pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <Headset size={22} className="text-[#C8A84B]" aria-hidden="true" />
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-[#2A1400]">Need Help?</h2>
                    <p className="text-sm text-[#6B4423]">We’re here to assist you with any questions.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#8B1E1E] px-6 text-sm font-semibold text-white transition hover:bg-[#741818] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E1E] sm:w-auto">
                    <MessageCircle size={17} aria-hidden="true" /> {copy.whatsapp} <span aria-hidden="true">→</span>
                  </a>
                  <a href={emailUrl} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#D7B17D] px-6 text-sm font-semibold text-[#6B3924] underline decoration-[#C8A77D] underline-offset-4 transition hover:bg-[#FBF5EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B1E1E] sm:w-auto">
                    <Mail size={16} aria-hidden="true" /> {copy.email}
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-[#DCC9A8] pt-4 text-xs text-[#806E5D] sm:flex-row">
          <span>info@surabhiastrology.com</span>
          <Link href="/" className="font-semibold text-[#6B4423] underline decoration-[#C8A77D] underline-offset-4">{copy.returnHome}</Link>
        </footer>
      </div>
      </div>
    </main>
  );
}
