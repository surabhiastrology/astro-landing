export type CheckoutPlan = {
  service: string;
  plan: string;
  reportType: string;
  amount: number;
};

// This is the source of truth for payable products. Never derive a price from
// the URL or accept an amount supplied by the browser.
const CHECKOUT_PLANS: readonly CheckoutPlan[] = [
  {
    service: "Premium Personalized Kundali",
    plan: "10-Year Report",
    reportType: "Premium Personalized Kundali - 10-Year Report",
    amount: 999,
  },
  {
    service: "Surbhi Kundali",
    plan: "10-Yr Report + 1Question",
    reportType: "Surbhi Kundali - 10-Yr Report + 1Question",
    amount: 999,
  },
  {
    service: "Baby Name Report",
    plan: "Baby Report",
    reportType: "Baby Name Report - Baby Report",
    amount: 1100,
  },
] as const;

export const DEFAULT_CHECKOUT_PLAN = CHECKOUT_PLANS[0];

function normalisePlanName(plan: string) {
  return plan.replace(/\s*\(₹[\d,]+\)\s*$/, "").trim();
}

export function getCheckoutPlan(service?: string | null, plan?: string | null) {
  if (!service || !plan) return undefined;

  const normalisedService = service.trim();
  const normalisedPlan = normalisePlanName(plan);

  return CHECKOUT_PLANS.find(
    (checkoutPlan) =>
      checkoutPlan.service === normalisedService &&
      checkoutPlan.plan === normalisedPlan
  );
}

export function getCheckoutPlanByReportType(reportType?: unknown) {
  if (typeof reportType !== "string") return undefined;

  return CHECKOUT_PLANS.find(
    (checkoutPlan) => checkoutPlan.reportType === reportType.trim()
  );
}
