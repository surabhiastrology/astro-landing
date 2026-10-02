"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dayjs, { type Dayjs } from "dayjs";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => Promise<void>;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: unknown) => void) => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

// ==========================================
// 1. QUESTION DATABASE
// ==========================================
const QUESTION_DATA = {
  health: {
    label: { hindi: "🔮 Health (स्वास्थ्य)", english: "🔮 Health" },
    questions: [
      { hi: "क्या मेरी कुंडली में कोई hidden health issue दिख रहा है जिस पर मुझे अभी ध्यान देना चाहिए?", en: "Is there any hidden health issue in my birth chart that I should focus on right now?" },
      { hi: "मेरी energy बार-बार low क्यों रहती है — क्या ये ग्रहों का असर है?", en: "Why is my energy frequently low — is it due to planetary influence?" },
      { hi: "क्या आने वाले समय में मेरी health improve होगी या मुझे सावधान रहना चाहिए?", en: "Will my health improve in the future or should I remain cautious?" },
      { hi: "क्या मेरी कुंडली में कोई chronic problem का संकेत है?", en: "Is there an indication of any chronic problem in my birth chart?" }
    ]
  },
  business: {
    label: { hindi: "💼 Business (बिज़नेस)", english: "💼 Business" },
    questions: [
      { hi: "क्या मेरा business सही direction में जा रहा है या मुझे change करना चाहिए?", en: "Is my business heading in the right direction or should I change it?" },
      { hi: "क्या मेरे लिए partnership फायदेमंद है या नुकसान करेगी?", en: "Is a business partnership beneficial for me or will it cause losses?" },
      { hi: "आने वाले 6 महीनों में business growth के chances कैसे हैं?", en: "What are the chances of business growth in the next 6 months?" },
      { hi: "क्या मेरे नाम/brand में numerology के हिसाब से बदलाव जरूरी है?", en: "Is a change in my name/brand necessary according to numerology?" }
    ]
  },
  career: {
    label: { hindi: "🎯 Career (करियर / जॉब)", english: "🎯 Career" },
    questions: [
      { hi: "क्या मुझे job change करना चाहिए या current job में growth मिलेगी?", en: "Should I change my job or will I find growth in my current job?" },
      { hi: "मेरे लिए private job सही है या business ज्यादा successful रहेगा?", en: "Is a private job right for me or will business be more successful?" },
      { hi: "Promotion या salary hike कब तक possible है?", en: "By when is a promotion or salary hike possible for me?" },
      { hi: "क्या मेरा career stable रहेगा या बार-बार बदलाव आएंगे?", en: "Will my career remain stable or will there be frequent changes?" }
    ]
  },
  marriage: {
    label: { hindi: "💑 Marriage (शादी / रिलेशनशिप)", english: "💑 Marriage" },
    questions: [
      { hi: "मेरी शादी कब तक होने के योग हैं?", en: "By when are the chances of my marriage likely?" },
      { hi: "क्या मेरा love marriage होगा या arrange marriage?", en: "Will I have a love marriage or an arranged marriage?" },
      { hi: "क्या मेरे relationship में कोई hidden problem है जो future में issue बन सकती है?", en: "Is there a hidden problem in my relationship that could cause issues later?" },
      { hi: "क्या मेरे life partner supportive होंगे?", en: "Will my life partner be supportive?" }
    ]
  },
  life: {
    label: { hindi: "🌟 Life (जनरल लाइफ / भाग्य)", english: "🌟 Life" },
    questions: [
      { hi: "क्या मेरा आने वाला समय lucky रहने वाला है?", en: "Is my upcoming time going to be lucky?" },
      { hi: "क्या मेरे जीवन में कोई बड़ा turning point आने वाला है?", en: "Is there a major turning point coming in my life?" },
      { hi: "क्या मेरी कुंडली में financial stability के strong योग हैं?", en: "Are there strong indications of financial stability in my chart?" },
      { hi: "मुझे किस चीज़ पर सबसे ज्यादा focus करना चाहिए life में?", en: "What should I focus on most in my life?" }
    ]
  }
};

