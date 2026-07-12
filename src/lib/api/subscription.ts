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
  isActive: boolean;
}

/**
 * List all active subscription plans (public endpoint)
 */
export async function listPlans(): Promise<Plan[]> {
  const response = await client.get("/plans");
  return response.data.data;
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
