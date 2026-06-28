import client from "./client";

/**
 * Assign free trial subscription to the registered tenant owner
 */
export async function assignFreeTrial() {
  const response = await client.post("/subscription/free-trial", {});
  return response.data;
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

export async function getInvoiceStatus(invoiceId: string): Promise<{ status: string; paidAt?: string }> {
  const response = await client.get(`/subscription/invoice/${invoiceId}/status`);
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
