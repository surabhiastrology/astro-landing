"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  DEFAULT_CHECKOUT_PLAN,
  getCheckoutPlan,
} from "@/lib/checkout-plans";
import dayjs, { type Dayjs } from "dayjs";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import Select from "@mui/material/Select";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import { APPROXIMATE_BIRTH_TIME_RANGES, isApproximateBirthTimeRange } from "@/lib/birth-time";

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

type FieldIconName = "mail" | "lock" | "package" | "globe" | "person" | "calendar" | "clock" | "pin" | "hash" | "message" | "info";

function FieldIcon({ name, className = "h-4 w-4 shrink-0 text-[#C8A84B]" }: { name: FieldIconName; className?: string }) {
  const paths: Record<FieldIconName, React.ReactNode> = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v3" /></>,
    package: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7m-7 4h7" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    person: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    hash: <><path d="M5 9h14M4 15h14M10 4 8 20m8-16-2 16" /></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8 8 0 0 1-3.5-.8L4 20l1.2-3.4A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 3.1 8 7Z" /><path d="M8 12h8m-8 3h5" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  };

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function RequiredMark() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" className="h-2.5 w-2.5 shrink-0 text-[#8B1E1E]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M8 2v12M2.8 5l10.4 6M2.8 11 13.2 5" />
    </svg>
  );
}

const Label = ({
  children,
  htmlFor,
  id,
  required = true,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  id?: string;
  required?: boolean;
}) => (
  <label id={id} htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold leading-5 text-black sm:text-sm">
    {children}{required && <> <RequiredMark /></>}
  </label>
);

type FieldInputProps = React.InputHTMLAttributes<HTMLInputElement> & { leadingIcon?: FieldIconName };

function FieldInput({ leadingIcon, className = "", ...props }: FieldInputProps) {
  return (
    <div className={leadingIcon ? "relative" : undefined}>
      {leadingIcon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2">
          <FieldIcon name={leadingIcon} />
        </span>
      )}
      <input {...props} className={`${className}${leadingIcon ? " pl-10" : ""}`} />
    </div>
  );
}

