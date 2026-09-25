export type CheckoutPlan = {
  service: string;
  plan: string;
  reportType: string;
  amount: number;
  whatsappSelection?: {
    intent: string;
    planId: string;
  };
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
    whatsappSelection: { intent: "surbhi_kundli", planId: "kundli_999" },
  },
  {
    service: "Surbhi Kundali",
    plan: "Report + 1Question",
    reportType: "Surbhi Kundali - Report + 1Question",
    amount: 2999,
    whatsappSelection: { intent: "surbhi_kundli", planId: "kundli_2999" },
  },
  {
    service: "Surbhi Kundali",
    plan: "With Call",
    reportType: "Surbhi Kundali - With Call",
    amount: 11000,
    whatsappSelection: { intent: "surbhi_kundli", planId: "kundli_11000" },
  },
  {
    service: "Surbhi Consultation",
    plan: "Offline",
    reportType: "Surbhi Consultation - Offline",
    amount: 24000,
    whatsappSelection: { intent: "surbhi_consultation", planId: "consultation_offline" },
  },
  {
    service: "Surbhi Consultation",
    plan: "Priority",
    reportType: "Surbhi Consultation - Priority",
    amount: 51000,
    whatsappSelection: { intent: "surbhi_consultation", planId: "consultation_priority" },
  },
  {
    service: "Numerology Report",
    plan: "Basic",
    reportType: "Numerology Report - Basic",
    amount: 1100,
    whatsappSelection: { intent: "numerology_report", planId: "numerology_basic" },
  },
  {
    service: "Numerology Report",
    plan: "Correction",
    reportType: "Numerology Report - Correction",
    amount: 5100,
    whatsappSelection: { intent: "numerology_report", planId: "numerology_correction" },
  },
  {
    service: "Numerology Report",
    plan: "With Call",
    reportType: "Numerology Report - With Call",
    amount: 11000,
    whatsappSelection: { intent: "numerology_report", planId: "numerology_call" },
  },
  {
    service: "Couple Match Making",
    plan: "Basic Match",
    reportType: "Couple Match Making - Basic Match",
    amount: 1100,
    whatsappSelection: { intent: "couple_match_making", planId: "match_basic" },
  },
  {
    service: "Couple Match Making",
    plan: "Match + 1Question",
    reportType: "Couple Match Making - Match + 1Question",
    amount: 3300,
    whatsappSelection: { intent: "couple_match_making", planId: "match_question" },
  },
  {
    service: "Couple Match Making",
    plan: "Match + Call",
    reportType: "Couple Match Making - Match + Call",
    amount: 11000,
    whatsappSelection: { intent: "couple_match_making", planId: "match_call" },
  },
  {
    service: "Couple Match Making",
    plan: "Direct Call",
    reportType: "Couple Match Making - Direct Call",
    amount: 15000,
    whatsappSelection: { intent: "couple_match_making", planId: "match_direct_call" },
  },
  {
    service: "Baby Name Report",
    plan: "Baby Report",
    reportType: "Baby Name Report - Baby Report",
    amount: 1100,
    whatsappSelection: { intent: "baby_name_report", planId: "baby_report" },
  },
  {
    service: "Baby Name Report",
    plan: "Report + Name",
    reportType: "Baby Name Report - Report + Name",
    amount: 5100,
    whatsappSelection: { intent: "baby_name_report", planId: "baby_name" },
  },
  {
    service: "Baby Name Report",
    plan: "Premium Call",
    reportType: "Baby Name Report - Premium Call",
    amount: 11000,
    whatsappSelection: { intent: "baby_name_report", planId: "baby_call" },
  },
  {
    service: "Career & Business",
    plan: "10-Yr Report + 1Question",
    reportType: "Career & Business - 10-Yr Report + 1Question",
    amount: 999,
    whatsappSelection: { intent: "career", planId: "problem_report" },
  },
  {
    service: "Career & Business",
    plan: "1-on-1 Call",
    reportType: "Career & Business - 1-on-1 Call",
    amount: 11000,
    whatsappSelection: { intent: "career", planId: "problem_call" },
  },
  {
    service: "Marriage & Relationships",
    plan: "10-Yr Report + 1Question",
    reportType: "Marriage & Relationships - 10-Yr Report + 1Question",
    amount: 999,
    whatsappSelection: { intent: "love", planId: "problem_report" },
  },
  {
    service: "Marriage & Relationships",
    plan: "1-on-1 Call",
    reportType: "Marriage & Relationships - 1-on-1 Call",
    amount: 11000,
    whatsappSelection: { intent: "love", planId: "problem_call" },
  },
  {
    service: "Money & Finances",
    plan: "10-Yr Report + 1Question",
    reportType: "Money & Finances - 10-Yr Report + 1Question",
    amount: 999,
    whatsappSelection: { intent: "money", planId: "problem_report" },
  },
  {
    service: "Money & Finances",
    plan: "1-on-1 Call",
    reportType: "Money & Finances - 1-on-1 Call",
    amount: 11000,
    whatsappSelection: { intent: "money", planId: "problem_call" },
  },
  {
    service: "Health Issues",
    plan: "10-Yr Report + 1Question",
    reportType: "Health Issues - 10-Yr Report + 1Question",
    amount: 999,
    whatsappSelection: { intent: "health", planId: "problem_report" },
  },
  {
    service: "Health Issues",
    plan: "1-on-1 Call",
    reportType: "Health Issues - 1-on-1 Call",
    amount: 11000,
    whatsappSelection: { intent: "health", planId: "problem_call" },
  },
  {
    service: "Family Concerns",
    plan: "10-Yr Report + 1Question",
    reportType: "Family Concerns - 10-Yr Report + 1Question",
    amount: 999,
    whatsappSelection: { intent: "family", planId: "problem_report" },
  },
  {
    service: "Family Concerns",
    plan: "1-on-1 Call",
    reportType: "Family Concerns - 1-on-1 Call",
    amount: 11000,
    whatsappSelection: { intent: "family", planId: "problem_call" },
  },
] as const;

