import client from "./client";

export interface TenantOwnerProfile {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  dob?: string;
  taxNumber?: string;
  identificationId?: string;
  address?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export interface TenantOwner {
  _id: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  profile?: TenantOwnerProfile;
  createdAt: string;
}

export interface Plan {
  _id: string;
  planName: string;
  planCode: string;
  price: number;
}

export interface Subscription {
  _id: string;
  status: "TRIAL" | "ACTIVE" | "EXPIRED" | "PAST_DUE" | "CANCELLED";
  startDate: string;
  endDate: string;
  planId?: Plan;
}

export interface Invoice {
  _id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  billingPeriodStart: string;
  billingPeriodEnd: string;
  paidAt?: string;
  paymentReference?: string;
  paymentMethod?: string;
  planId?: Plan;
  createdAt: string;
}

export interface Tenant {
  _id: string;
  name: string;
  tenantOwnerId?: TenantOwner;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  phoneNumber?: string;
  mainAddress?: string;
  taxNumber?: string;
  banking?: {
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
  };
  createdAt: string;
  activeSubscription?: Subscription;
  invoices?: Invoice[];
}

export async function listTenants(): Promise<Tenant[]> {
  const response = await client.get("/tenant");
  return response.data.data;
}