function FieldTextarea({ leadingIcon, className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { leadingIcon?: FieldIconName }) {
  return (
    <div className={leadingIcon ? "relative" : undefined}>
      {leadingIcon && (
        <span className="pointer-events-none absolute left-3.5 top-3.5 z-10">
          <FieldIcon name={leadingIcon} />
        </span>
      )}
      <textarea {...props} className={`${className}${leadingIcon ? " pl-10" : ""}`} />
    </div>
  );
}

function SelectChevron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SELECT_SX = {
  width: "100%",
  minHeight: 48,
  backgroundColor: "#FCF7EE",
  borderRadius: "0.5rem",
  color: "#2A1400",
  transition: "box-shadow 150ms ease, background-color 150ms ease",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E8D8B8", borderWidth: 1 },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#C8A84B" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#C8A84B", borderWidth: 1 },
  "&.Mui-focused": { boxShadow: "0 0 0 2px rgba(200, 168, 75, 0.35)" },
  "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: "#DC2626" },
  "& .MuiSelect-select": {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    minHeight: "48px !important",
    padding: "10px 38px 10px 14px !important",
    fontSize: "16px",
    lineHeight: "24px",
    whiteSpace: "normal",
  },
  "& .MuiSelect-icon": { color: "#8B1E1E", right: 10, width: 20, height: 20 },
  "@media (min-width: 640px)": {
    minHeight: 52,
    "& .MuiSelect-select": {
      minHeight: "52px !important",
      padding: "13px 38px 13px 14px !important",
    },
  },
};

const SELECT_MENU_PROPS = {
  slotProps: {
    paper: {
      sx: {
        maxHeight: 320,
        border: "1px solid #E8D8B8",
        borderRadius: "12px",
        boxShadow: "0 12px 32px rgba(61, 22, 0, 0.16)",
        "& .MuiMenuItem-root": { color: "#2A1400" },
        "& .MuiMenuItem-root.Mui-selected": { backgroundColor: "#F4EAD6" },
        "& .MuiMenuItem-root.Mui-selected:hover": { backgroundColor: "#EBD8B1" },
        "& .MuiMenuItem-root:hover, & .MuiMenuItem-root.Mui-focusVisible": { backgroundColor: "#FFFBF0" },
      },
    },
    list: { sx: { py: 0.5 } },
  },
};

type StyledSelectFieldProps = {
  id: string;
  labelId: string;
  name?: string;
  value: string;
  placeholder?: string;
  error?: boolean;
  errorId?: string;
  ariaLabel: string;
  required?: boolean;
  compact?: boolean;
  leadingIcon?: FieldIconName;
  onChange: (value: string) => void;
  onFocus?: () => void;
  children: React.ReactNode;
};

function StyledSelectField({
  id,
  labelId,
  name,
  value,
  placeholder,
  error = false,
  errorId,
  ariaLabel,
  required = false,
  compact = false,
  leadingIcon,
  onChange,
  onFocus,
  children,
}: StyledSelectFieldProps) {
  const selectSx = compact ? {
    ...SELECT_SX,
    minHeight: 48,
    "& .MuiSelect-select": {
      ...SELECT_SX["& .MuiSelect-select"],
      minHeight: "48px !important",
      padding: `${leadingIcon ? "10px 20px 10px 0" : "10px 20px 10px 8px"} !important`,
      fontSize: "14px",
      lineHeight: "20px",
    },
    "& .MuiSelect-icon": { color: "#8B1E1E", right: 2, width: 16, height: 16 },
  } : {
    ...SELECT_SX,
    "& .MuiSelect-select": {
      ...SELECT_SX["& .MuiSelect-select"],
      padding: `${leadingIcon ? "10px 38px 10px 0" : "10px 38px 10px 14px"} !important`,
    },
  };

  return (
    <div>
    <Select
      id={id}
      labelId={labelId}
      name={name}
      value={value}
      displayEmpty
      required={required}
      error={error}
      startAdornment={leadingIcon ? (
        <InputAdornment position="start" sx={{ ml: 0, mr: compact ? 0.75 : 1, pointerEvents: "none" }}>
          <FieldIcon name={leadingIcon} />
        </InputAdornment>
      ) : undefined}
      onChange={(event) => onChange(String(event.target.value))}
      onFocus={onFocus}
      IconComponent={SelectChevron}
      SelectDisplayProps={{
        "aria-label": ariaLabel,
        "aria-invalid": error,
        "aria-describedby": errorId,
      }}
      MenuProps={SELECT_MENU_PROPS}
      sx={selectSx}
    >
      {placeholder && (
        <MenuItem value="" disabled sx={{ minHeight: 44, color: "#6B7280", fontSize: 15 }}>
          {placeholder}
        </MenuItem>
      )}
      {children}
    </Select>
    </div>
  );
}

const PICKER_FIELD_SX = {
  width: "100%",
  "& .MuiPickersInputBase-root": {
    boxSizing: "border-box",
    height: 48,
    minHeight: 48,
    borderRadius: "0.5rem",
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
  "& .MuiPickersInputBase-root.Mui-error .MuiPickersOutlinedInput-notchedOutline": {
    borderColor: "#DC2626",
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
  "@media (min-width: 640px)": {
    "& .MuiPickersInputBase-root": {
      height: 52,
      minHeight: 52,
    },
    "& .MuiPickersSectionList-root": {
      padding: "13px 0",
    },
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
    <p id={`${field}-error`} aria-live="polite" className="mt-1.5 text-xs font-normal leading-4 text-[#DC2626]">
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

const MONTH_OPTIONS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function datePartsFromValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? { year: match[1], month: match[2], day: String(Number(match[3])) } : { year: "", month: "", day: "" };
}

function BirthDateSelectField({ field, label, value, error, onValueChange, onValidationError, onFocus }: PickerFieldProps) {
  const [parts, setParts] = useState(() => datePartsFromValue(value));
  const currentYear = new Date().getFullYear();
  const selectedYear = Number(parts.year) || 2000;
  const daysInMonth = parts.month ? new Date(selectedYear, Number(parts.month), 0).getDate() : 31;
  const dayOptions = Array.from({ length: daysInMonth }, (_, index) => String(index + 1));
  const yearOptions = Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index));

  const updatePart = (part: "day" | "month" | "year", nextValue: string) => {
    onFocus();
    const next = { ...parts, [part]: nextValue };
    const maxDay = next.month
      ? new Date(Number(next.year) || 2000, Number(next.month), 0).getDate()
      : 31;
    if ((part === "month" || part === "year") && Number(next.day) > maxDay) next.day = "";
    setParts(next);
    onValueChange("");
    onValidationError(null);

    if (!next.day || !next.month || !next.year) return;

    const year = Number(next.year);
    const month = Number(next.month);
    const day = Number(next.day);
    const date = new Date(year, month - 1, day, 12);
    const isValidDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    const isFuture = date > new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12);
    if (!isValidDate || isFuture) {
      onValidationError("Choose a valid date of birth that is not in the future.");
      return;
    }

    onValueChange(`${next.year}-${next.month}-${String(day).padStart(2, "0")}`);
  };

  const options = (items: string[]) => items.map((item) => (
    <MenuItem key={item} value={item} sx={{ minHeight: 44, fontSize: 15 }}>{item}</MenuItem>
  ));

  return (
    <div>
      <Label id={`${field}-label`} htmlFor={field}>{label}</Label>
      <span id={`${field}-day-label`} className="sr-only">Day</span>
      <span id={`${field}-month-label`} className="sr-only">Month</span>
      <span id={`${field}-year-label`} className="sr-only">Year</span>
      <div className="grid grid-cols-[0.85fr_1.25fr_1fr] gap-1.5 sm:gap-2">
        <StyledSelectField
          id={field}
          labelId={`${field}-label ${field}-day-label`}
          value={parts.day}
          placeholder="Day"
          ariaLabel="Day of birth"
          compact
          error={Boolean(error)}
          errorId={error ? `${field}-error` : undefined}
          onChange={(next) => updatePart("day", next)}
          onFocus={onFocus}
        >
          {options(dayOptions)}
        </StyledSelectField>
        <StyledSelectField
          id={`${field}-month`}
          labelId={`${field}-label ${field}-month-label`}
          value={parts.month}
          placeholder="Month"
          ariaLabel="Month of birth"
          compact
          error={Boolean(error)}
          errorId={error ? `${field}-error` : undefined}
          onChange={(next) => updatePart("month", next)}
          onFocus={onFocus}
        >
          {MONTH_OPTIONS.map((month, index) => (
            <MenuItem key={index + 1} value={String(index + 1).padStart(2, "0")} sx={{ minHeight: 44, fontSize: 15 }}>{month}</MenuItem>
          ))}
        </StyledSelectField>
        <StyledSelectField
          id={`${field}-year`}
          labelId={`${field}-label ${field}-year-label`}
          value={parts.year}
          placeholder="Year"
          ariaLabel="Year of birth"
          compact
          error={Boolean(error)}
          errorId={error ? `${field}-error` : undefined}
          onChange={(next) => updatePart("year", next)}
          onFocus={onFocus}
        >
          {options(yearOptions)}
        </StyledSelectField>
      </div>
      <FieldError field={field} message={error} />
    </div>
  );
}

function timePartsFromValue(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return { hour: "", minute: "", period: "" };
  const hour24 = Number(match[1]);
  return {
    hour: String(hour24 % 12 || 12),
    minute: match[2],
    period: hour24 >= 12 ? "PM" : "AM",
  };
}

function BirthTimeSelectField({ field, label, value, error, onValueChange, onValidationError, onFocus }: PickerFieldProps) {
  const [parts, setParts] = useState(() => timePartsFromValue(value));
  const updatePart = (part: "hour" | "minute" | "period", nextValue: string) => {
    onFocus();
    const next = { ...parts, [part]: nextValue };
    setParts(next);
    onValidationError(null);
    if (!next.hour || !next.minute || !next.period) {
      onValueChange("");
      return;
    }

    const hour12 = Number(next.hour);
    const hour24 = (hour12 % 12) + (next.period === "PM" ? 12 : 0);
    onValueChange(`${String(hour24).padStart(2, "0")}:${next.minute}`);
  };

  return (
    <div>
      <Label id={`${field}-label`} htmlFor={field}>{label}</Label>
      <span id={`${field}-hour-label`} className="sr-only">Hour</span>
      <span id={`${field}-minute-label`} className="sr-only">Minute</span>
      <span id={`${field}-period-label`} className="sr-only">AM or PM</span>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <StyledSelectField
          id={field}
          labelId={`${field}-label ${field}-hour-label`}
          value={parts.hour}
          placeholder="Hour"
          ariaLabel="Birth hour"
          compact
          error={Boolean(error)}
          errorId={error ? `${field}-error` : undefined}
          onChange={(next) => updatePart("hour", next)}
          onFocus={onFocus}
        >
          {Array.from({ length: 12 }, (_, index) => String(index + 1)).map((hour) => (
            <MenuItem key={hour} value={hour} sx={{ minHeight: 44, fontSize: 15 }}>{hour}</MenuItem>
          ))}
        </StyledSelectField>
        <StyledSelectField
          id={`${field}-minute`}
          labelId={`${field}-label ${field}-minute-label`}
          value={parts.minute}
          placeholder="Min"
          ariaLabel="Birth minute"
          compact
          error={Boolean(error)}
          errorId={error ? `${field}-error` : undefined}
          onChange={(next) => updatePart("minute", next)}
          onFocus={onFocus}
        >
          {Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")).map((minute) => (
            <MenuItem key={minute} value={minute} sx={{ minHeight: 44, fontSize: 15 }}>{minute}</MenuItem>
          ))}
        </StyledSelectField>
        <StyledSelectField
          id={`${field}-period`}
          labelId={`${field}-label ${field}-period-label`}
          value={parts.period}
          placeholder="AM/PM"
          ariaLabel="Birth time AM or PM"
          compact
          error={Boolean(error)}
          errorId={error ? `${field}-error` : undefined}
          onChange={(next) => updatePart("period", next)}
          onFocus={onFocus}
        >
          <MenuItem value="AM" sx={{ minHeight: 44, fontSize: 15 }}>AM</MenuItem>
          <MenuItem value="PM" sx={{ minHeight: 44, fontSize: 15 }}>PM</MenuItem>
        </StyledSelectField>
      </div>
      <FieldError field={field} message={error} />
    </div>
  );
}

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
  
  // Query parameters select a product but never decide its price. Unknown or
  // edited links safely fall back to the default catalogue product.
  const checkoutPlan =
    getCheckoutPlan(urlService, urlPlan) ?? DEFAULT_CHECKOUT_PLAN;
  const serviceName = checkoutPlan.service;
  const planName = checkoutPlan.plan;

  const hasStartedForm = useRef(false);

  const isMatchmaking = serviceName.toLowerCase().includes("couple match making");
  
  // FIXED: Dynamic detection for ANY plan containing 1Q, 1 Question, or Hindi equivalents
  const planNameLower = planName.toLowerCase();
  const showQuestionDropdown = 
    planNameLower.includes("1q") || 
    planNameLower.includes("1 q") || 
    planNameLower.includes("question") || 
    planNameLower.includes("प्रश्न");

  const basePrice = checkoutPlan.amount;
  const cleanPlanName = planName;
  const fullReportType = checkoutPlan.reportType;

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
    tobAccuracy: "exact",
    tobApproximateRange: "",
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

  const [countryCode, setCountryCode] = useState("+91");
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

  const handleApproximateBirthTimeToggle = (checked: boolean) => {
    trackFormStart();
    setForm((current) => ({
      ...current,
      tob: "",
      tobAccuracy: checked ? "approximate" : "exact",
      tobApproximateRange: "",
    }));
    clearFieldError("tob");
    clearFieldError("tobApproximateRange");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    trackFormStart();
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
    clearFieldError(e.target.name);
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    trackFormStart();
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
    if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
    setForm((current) => ({ ...current, phone: digits.slice(0, 10) }));
    clearFieldError("phone");
  };

  const handleSelectValueChange = (field: string, value: string) => {
    trackFormStart();
    setForm((current) => ({ ...current, [field]: value }));
    clearFieldError(field);
  };

  const handlePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const pickerFields = ["dob", "partnerDob", "partnerTob", ...(form.tobAccuracy === "approximate" && !isMatchmaking ? ["tobApproximateRange"] : ["tob"])];
    const nextErrors: Record<string, string> = Object.fromEntries(
      pickerFields.flatMap((field) => fieldErrors[field] ? [[field, fieldErrors[field]]] : []),
    );
    if (!form.phone.trim()) nextErrors.phone = "Enter your WhatsApp number.";
    else if (!/^\d{10}$/.test(form.phone)) nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    if (!form.email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.name.trim()) nextErrors.name = "Enter your full name.";
    if (!form.dob.trim()) nextErrors.dob = "Choose your date of birth.";
    else if (!parseDatePickerValue(form.dob)) nextErrors.dob = "Choose a valid date of birth.";
    if (!isMatchmaking && form.tobAccuracy === "approximate") {
      if (!isApproximateBirthTimeRange(form.tobApproximateRange)) {
        nextErrors.tobApproximateRange = "Choose the closest estimated time range.";
      }
    } else if (!form.tob.trim()) nextErrors.tob = "Choose your time of birth.";
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
      const checkoutForm = { ...form, phone: `${countryCode}${form.phone}` };
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          form: checkoutForm
        }),
      });
      const order = await res.json() as { id?: unknown; amount?: unknown; receiptToken?: unknown; error?: unknown };
      if (!res.ok) {
        throw new Error(typeof order?.error === "string" ? order.error : "Unable to create the payment order.");
      }
      if (
        typeof order?.id !== "string" ||
        typeof order.amount !== "number" ||
        order.amount <= 0 ||
        typeof order.receiptToken !== "string" ||
        !/^[a-f0-9]{64}$/.test(order.receiptToken)
      ) {
        throw new Error("The payment order response was incomplete or invalid.");
      }

      sessionStorage.setItem(`order-receipt:${order.id}`, order.receiptToken);

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

          try {
            await fetch("/api/payment-success", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, form: checkoutForm }),
            });
          } catch (error) {
            console.error("Payment confirmation request failed; the receipt page will recheck Razorpay.", error);
          } finally {
            window.location.href = `/success?orderId=${encodeURIComponent(order.id as string)}`;
          }
        },
        prefill: { name: form.name, email: form.email, contact: checkoutForm.phone },
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

  const inputClass = "w-full min-h-[48px] bg-[#FCF7EE] border border-[#E8D8B8] aria-[invalid=true]:border-[#DC2626] rounded-lg px-3.5 py-2.5 text-base text-[#2A1400] focus:outline-none focus:ring-2 focus:ring-[#C8A84B]/50 transition-all placeholder:text-gray-500 sm:min-h-[52px] sm:py-3";
  const matchmakingInputClass = "w-full min-h-[48px] bg-transparent border-b border-[#E8D8B8] aria-[invalid=true]:border-b-[#DC2626] px-2 py-2 text-base text-[#2A1400] focus:outline-none focus:border-[#8B1E1E] transition-all placeholder:text-gray-500 mb-2";

  return (
    <>
    <div className="mx-auto grid max-w-[1320px] items-start gap-0 px-0 py-3 lg:grid-cols-[minmax(360px,0.86fr)_minmax(0,1.55fr)] lg:gap-5 lg:px-4 [&>div+div]:border-t [&>div+div]:border-[#E8D8B8] [&>div+div]:pt-6 [&>div+div]:mt-6 lg:[&>div+div]:mt-0 lg:[&>div+div]:border-t-0 lg:[&>div+div]:pt-0">
      
      {/* ================= LEFT: PRODUCT SUMMARY ================= */}
      <div className="lg:sticky lg:top-8">
      <div className="rounded-none border-0 bg-white p-5 shadow-none sm:rounded-3xl sm:border sm:border-[#E8D8B8]/50 sm:shadow-[0_15px_40px_rgba(61,22,0,0.06)] lg:p-6 xl:p-7">
        <div className="relative mb-5 flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#FCF7EE] sm:mb-6">
          <Image src="/surbhi-kundali-report-mobile-banner.png" alt="Premium Surbhi Kundali Report" className="object-contain" fill priority unoptimized sizes="(max-width: 1023px) 100vw, 40vw" />
        </div>
        <div className="mb-3 inline-block rounded-md bg-[#8B1E1E]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8B1E1E]">Order Summary</div>
        <h2 className="mb-2 font-serif text-2xl font-bold text-[#2A1400] lg:text-[30px]">{serviceName}</h2>
        <h3 className="mb-4 text-base font-bold uppercase tracking-wide text-[#C8A84B]">Plan: {cleanPlanName}</h3>
        <ul className="mt-5 space-y-3 text-sm text-[#2A1400]">
          {[
            "Authentic Vedic Analysis",
            "100% Confidential",
            "Personally prepared by Surbhi Gupta",
          ].map((benefit) => (
            <li key={benefit} className="flex items-center gap-2.5 font-medium">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C8A84B] text-white">
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                  <path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <div className="my-5 h-px bg-[#E8D8B8]" />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-sans text-[34px] font-bold leading-none text-[#8B1E1E]">₹{finalAmount.toLocaleString("en-IN")}</span>
          {basePrice === 999 && (
            <>
              <del className="text-lg font-medium text-[#9CA3AF]">₹2,999</del>
              <span className="rounded-full bg-[#F4EAD6] px-3 py-1 text-xs font-semibold text-[#8B1E1E]">Limited Offer</span>
            </>
          )}
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#FCF7EE] px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M20.52 3.48A11.79 11.79 0 0 0 12.13 0C5.58 0 .25 5.33.25 11.88c0 2.1.55 4.16 1.59 5.98L.15 24l6.29-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.15-3.5-8.44ZM12.14 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.73.98 1-3.64-.24-.37a9.88 9.88 0 1 1 8.38 4.62Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.51-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.1 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-[#2A1400]">Delivered on WhatsApp</p>
            <p className="mt-0.5 text-xs leading-4 text-[#6B7280]">Your report will be sent to you once it is ready.</p>
          </div>
        </div>
      </div>
      <blockquote className="hidden items-start gap-3 px-8 pt-7 lg:flex">
        <span className="font-serif text-5xl leading-none text-[#C8A84B]/60" aria-hidden="true">“</span>
        <p className="max-w-[290px] font-serif text-[22px] leading-tight text-[#6B4423]">Surbhi personally prepares your Kundali and answers the question that matters most to you.</p>
      </blockquote>
      </div>

      {/* ================= RIGHT: CHECKOUT FORM ================= */}
      <div className="rounded-none border-0 bg-white px-5 pb-5 shadow-none sm:rounded-3xl sm:border sm:border-[#E8D8B8]/50 sm:shadow-[0_15px_40px_rgba(61,22,0,0.06)] lg:px-7 lg:pb-7 xl:px-8 xl:pb-8" style={{ paddingTop: "clamp(48px, 3.5vw, 64px)" }}>
        <div className="mb-5 pb-4">
          <h3 className="font-serif text-2xl font-semibold leading-tight text-[#2A1400] sm:text-[30px]">
            {isMatchmaking ? "Matchmaking Calculator" : <>Complete <span className="font-normal not-italic text-[#8B1E1E]">Your Details</span></>}
          </h3>
          {!isMatchmaking && <p className="mt-1.5 text-sm leading-6 text-[#6B7280]">Your personalized Kundali report will be prepared using the information below.</p>}
        </div>

        <form id="checkout-form" className="space-y-5" onSubmit={handlePayment} noValidate>
          {!isMatchmaking && <div className="flex items-center gap-2.5 pb-0.5 text-xs font-bold uppercase tracking-[0.16em] text-[#C8A84B]"><FieldIcon name="person" /><span>Contact Information</span><span className="h-px flex-1 bg-[#E8D8B8]" /></div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="phone">WhatsApp Number</Label>
              <div className={`flex min-h-12 items-center rounded-lg border bg-[#FCF7EE] transition-colors focus-within:ring-2 focus-within:ring-[#C8A84B]/50 sm:min-h-[52px] ${fieldErrors.phone ? "border-[#DC2626]" : "border-[#E8D8B8]"}`}>
                <span className="ml-3 flex h-5 w-7 shrink-0 items-center" aria-hidden="true">
                  <svg viewBox="0 0 28 20" className="h-4 w-6 rounded-[2px]" focusable="false">
                    <path fill="#FF9933" d="M0 0h28v6.67H0z" />
                    <path fill="#fff" d="M0 6.67h28v6.66H0z" />
                    <path fill="#138808" d="M0 13.33h28V20H0z" />
                    <circle cx="14" cy="10" r="2.1" fill="none" stroke="#000080" strokeWidth="0.7" />
                    <circle cx="14" cy="10" r="0.55" fill="#000080" />
                  </svg>
                </span>
                <div className="relative flex h-8 shrink-0 items-center border-r border-[#E8D8B8] pr-2">
                  <select
                    aria-label="Country calling code"
                    value={countryCode}
                    onChange={(event) => {
                      setCountryCode(event.target.value);
                      clearFieldError("phone");
                    }}
                    className="h-full w-[42px] appearance-none bg-transparent pl-1 pr-3 text-sm text-[#2A1400] focus:outline-none"
                  >
                    <option value="+91">+91</option>
                  </select>
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute right-1 h-3.5 w-3.5 text-[#6B4423]">
                    <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  value={form.phone}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={fieldErrors.phone ? "phone-error" : "phone-help"}
                  placeholder="WhatsApp Number"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-[#2A1400] focus:outline-none"
                  onChange={handlePhoneChange}
                  onFocus={trackFormStart}
                />
              </div>
              <FieldError field="phone" message={fieldErrors.phone} />
              <p id="phone-help" className="mt-1.5 text-[11px] leading-4 text-[#6B4423]">Your report will be sent to this number.</p>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <FieldInput leadingIcon="mail" id="email" name="email" type="email" inputMode="email" autoComplete="email" required aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "email-error" : undefined} placeholder="you@example.com" className={inputClass} onChange={handleChange} onFocus={trackFormStart} />
              <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-4 text-[#6B4423]"><FieldIcon name="lock" /><span>We only use these details to prepare and deliver your report.</span></p>
              <FieldError field="email" message={fieldErrors.email} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="reportType" required={false}>Selected Package</Label>
              <div className="relative">
                <FieldInput
                  leadingIcon="package"
                  id="reportType"
                  name="reportType"
                  value={form.reportType}
                  title={form.reportType}
                  readOnly
                  className={`${inputClass} pr-10 bg-[#FCF7EE] text-[#6B4423] cursor-not-allowed text-ellipsis overflow-hidden`}
                />
                <SelectChevron className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B1E1E]" />
              </div>
            </div>
            <div>
              {isMatchmaking ? (
                <>
                  <Label htmlFor="language">Report Language</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2"><FieldIcon name="globe" /></span>
                    <select id="language" required name="language" className={`${inputClass} pl-10`} value={form.language} onChange={handleChange}>
                      <option value="hindi">Hindi (हिंदी)</option>
                      <option value="english">English</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <Label id="language-label" htmlFor="language">Report Language</Label>
                  <StyledSelectField
                    id="language"
                    labelId="language-label"
                    name="language"
                    value={form.language}
                    leadingIcon="globe"
                    ariaLabel="Report language"
                    required
                    onChange={(value) => handleSelectValueChange("language", value)}
                  >
                    <MenuItem value="hindi" sx={{ minHeight: 44 }}>Hindi (हिंदी)</MenuItem>
                    <MenuItem value="english" sx={{ minHeight: 44 }}>English</MenuItem>
                  </StyledSelectField>
                </>
              )}
            </div>
            {showQuestionDropdown && !isMatchmaking && (
              <div className="sm:col-span-2">
                <label id="challenge-label" htmlFor="challenge" className="mb-1.5 flex items-center justify-between gap-3 text-sm font-semibold leading-5 text-black">
                  <span className="flex min-w-0 items-center gap-1.5">Select Your 1 Primary Question <RequiredMark /></span>
                  <span className="checkout-question-badge shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none"><span className="relative z-[1]">1 question included</span></span>
                </label>
                <div className="checkout-featured-question">
                  <StyledSelectField
                    id="challenge"
                    labelId="challenge-label"
                    name="challenge"
                    value={form.challenge}
                    leadingIcon="message"
                    placeholder="Choose your question"
                    ariaLabel="Your primary question"
                    required
                    error={Boolean(fieldErrors.challenge)}
                    errorId={fieldErrors.challenge ? "challenge-error" : undefined}
                    onChange={(value) => handleSelectValueChange("challenge", value)}
                    onFocus={trackFormStart}
                  >
                    {Object.entries(QUESTION_DATA).flatMap(([key, group]) => [
                      <ListSubheader key={`group-${key}`} sx={{ color: "#8B1E1E", fontWeight: 700, lineHeight: "40px" }}>
                        {form.language === "hindi" ? group.label.hindi : group.label.english}
                      </ListSubheader>,
                      ...group.questions.map((question, index) => {
                        const text = form.language === "hindi" ? question.hi : question.en;
                        return <MenuItem key={`${key}-${index}`} value={text} sx={{ minHeight: 48, whiteSpace: "normal", py: 1.25 }}>{text}</MenuItem>;
                      }),
                    ])}
                  </StyledSelectField>
                </div>
                <FieldError field="challenge" message={fieldErrors.challenge} />
              </div>
            )}
          </div>

            <div className="space-y-5 pt-4">
            <h4 className="flex items-center gap-2.5 pt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#C8A84B]">
              <FieldIcon name="calendar" />
              <span>{isMatchmaking ? "Person 1 Details (You)" : "Birth Details"}</span>
              <span className="h-px flex-1 bg-[#E8D8B8]" />
            </h4>
            <div className={isMatchmaking ? "grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4" : "space-y-4"}>
              <div className={isMatchmaking ? "contents" : "grid grid-cols-1 sm:grid-cols-2 gap-5"}>
              <div>
                <Label htmlFor="name">Full Name</Label>
                {isMatchmaking ? <input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "name-error" : undefined} placeholder="Enter your full name" className={matchmakingInputClass} onChange={handleChange} onFocus={trackFormStart} /> : <FieldInput leadingIcon="person" id="name" name="name" autoComplete="name" required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "name-error" : undefined} placeholder="Enter your full name" className={inputClass} onChange={handleChange} onFocus={trackFormStart} />}
                <FieldError field="name" message={fieldErrors.name} />
              </div>
              {!isMatchmaking && (
                <div>
                  <Label id="gender-label" htmlFor="gender">Gender</Label>
                  <StyledSelectField
                    id="gender"
                    labelId="gender-label"
                    name="gender"
                    value={form.gender}
                    leadingIcon="person"
                    placeholder="Select"
                    ariaLabel="Gender"
                    required
                    error={Boolean(fieldErrors.gender)}
                    errorId={fieldErrors.gender ? "gender-error" : undefined}
                    onChange={(value) => handleSelectValueChange("gender", value)}
                    onFocus={trackFormStart}
                  >
                    <MenuItem value="male" sx={{ minHeight: 44 }}>Male</MenuItem>
                    <MenuItem value="female" sx={{ minHeight: 44 }}>Female</MenuItem>
                  </StyledSelectField>
                  <FieldError field="gender" message={fieldErrors.gender} />
                </div>
              )}
              </div>
              
              <div className={isMatchmaking ? "block" : "grid grid-cols-1 min-[1280px]:grid-cols-2 gap-4 sm:gap-5"}>
                {isMatchmaking ? (
                  <BirthDatePickerField
                    field="dob"
                    label="Date of Birth"
                    value={form.dob}
                    error={fieldErrors.dob}
                    onValueChange={(value) => handlePickerValueChange("dob", value)}
                    onValidationError={(message) => handlePickerValidationError("dob", message)}
                    onFocus={trackFormStart}
                  />
                ) : (
                  <BirthDateSelectField
                    field="dob"
                    label="Date of Birth"
                    value={form.dob}
                    error={fieldErrors.dob}
                    onValueChange={(value) => handlePickerValueChange("dob", value)}
                    onValidationError={(message) => handlePickerValidationError("dob", message)}
                    onFocus={trackFormStart}
                  />
                )}
                <div>
                  {form.tobAccuracy === "approximate" && !isMatchmaking ? (
                    <div>
                      <Label id="tobApproximateRange-label" htmlFor="tobApproximateRange">Estimated Time of Birth</Label>
                      <StyledSelectField
                        id="tobApproximateRange"
                        labelId="tobApproximateRange-label"
                        name="tobApproximateRange"
                        value={form.tobApproximateRange}
                        placeholder="Select the closest time range"
                        ariaLabel="Estimated time of birth range"
                        required
                        error={Boolean(fieldErrors.tobApproximateRange)}
                        errorId={fieldErrors.tobApproximateRange ? "tobApproximateRange-error tobApproximateRange-help" : "tobApproximateRange-help"}
                        onChange={(value) => handleSelectValueChange("tobApproximateRange", value)}
                        onFocus={trackFormStart}
                      >
                        {APPROXIMATE_BIRTH_TIME_RANGES.map((range) => (
                          <MenuItem key={range.value} value={range.value} sx={{ minHeight: 44, whiteSpace: "normal", py: 1.25 }}>{range.label}</MenuItem>
                        ))}
                      </StyledSelectField>
                      <FieldError field="tobApproximateRange" message={fieldErrors.tobApproximateRange} />
                    </div>
                  ) : isMatchmaking ? (
                    <BirthTimePickerField
                      field="tob"
                      label="Time of Birth"
                      value={form.tob}
                      error={fieldErrors.tob}
                      onValueChange={(value) => handlePickerValueChange("tob", value)}
                      onValidationError={(message) => handlePickerValidationError("tob", message)}
                      onFocus={trackFormStart}
                    />
                  ) : (
                    <BirthTimeSelectField
                      field="tob"
                      label="Time of Birth"
                      value={form.tob}
                      error={fieldErrors.tob}
                      onValueChange={(value) => handlePickerValueChange("tob", value)}
                      onValidationError={(message) => handlePickerValidationError("tob", message)}
                      onFocus={trackFormStart}
                    />
                  )}
                  {!isMatchmaking && (
                    <label className="mt-2 inline-flex min-h-6 cursor-pointer items-center gap-2.5 text-sm leading-5 text-[#2A1400] focus-within:rounded focus-within:ring-2 focus-within:ring-[#C8A84B]/60 focus-within:ring-offset-2">
                      <input
                        type="checkbox"
                        checked={form.tobAccuracy === "approximate"}
                        onChange={(event) => handleApproximateBirthTimeToggle(event.target.checked)}
                        className="h-[18px] w-[18px] shrink-0 accent-[#8B1E1E]"
                      />
                      <span>I don&apos;t know the exact birth time</span>
                    </label>
                  )}
                  {!isMatchmaking && form.tobAccuracy === "approximate" && (
                    <p id="tobApproximateRange-help" className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-4 text-[#6B4423]">
                      <FieldIcon name="info" />
                      <span>Approximate time is okay if exact time is unavailable.</span>
                    </p>
                  )}
                </div>
              </div>
              <div className={isMatchmaking ? "block" : "grid grid-cols-1 sm:grid-cols-2 gap-5"}>
                <div className="mb-4">
                   <Label htmlFor="city">Place of Birth</Label>
                   {isMatchmaking ? <input id="city" required name="city" aria-invalid={Boolean(fieldErrors.city)} aria-describedby={fieldErrors.city ? "city-error" : undefined} placeholder="Search or enter place of birth" className={matchmakingInputClass} onChange={handleChange} onFocus={trackFormStart} /> : <FieldInput leadingIcon="pin" id="city" required name="city" aria-invalid={Boolean(fieldErrors.city)} aria-describedby={fieldErrors.city ? "city-error" : undefined} placeholder="Search or enter place of birth" className={inputClass} onChange={handleChange} onFocus={trackFormStart} />}
                   <FieldError field="city" message={fieldErrors.city} />
                </div>
                <div>
              <Label htmlFor="pinCode">PIN Code</Label>
              <FieldInput leadingIcon="hash" id="pinCode" required name="pinCode" inputMode="numeric" autoComplete="postal-code" aria-invalid={Boolean(fieldErrors.pinCode)} aria-describedby={fieldErrors.pinCode ? "pinCode-error" : undefined} placeholder="e.g. 110001" className={inputClass} onChange={handleChange} onFocus={trackFormStart} />
              <FieldError field="pinCode" message={fieldErrors.pinCode} />
                </div>
                {isMatchmaking && (
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select id="gender" required name="gender" aria-invalid={Boolean(fieldErrors.gender)} aria-describedby={fieldErrors.gender ? "gender-error" : undefined} className={matchmakingInputClass} onChange={handleChange} onFocus={trackFormStart}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <FieldError field="gender" message={fieldErrors.gender} />
                  </div>
                )}
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

          {showQuestionDropdown && isMatchmaking && (
            <div className="pt-2">
              <Label htmlFor="challenge">Select Your 1 Primary Question</Label>
              <select id="challenge" name="challenge" required aria-invalid={Boolean(fieldErrors.challenge)} aria-describedby={fieldErrors.challenge ? "challenge-error" : undefined} className={`${inputClass} border-2 border-[#C8A84B]/30`} onChange={handleChange} onFocus={trackFormStart} value={form.challenge}>
                <option value="">-- Choose your question --</option>
                {Object.entries(QUESTION_DATA).map(([key, group]) => (
                  <optgroup key={key} label={form.language === "hindi" ? group.label.hindi : group.label.english}>
                    {group.questions.map((question, index) => (
                      <option key={index} value={form.language === "hindi" ? question.hi : question.en}>{form.language === "hindi" ? question.hi : question.en}</option>
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
                <FieldTextarea leadingIcon="message"
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

          <div className="mt-7">
            <div className="flex items-start gap-2.5">
              <input type="checkbox" id="terms" required checked={agreedToTerms} aria-invalid={Boolean(fieldErrors.terms)} aria-describedby={fieldErrors.terms ? "terms-error" : undefined} onChange={(e) => { setAgreedToTerms(e.target.checked); if (e.target.checked) clearFieldError("terms"); }} onFocus={trackFormStart} className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[#8B1E1E]" />
              <label htmlFor="terms" className="text-sm leading-6 text-[#4B5563]">I verify the details are accurate. I agree to <Link href="/terms-and-conditions" className="font-semibold text-[#8B1E1E]">Terms</Link>.</label>
            </div>
            <FieldError field="terms" message={fieldErrors.terms} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 rounded-xl bg-[#F8F2E8] px-3 py-3 sm:grid-cols-3 sm:gap-0 sm:px-4" aria-label="Checkout assurances">
            <div className="flex items-center gap-2.5 px-1 py-1.5 sm:border-r sm:border-[#D9C8AA] sm:px-3 sm:first:pl-0">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 shrink-0 text-[#8B1E1E]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 20 6v5c0 5.2-3.4 8.5-8 10-4.6-1.5-8-4.8-8-10V6l8-3Z"/><path d="m8.5 12 2.3 2.3 4.8-4.8"/></svg>
              <span><strong className="block text-xs font-medium leading-4 text-[#2A1400]">Secure Checkout</strong><span className="block text-[10px] leading-4 text-[#6B7280]">Payment through Razorpay</span></span>
            </div>
            <div className="flex items-center gap-2.5 px-1 py-1.5 sm:border-r sm:border-[#D9C8AA] sm:px-3">
              <FieldIcon name="lock" className="h-7 w-7 shrink-0 text-[#8B1E1E]" />
              <span><strong className="block text-xs font-medium leading-4 text-[#2A1400]">Private &amp; Confidential</strong><span className="block text-[10px] leading-4 text-[#6B7280]">Your information is handled securely</span></span>
            </div>
            <div className="flex items-center gap-2.5 px-1 py-1.5 sm:px-3 sm:last:pr-0">
              <FieldIcon name="clock" className="h-7 w-7 shrink-0 text-[#8B1E1E]" />
              <span><strong className="block text-xs font-medium leading-4 text-[#2A1400]">Delivered within timeline</strong><span className="block text-[10px] leading-4 text-[#6B7280]">On WhatsApp</span></span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4" aria-label="McAfee and Norton security badges">
            <img
              src="https://d3ldyx3r2ad3ic.cloudfront.net/templates/template-assets/images/store-checkout-2/mcafe.png"
              alt="McAfee SECURE"
              width={82}
              height={30}
              loading="lazy"
              decoding="async"
              className="h-[30px] w-auto object-contain"
            />
            <img
              src="https://d3ldyx3r2ad3ic.cloudfront.net/templates/template-assets/images/store-checkout-2/norton.png"
              alt="Norton SECURED"
              width={82}
              height={30}
              loading="lazy"
              decoding="async"
              className="h-[30px] w-auto object-contain"
            />
          </div>
        </form>
      </div>
    </div>

    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#E8D8B8] bg-white/95 px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-8px_24px_rgba(61,22,0,0.12)] backdrop-blur-sm sm:px-6">
      <div className="mx-auto max-w-2xl">
        {paymentError && <p role="alert" className="mb-2 rounded-xl border border-[#A32424]/30 bg-[#FFF5F3] px-4 py-2.5 text-sm font-medium text-[#8B1E1E]">{paymentError}</p>}
        <button form="checkout-form" type="submit" disabled={loading} aria-busy={loading} className="checkout-pay-button relative isolate flex min-h-[62px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#8B1E1E] to-[#651717] px-4 py-3.5 text-lg font-medium text-white shadow-[0_5px_14px_rgba(101,23,23,0.24)] transition-[transform,box-shadow,opacity] duration-200 hover:shadow-[0_7px_18px_rgba(101,23,23,0.3)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E1E] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-75 sm:text-xl">
          {loading ? (
            <>
              <svg aria-hidden="true" className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.35" strokeWidth="3" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span>Opening secure payment…</span>
            </>
          ) : (
            <>
              <span>Pay securely</span>
              <span className="tabular-nums">₹{finalAmount}</span>
              <span aria-hidden="true" className="ml-0.5 inline-flex shrink-0 items-center pl-1.5">
                {(["googlepay", "phonepe", "popclubapp", "paytm"] as const).map((app) => (
                  <span key={app} className="relative -ml-1.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#2A1400]/10 bg-white shadow-sm">
                    <img
                      src={`https://cdn.razorpay.com/app/${app}.svg`}
                      alt=""
                      width={12}
                      height={12}
                      className="h-3 w-3 object-contain"
                    />
                  </span>
                ))}
              </span>
              <span className="sr-only">UPI payment apps: Google Pay, PhonePe, POP Club, and Paytm.</span>
            </>
          )}
        </button>
      </div>
    </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <div className="checkout-page min-h-screen bg-[#FCF7EE] font-sans text-[#2A1400] pb-32">
      <header className="sticky top-0 z-50 border-b border-[#E8D8B8] bg-white px-4 py-1">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/surbhi-astrology-logo.png" alt="Surbhi Astrology — Celebrity Astrologer Surbhi Gupta" className="h-12 w-auto object-contain md:h-16" />
          </Link>
          <a href="https://wa.me/919828551330" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" className="flex min-h-10 items-center gap-2.5 rounded-xl border border-[#E8D8B8] bg-white px-2.5 py-1.5 text-[#168A55] shadow-[0_2px_8px_rgba(61,22,0,0.04)] transition-colors hover:bg-[#F5FBF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168A55] focus-visible:ring-offset-2 sm:px-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F5EE]">
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.52 3.48A11.79 11.79 0 0 0 12.13 0C5.58 0 .25 5.33.25 11.88c0 2.1.55 4.16 1.59 5.98L.15 24l6.29-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.15-3.5-8.44ZM12.14 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.73.98 1-3.64-.24-.37a9.88 9.88 0 1 1 8.38 4.62Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.51-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.1 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
              </svg>
            </span>
            <span className="hidden text-left leading-tight sm:block"><span className="block text-[11px] font-medium text-[#475569]">Need Help?</span><span className="block text-xs font-semibold">Chat on WhatsApp →</span></span>
          </a>
        </div>
      </header>
      <Suspense fallback={<div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1E1E]"></div></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