export const DEFAULT_CHECKOUT_PLAN = CHECKOUT_PLANS[0];

// WhatsApp list rows historically use p1/p2/p3/p4 for every service. Resolve
// those local row IDs against the selected service before looking up a plan.
const WHATSAPP_PLAN_ID_ALIASES: Record<string, Record<string, string>> = {
  surbhi_consultation: { p1: "consultation_offline", p2: "consultation_priority" },
  numerology_report: { p1: "numerology_basic", p2: "numerology_correction", p3: "numerology_call" },
  couple_match_making: { p1: "match_basic", p2: "match_question", p3: "match_call", p4: "match_direct_call" },
  baby_name_report: { p1: "baby_report", p2: "baby_name", p3: "baby_call" },
  career: { p1: "problem_report", p2: "problem_call" },
  love: { p1: "problem_report", p2: "problem_call" },
  money: { p1: "problem_report", p2: "problem_call" },
  health: { p1: "problem_report", p2: "problem_call" },
  family: { p1: "problem_report", p2: "problem_call" },
  surbhi_kundli: { p1: "kundli_999", p2: "kundli_2999", p3: "kundli_11000" },
};

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

export function getCheckoutPlanByWhatsAppSelection(
  intent?: unknown,
  planId?: unknown
) {
  if (typeof intent !== "string" || typeof planId !== "string") {
    return undefined;
  }

  const resolvedPlanId = WHATSAPP_PLAN_ID_ALIASES[intent]?.[planId] ?? planId;

  return CHECKOUT_PLANS.find(
    (checkoutPlan) =>
      checkoutPlan.whatsappSelection?.intent === intent &&
      checkoutPlan.whatsappSelection?.planId === resolvedPlanId
  );
}