const Label = ({
  children,
  htmlFor,
  required = true,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}) => (
  <label htmlFor={htmlFor} className="block text-sm font-semibold text-[#4A2E10] mb-2 leading-5">
    {children}{required && <> <span className="text-[#8B1E1E]" aria-hidden="true">*</span></>}
  </label>
);

const PICKER_FIELD_SX = {
  width: "100%",
  "& .MuiPickersInputBase-root": {
    boxSizing: "border-box",
    height: 52,
    minHeight: 52,
    borderRadius: "0.75rem",
    backgroundColor: "#FCF7EE",
    color: "#2A1400",
    transition: "box-shadow 150ms ease, background-color 150ms ease",
  },
  "& .MuiPickersInputBase-root .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: "#E8D8B8",
    borderWidth: 1,
  },
  "& .MuiPickersInputBase-root:hover .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: "#C8A84B",
  },
  "& .MuiPickersInputBase-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: "#C8A84B",
    borderWidth: 1,
  },
  "& .MuiPickersInputBase-root.Mui-focused": {
    boxShadow: "0 0 0 2px rgba(200, 168, 75, 0.5)",
  },
  "& .MuiPickersSectionList-root": {
    color: "#2A1400",
    fontFamily: "inherit",
    fontSize: "16px",
    lineHeight: "24px",
    padding: "13px 0",
    opacity: 1,
  },
  "& .MuiPickersSectionList-sectionContent[aria-valuetext='Empty']": {
    color: "#6B7280",
  },
  "& .MuiInputAdornment-root .MuiIconButton-root": {
    minWidth: 44,
    minHeight: 44,
    color: "#2A1400",
  },
};

function parseDatePickerValue(value: string): Dayjs | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const localDate = new Date(year, month - 1, day, 12);

  if (
    localDate.getFullYear() !== year ||
    localDate.getMonth() !== month - 1 ||
    localDate.getDate() !== day
  ) {
    return null;
  }

  return dayjs(localDate);
}

function parseTimePickerValue(value: string): Dayjs | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return dayjs(new Date(2000, 0, 1, hours, minutes));
}

function FieldError({ field, message }: { field: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={`${field}-error`} aria-live="polite" className="mt-1.5 text-sm font-medium text-[#A32424]">
      {message}
    </p>
  );
}

type PickerFieldProps = {
  field: string;
  label: string;
  value: string;
  error?: string;
  onValueChange: (value: string) => void;
  onValidationError: (message: string | null) => void;
  onFocus: () => void;
};

function BirthDatePickerField({
  field,
  label,
  value,
  error,
  onValueChange,
  onValidationError,
  onFocus,
}: PickerFieldProps) {
  return (
    <div>
      <Label htmlFor={field}>{label}</Label>
      <MobileDatePicker
        name={field}
        value={parseDatePickerValue(value)}
        onChange={(newValue, context) => {
          onFocus();
          if (!newValue) onValueChange("");
          else if (newValue.isValid() && !context.validationError) onValueChange(newValue.format("YYYY-MM-DD"));
        }}
        onError={(reason) => {
          onValidationError(
            reason
              ? reason === "invalidDate"
                ? "Choose a valid date of birth."
                : "Choose a date between 1 Jan 1900 and today."
              : null,
          );
        }}
        format="DD/MM/YYYY"
        views={["year", "month", "day"]}
        openTo="year"
        yearsOrder="desc"
        minDate={dayjs(new Date(1900, 0, 1))}
        maxDate={dayjs()}
        slotProps={{
          textField: {
            id: field,
            fullWidth: true,
            required: true,
            error: Boolean(error),
            onFocus,
            sx: PICKER_FIELD_SX,
            slotProps: { htmlInput: { "aria-describedby": error ? `${field}-error` : undefined } },
          },
        }}
      />
      <FieldError field={field} message={error} />
    </div>
  );
}

