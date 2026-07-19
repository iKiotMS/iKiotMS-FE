import client from "./client";

/**
 * Assign free trial subscription to the registered tenant owner
 */
export async function assignFreeTrial() {
  const response = await client.post("/subscription/free-trial", {});
  return response.data;
}

export interface Plan {
  _id: string;
  planName: string;
  planCode: string;
  price: number;
  billingCycle: "MONTHLY" | "YEARLY" | "NONE";
  maxBranches: number;
  maxUsers: number;
  maxProducts: number;
  trialDays: number;
  features: string[];
  description?: string;
  displayFeatures?: string[];
  isPopular?: boolean;
  isActive: boolean;
}

/**
 * List all active subscription plans (public endpoint)
 */
export async function listPlans(): Promise<Plan[]> {
  const response = await client.get("/plans");
  return response.data.data;
}

/**
 * List every plan including inactive ones (SUPER_ADMIN management table)
 */
export async function listAllPlans(): Promise<Plan[]> {
  const response = await client.get("/admin/plans");
  return response.data.data;
}

/** Fields a SUPER_ADMIN may edit on a plan. */
export type UpdatePlanPayload = Partial<
  Pick<
    Plan,
    | "planName"
    | "description"
    | "displayFeatures"
    | "price"
    | "maxBranches"
    | "maxUsers"
    | "maxProducts"
    | "trialDays"
    | "features"
    | "isPopular"
    | "isActive"
  >
>;

/**
 * Update a plan's editable fields (SUPER_ADMIN). planCode/billingCycle are immutable.
 */
export async function updatePlan(
  id: string,
  payload: UpdatePlanPayload,
): Promise<Plan> {
  const response = await client.put(`/admin/plans/${id}`, payload);
  return response.data.data;
}

/**
 * Enable/disable a plan (SUPER_ADMIN). Inactive plans drop off the public list.
 */
export async function setPlanActive(
  id: string,
  isActive: boolean,
): Promise<Plan> {
  const response = await client.patch(`/admin/plans/${id}/active`, { isActive });
  return response.data.data;
}

/**
 * The fixed pricing tiers. Plans are grouped by base code; each tier can have a
 * monthly plan (planCode === tier) and an optional yearly variant (`${tier}_YEARLY`).
 */
export const PLAN_TIER_ORDER = ["TRIAL", "PLUS", "PRO"] as const;
export type PlanTier = (typeof PLAN_TIER_ORDER)[number];

export interface PlanTierGroup {
  tier: PlanTier;
  monthly?: Plan;
  yearly?: Plan;
}

/** Strip the _YEARLY suffix to get a plan's base tier code. */
export const basePlanTier = (planCode: string): string =>
  planCode.replace(/_YEARLY$/, "");

/**
 * Groups a flat plan list into the fixed TRIAL/PLUS/PRO tiers, pairing each
 * tier's monthly and yearly variants. Shared by the landing and billing pages.
 * Tiers with no matching plan are omitted.
 */
export function groupPlansByTier(plans: Plan[]): PlanTierGroup[] {
  return PLAN_TIER_ORDER.map((tier) => ({
    tier,
    monthly: plans.find((p) => p.planCode === tier),
    yearly: plans.find((p) => p.planCode === `${tier}_YEARLY`),
  })).filter((g) => g.monthly || g.yearly);
}

export interface InitiateUpgradeResult {
  invoiceId: string;
  paymentReference: string;
  amount: number;
  plan: { planCode: string; planName: string };
  qrDataUrl: string;
  expiredAt: string;
}

export async function initiateUpgrade(planCode: string): Promise<InitiateUpgradeResult> {
  const response = await client.post("/subscription/upgrade/initiate", { planCode });
  return response.data.data;
}

/**
 * Renew the tenant's current plan (no planCode needed — backend uses the active plan)
 */
export async function initiateRenewal(): Promise<InitiateUpgradeResult> {
  const response = await client.post("/subscription/renew/initiate", {});
  return response.data.data;
}

export interface Invoice {
  _id: string;
  planId: { planName: string; planCode: string };
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  billingPeriodStart: string;
  billingPeriodEnd: string;
  paidAt?: string;
  paymentReference?: string;
  createdAt: string;
}

export async function listInvoices(): Promise<Invoice[]> {
  const response = await client.get("/subscription/invoices");
  return response.data.data;
}

export interface AdminInvoice extends Omit<Invoice, "planId"> {
  planId?: { planName: string; planCode: string };
  tenantId?: { _id: string; name: string; phoneNumber?: string };
}

export async function listAllInvoices(): Promise<AdminInvoice[]> {
  const response = await client.get("/subscription/admin/invoices");
  return response.data.data;
}
