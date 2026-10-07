export const APPROXIMATE_BIRTH_TIME_RANGES = [
  { value: "00:00-04:00", label: "Late night · 12:00 AM–4:00 AM" },
  { value: "04:00-08:00", label: "Early morning · 4:00 AM–8:00 AM" },
  { value: "08:00-12:00", label: "Morning · 8:00 AM–12:00 PM" },
  { value: "12:00-16:00", label: "Afternoon · 12:00 PM–4:00 PM" },
  { value: "16:00-20:00", label: "Evening · 4:00 PM–8:00 PM" },
  { value: "20:00-24:00", label: "Night · 8:00 PM–12:00 AM" },
] as const;

export type ApproximateBirthTimeRange = (typeof APPROXIMATE_BIRTH_TIME_RANGES)[number]["value"];

export function isApproximateBirthTimeRange(value: unknown): value is ApproximateBirthTimeRange {
  return typeof value === "string" && APPROXIMATE_BIRTH_TIME_RANGES.some((range) => range.value === value);
}

export function formatBirthTime(
  time: string | null | undefined,
  accuracy: string | null | undefined,
  approximateRange: string | null | undefined,
) {
  if (accuracy === "approximate") {
    const range = APPROXIMATE_BIRTH_TIME_RANGES.find((option) => option.value === approximateRange);
    return range ? `Approximate — ${range.label}` : "Approximate time (range not selected)";
  }

  if (!time) return "Not provided";

  // Exact birth times are stored in 24-hour HH:mm format for the checkout
  // and downstream integrations. Make the period explicit in customer/admin
  // emails while continuing to accept older values that already include it.
  const match = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(time.trim());
  if (!match) return time;

  const hour = Number(match[1]);
  const minute = match[2];
  const suppliedPeriod = match[3]?.toUpperCase();
  if (suppliedPeriod) {
    return `${String(hour).padStart(2, "0")}:${minute} ${suppliedPeriod}`;
  }
  if (hour > 23) return time;

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${minute} ${period}`;
}