function BirthTimePickerField({
  field,
  label,
  value,
  error,
  onValueChange,
  onValidationError,
  onFocus,
}: PickerFieldProps) {
  return (
    <div>
      <Label htmlFor={field}>{label}</Label>
      <MobileTimePicker
        name={field}
        value={parseTimePickerValue(value)}
        onChange={(newValue, context) => {
          onFocus();
          if (!newValue) onValueChange("");
          else if (newValue.isValid() && !context.validationError) onValueChange(newValue.format("HH:mm"));
        }}
        onError={(reason) => onValidationError(reason ? "Choose a valid time of birth." : null)}
        ampm
        format="hh:mm A"
        views={["hours", "minutes"]}
        slotProps={{
          textField: {
            id: field,
            fullWidth: true,
            required: true,
            error: Boolean(error),
            onFocus,
            sx: PICKER_FIELD_SX,
            slotProps: { htmlInput: { "aria-describedby": error ? `${field}-error` : undefined } },
          },
        }}
      />
      <FieldError field={field} message={error} />
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const urlService = searchParams.get("service");
  const urlPlan = searchParams.get("plan");
  
  const serviceName = urlService ? decodeURIComponent(urlService) : "Premium Personalized Kundali";
  const planName = urlPlan ? decodeURIComponent(urlPlan) : "10-Year Report (₹999)";

  const hasStartedForm = useRef(false);

  const isMatchmaking = serviceName.toLowerCase().includes("couple match making");
  
  // FIXED: Dynamic detection for ANY plan containing 1Q, 1 Question, or Hindi equivalents
  const planNameLower = planName.toLowerCase();
  const showQuestionDropdown = 
    planNameLower.includes("1q") || 
    planNameLower.includes("1 q") || 
    planNameLower.includes("question") || 
    planNameLower.includes("प्रश्न");

  let basePrice = 999;
  const priceMatch = planName.match(/₹([\d,]+)/);
  if (priceMatch && priceMatch[1]) {
    basePrice = parseInt(priceMatch[1].replace(/,/g, ""), 10);
  }

  const cleanPlanName = planName.replace(/\s*\(₹[\d,]+\)/, "");
  const fullReportType = `${serviceName} - ${cleanPlanName}`;

  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: serviceName,
        value: basePrice,
        currency: 'INR'
      });
    }
  }, [serviceName, basePrice]);

  const [form, setForm] = useState({
    name: "",      
    email: "",     
    phone: "",     
    reportType: fullReportType, 
    dob: "",       
    tob: "",       
    city: "",      
    pinCode: "",   
    gender: "",    
    language: "hindi",
    challenge: isMatchmaking ? "Matchmaking Analysis Request" : "",
    partnerName: "",
    partnerDob: "",
    partnerTob: "",
    partnerCity: "",
    partnerGender: ""
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState("");
  const finalAmount = basePrice; 

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const trackFormStart = () => {
    if (!hasStartedForm.current) {
      if (window.fbq) {
        window.fbq('trackCustom', 'FormFillStarted', {
          service: serviceName,
          plan: planName
        });
      }
      hasStartedForm.current = true;
    }
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handlePickerValueChange = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    clearFieldError(field);
  };

  const handlePickerValidationError = (field: string, message: string | null) => {
    if (message) setFieldErrors((current) => ({ ...current, [field]: message }));
    else clearFieldError(field);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    trackFormStart();
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
    clearFieldError(e.target.name);
  };

  const handlePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const pickerFields = ["dob", "tob", "partnerDob", "partnerTob"];
    const nextErrors: Record<string, string> = Object.fromEntries(
      pickerFields.flatMap((field) => fieldErrors[field] ? [[field, fieldErrors[field]]] : []),
    );
    if (!form.phone.trim()) nextErrors.phone = "Enter your WhatsApp number.";
    if (!form.email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.name.trim()) nextErrors.name = "Enter your full name.";
    if (!form.dob.trim()) nextErrors.dob = "Choose your date of birth.";
    else if (!parseDatePickerValue(form.dob)) nextErrors.dob = "Choose a valid date of birth.";
    if (!form.tob.trim()) nextErrors.tob = "Choose your time of birth.";
    else if (!parseTimePickerValue(form.tob)) nextErrors.tob = "Choose a valid time of birth.";
    if (!form.city.trim()) nextErrors.city = "Enter your place of birth.";
    if (!form.pinCode.trim()) nextErrors.pinCode = "Enter your PIN code.";
    if (!form.gender.trim()) nextErrors.gender = "Choose an option.";

    if (isMatchmaking) {
      if (!form.partnerName.trim()) nextErrors.partnerName = "Enter your partner's name.";
      if (!form.partnerDob.trim()) nextErrors.partnerDob = "Choose your partner's date of birth.";
      else if (!parseDatePickerValue(form.partnerDob)) nextErrors.partnerDob = "Choose a valid date of birth.";
      if (!form.partnerTob.trim()) nextErrors.partnerTob = "Choose your partner's time of birth.";
      else if (!parseTimePickerValue(form.partnerTob)) nextErrors.partnerTob = "Choose a valid time of birth.";
      if (!form.partnerCity.trim()) nextErrors.partnerCity = "Enter your partner's place of birth.";
      if (!form.partnerGender.trim()) nextErrors.partnerGender = "Choose an option.";
    }

    if (!form.challenge.trim()) nextErrors.challenge = "Choose or enter your question to continue.";
    if (!agreedToTerms) nextErrors.terms = "Confirm the details and agree to the terms to continue.";

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = document.getElementById(Object.keys(nextErrors)[0]);
      if (firstInvalidField) {
        firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalidField.focus({ preventScroll: true });
      }
      return;
    }

    setPaymentError("");
    if (window.fbq) {
      window.fbq('trackCustom', 'ClickPaySecurely', {
        content_name: form.reportType,
        value: finalAmount,
        currency: 'INR'
      });
    }

    if (window.fbq) {
      window.fbq('track', 'AddPaymentInfo', {
        content_name: form.reportType,
        value: finalAmount,
        currency: 'INR'
      });
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const Razorpay = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
    if (!razorpayKey || !Razorpay) {
      setPaymentError("Secure checkout is still loading. Please wait a moment and try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: finalAmount, 
          form: form 
        }),
      });

      if (!res.ok) throw new Error("Order creation request failed");
      const order = await res.json() as { id?: unknown; amount?: unknown };
      if (!order?.id || !order?.amount) throw new Error("Order response was incomplete");
      if (typeof order.id !== "string" || typeof order.amount !== "number") {
        throw new Error("Order response had an unexpected format");
      }

      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: order.amount,
        currency: "INR",
        name: "Astro Surbhi Gupta",
        description: form.reportType, 
        order_id: order.id,
        handler: async function (response: RazorpayPaymentResponse) {
          if (window.fbq) {
            window.fbq('track', 'Purchase', {
              value: finalAmount,
              currency: 'INR',
              content_name: form.reportType
            });
          }

          await fetch("/api/payment-success", {
            method: "POST",
            body: JSON.stringify({ ...response, form, finalAmount }),
          });
          window.location.href = "/success";
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#8B1E1E" },
        modal: {
          ondismiss: () => setPaymentError("Payment was not completed. Your details are still here if you'd like to try again."),
        },
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", () => {
        setPaymentError("The payment could not be completed. Your details are still here—please try again or use another payment method.");
      });
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setPaymentError("We couldn't open secure checkout. Your details are still here—please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full min-h-[52px] bg-[#FCF7EE] border border-[#E8D8B8] rounded-xl px-3.5 py-3 text-base text-[#2A1400] focus:outline-none focus:ring-2 focus:ring-[#C8A84B]/50 transition-all placeholder:text-gray-500";
  const matchmakingInputClass = "w-full min-h-[48px] bg-transparent border-b border-[#E8D8B8] px-2 py-2 text-base text-[#2A1400] focus:outline-none focus:border-[#8B1E1E] transition-all placeholder:text-gray-500 mb-2";

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-start px-4">
      
      {/* ================= LEFT: PRODUCT SUMMARY ================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 shadow-[0_15px_40px_rgba(61,22,0,0.06)] border border-[#E8D8B8]/50 lg:sticky lg:top-8">
        <div className="w-full aspect-[16/9] sm:aspect-[4/3] bg-[#FCF7EE] rounded-2xl flex items-center justify-center border border-[#E8D8B8] mb-5 sm:mb-8 overflow-hidden relative">
          <Image src="/surbhi-narendra.JPG" alt={serviceName} className="h-full object-cover object-left mix-blend-multiply drop-shadow-2xl" fill priority />
        </div>
        <div className="inline-block bg-[#8B1E1E]/10 text-[#8B1E1E] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-md mb-3">Order Summary</div>
        <h2 className="text-2xl lg:text-3xl font-bold text-[#2A1400] font-serif mb-2">{serviceName}</h2>
        <h3 className="text-lg text-[#C8A84B] font-bold mb-4 uppercase tracking-wide">Plan: {cleanPlanName}</h3>
        <p className="text-[#8B1E1E] text-4xl font-extrabold pb-6 border-b border-[#E8D8B8]">₹{basePrice}</p>
        <ul className="text-sm text-[#6B4423] space-y-3 mt-6">
          <li className="flex items-start gap-3 font-medium">✓ Authentic Vedic Analysis</li>
          <li className="flex items-start gap-3 font-medium">✓ 100% Confidential</li>
          <li className="flex items-start gap-3 font-medium">✓ Personal Guidance by Surbhi&apos;s Team</li>
        </ul>
        <div className="mt-8 bg-[#FFFBF0] border border-[#C8A84B]/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <p className="text-xs text-[#4A2E10] leading-relaxed font-medium">
            <strong>100% Secure Checkout.</strong> Your personal details are encrypted and kept strictly confidential.
          </p>
        </div>
      </div>

      {/* ================= RIGHT: CHECKOUT FORM ================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 shadow-[0_15px_40px_rgba(61,22,0,0.06)] border border-[#E8D8B8]/50">
        <h3 className="text-xl font-bold text-[#2A1400] mb-6 font-serif border-b border-[#E8D8B8] pb-4 text-center">
          {isMatchmaking ? "Matchmaking Calculator" : "Birth Details & Delivery Info"}
        </h3>

        <form className="space-y-6" onSubmit={handlePayment} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="phone">WhatsApp Number</Label>
              <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "phone-error" : undefined} placeholder="+91 98765 43210" className={inputClass} onChange={handleChange} onFocus={trackFormStart} />
              <FieldError field="phone" message={fieldErrors.phone} />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "email-error" : undefined} placeholder="you@example.com" className={inputClass} onChange={handleChange} onFocus={trackFormStart} />
              <FieldError field="email" message={fieldErrors.email} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="reportType" required={false}>Selected Package</Label>
              <input 
                id="reportType"
                name="reportType" 
                value={form.reportType} 
                title={form.reportType}
                readOnly 
                className={`${inputClass} bg-[#F4EAD6] text-[#6B4423] cursor-not-allowed border-transparent text-ellipsis overflow-hidden`} 
              />
            </div>
            <div>
              <Label htmlFor="language">Report Language</Label>
              <select id="language" required name="language" className={inputClass} value={form.language} onChange={handleChange}>
                <option value="hindi">Hindi (हिंदी)</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>

          <div className="space-y-5 pt-4">
            <h4 className="font-bold text-[#8B1E1E] text-sm uppercase tracking-widest border-l-4 border-[#8B1E1E] pl-3">
              {isMatchmaking ? "Person 1 Details (You)" : "Birth Details"}
            </h4>
            <div className={isMatchmaking ? "grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4" : "space-y-4"}>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "name-error" : undefined} placeholder="Enter your full name" className={isMatchmaking ? matchmakingInputClass : inputClass} onChange={handleChange} onFocus={trackFormStart} />
                <FieldError field="name" message={fieldErrors.name} />
              </div>
              
              <div className={isMatchmaking ? "block" : "grid grid-cols-1 min-[440px]:grid-cols-2 gap-4 sm:gap-5"}>
                <BirthDatePickerField
                  field="dob"
                  label="Date of Birth"
                  value={form.dob}
                  error={fieldErrors.dob}
                  onValueChange={(value) => handlePickerValueChange("dob", value)}
                  onValidationError={(message) => handlePickerValidationError("dob", message)}
                  onFocus={trackFormStart}
                />
                <BirthTimePickerField
                  field="tob"
                  label="Time of Birth"
                  value={form.tob}
                  error={fieldErrors.tob}
                  onValueChange={(value) => handlePickerValueChange("tob", value)}
                  onValidationError={(message) => handlePickerValidationError("tob", message)}
                  onFocus={trackFormStart}
                />
              </div>
              <div className={isMatchmaking ? "block" : "grid grid-cols-1 sm:grid-cols-2 gap-5"}>
                <div className="mb-4">
                   <Label htmlFor="city">Place of Birth</Label>
                   <input id="city" required name="city" aria-invalid={Boolean(fieldErrors.city)} aria-describedby={fieldErrors.city ? "city-error" : undefined} placeholder="Search or enter place of birth" className={isMatchmaking ? matchmakingInputClass : inputClass} onChange={handleChange} onFocus={trackFormStart} />
                   <FieldError field="city" message={fieldErrors.city} />
                </div>
                <div>
              <Label htmlFor="pinCode">PIN Code</Label>
              <input id="pinCode" required name="pinCode" inputMode="numeric" autoComplete="postal-code" aria-invalid={Boolean(fieldErrors.pinCode)} aria-describedby={fieldErrors.pinCode ? "pinCode-error" : undefined} placeholder="e.g. 110001" className={inputClass} onChange={handleChange} onFocus={trackFormStart} />
              <FieldError field="pinCode" message={fieldErrors.pinCode} />
            </div>
                <div>
                   <Label htmlFor="gender">Gender</Label>
                   <select id="gender" required name="gender" aria-invalid={Boolean(fieldErrors.gender)} aria-describedby={fieldErrors.gender ? "gender-error" : undefined} className={isMatchmaking ? matchmakingInputClass : inputClass} onChange={handleChange} onFocus={trackFormStart}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                   </select>
                   <FieldError field="gender" message={fieldErrors.gender} />
                </div>
              </div>
            </div>
          </div>

          {isMatchmaking && (
            <div className="space-y-5 pt-6 border-t border-[#E8D8B8]/30">
              <h4 className="font-bold text-[#8B1E1E] text-sm uppercase tracking-widest border-l-4 border-[#8B1E1E] pl-3">
                Person 2 Details (Partner)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <Label htmlFor="partnerName">Partner&apos;s Name</Label>
                  <input id="partnerName" name="partnerName" autoComplete="off" required aria-invalid={Boolean(fieldErrors.partnerName)} aria-describedby={fieldErrors.partnerName ? "partnerName-error" : undefined} placeholder="Enter partner's name" className={matchmakingInputClass} onChange={handleChange} />
                  <FieldError field="partnerName" message={fieldErrors.partnerName} />
                </div>
                <BirthDatePickerField
                  field="partnerDob"
                  label="Partner's Date of Birth"
                  value={form.partnerDob}
                  error={fieldErrors.partnerDob}
                  onValueChange={(value) => handlePickerValueChange("partnerDob", value)}
                  onValidationError={(message) => handlePickerValidationError("partnerDob", message)}
                  onFocus={trackFormStart}
                />
                <BirthTimePickerField
                  field="partnerTob"
                  label="Partner's Time of Birth"
                  value={form.partnerTob}
                  error={fieldErrors.partnerTob}
                  onValueChange={(value) => handlePickerValueChange("partnerTob", value)}
                  onValidationError={(message) => handlePickerValidationError("partnerTob", message)}
                  onFocus={trackFormStart}
                />
                <div>
                  <Label htmlFor="partnerCity">Partner&apos;s Place of Birth</Label>
                  <input id="partnerCity" name="partnerCity" required aria-invalid={Boolean(fieldErrors.partnerCity)} aria-describedby={fieldErrors.partnerCity ? "partnerCity-error" : undefined} placeholder="Enter place of birth" className={matchmakingInputClass} onChange={handleChange} />
                  <FieldError field="partnerCity" message={fieldErrors.partnerCity} />
                </div>
                <div>
                   <Label htmlFor="partnerGender">Partner&apos;s Gender</Label>
                   <select id="partnerGender" name="partnerGender" required aria-invalid={Boolean(fieldErrors.partnerGender)} aria-describedby={fieldErrors.partnerGender ? "partnerGender-error" : undefined} className={matchmakingInputClass} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                   </select>
                   <FieldError field="partnerGender" message={fieldErrors.partnerGender} />
                </div>
              </div>
            </div>
          )}

          {/* FIXED: Dropdown now appears for ANY plan that includes a question */}
          {showQuestionDropdown && (
            <div className="pt-2">
              <Label htmlFor="challenge">Select Your 1 Primary Question</Label>
              <select id="challenge" name="challenge" required aria-invalid={Boolean(fieldErrors.challenge)} aria-describedby={fieldErrors.challenge ? "challenge-error" : undefined} className={`${inputClass} border-2 border-[#C8A84B]/30`} onChange={handleChange} onFocus={trackFormStart} value={form.challenge}>
                <option value="">-- Choose your question --</option>
                {Object.entries(QUESTION_DATA).map(([key, group]) => (
                  <optgroup key={key} label={form.language === 'hindi' ? group.label.hindi : group.label.english}>
                    {group.questions.map((q, idx) => (
                      <option key={idx} value={form.language === 'hindi' ? q.hi : q.en}>{form.language === 'hindi' ? q.hi : q.en}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <FieldError field="challenge" message={fieldErrors.challenge} />
            </div>
          )}

          {/* New Challenge TextArea: Shows only when dropdown is hidden and NOT matchmaking */}
          {!isMatchmaking && !showQuestionDropdown && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500 pt-2">
                <Label htmlFor="challenge">Current Challenge You Are Facing</Label>
                <textarea 
                  id="challenge"
                  name="challenge"
                  rows={4}
                  required
                  aria-invalid={Boolean(fieldErrors.challenge)}
                  aria-describedby={fieldErrors.challenge ? "challenge-error" : undefined}
                  placeholder="Describe your current situation, problem, or the specific question you want surbhi ji to look into..."
                  className={`${inputClass} resize-none`}
                  onChange={handleChange}
                  onFocus={trackFormStart}
                />
                <FieldError field="challenge" message={fieldErrors.challenge} />
            </div>
          )}

          <div className="mt-8 p-4 bg-[#FCF7EE] rounded-xl border border-[#E8D8B8]/50">
            <div className="flex items-start gap-3">
            <input type="checkbox" id="terms" required checked={agreedToTerms} aria-invalid={Boolean(fieldErrors.terms)} aria-describedby={fieldErrors.terms ? "terms-error" : undefined} onChange={(e) => { setAgreedToTerms(e.target.checked); if (e.target.checked) clearFieldError("terms"); }} onFocus={trackFormStart} className="mt-0.5 w-6 h-6 shrink-0 accent-[#8B1E1E]" />
            <label htmlFor="terms" className="text-sm text-[#6B4423]">I verify details are accurate. I agree to <Link href="/terms-and-conditions" className="text-[#8B1E1E] font-bold">Terms</Link>.</label>
            </div>
            <FieldError field="terms" message={fieldErrors.terms} />
          </div>

          {paymentError && <p role="alert" className="rounded-xl border border-[#A32424]/30 bg-[#FFF5F3] px-4 py-3 text-sm font-medium text-[#8B1E1E]">{paymentError}</p>}

          <button type="submit" disabled={loading} aria-busy={loading} className="w-full min-h-[58px] bg-gradient-to-r from-[#8B1E1E] to-[#5C1414] text-white px-4 py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-wait">
            {loading ? "Processing Securely..." : `Pay ₹${finalAmount} Securely`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#FCF7EE] font-sans text-[#2A1400] pb-20">
      <header className="bg-white border-b border-[#E8D8B8] py-5 px-4 mb-8 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="h-14 w-auto" />
            <div className="hidden sm:block text-[1.15rem] font-bold">Surbhi Gupta</div>
          </Link>
          <div className="text-[#1B4D30] font-bold text-xs uppercase bg-[#E6F5EE] px-3 py-1.5 rounded-full">Secure Checkout</div>
        </div>
      </header>
      <Suspense fallback={<div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1E1E]"></div></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
