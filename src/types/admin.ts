export type TenantStatus = "active" | "suspended" | "pending";

export interface TenantSubscription {
  tierId: string;
  tierName: string;
  expiresAt: string;
}

export interface Tenant {
  _id: string;
  ownerName: string;
  email: string;
  phone: string;
  businessName: string;
  subscription?: TenantSubscription;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionRequestStatus = "pending" | "approved" | "denied";

export interface SubscriptionRequest {
  _id: string;
  tenantId: string;
  tenantName: string;
  tierId: string;
  tierName: string;
  requestedAt: string;
  status: SubscriptionRequestStatus;
  note?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TierFeature {
  name: string;
  included: boolean;
  limit?: number;
}

export interface SubscriptionTier {
  _id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxBranches: number;
  maxStaff: number;
  features: TierFeature[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  pendingRequests: number;
  totalRevenue: number;
  revenueThisMonth: number;
  newTenantsThisMonth: number;
  activeTiersCount: number;
}

export interface UpdateTenantPayload {
  ownerName?: string;
  email?: string;
  phone?: string;
  businessName?: string;
}

export interface ReviewSubscriptionPayload {
  status: "approved" | "denied";
  note?: string;
}

export interface CreateTierPayload {
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxBranches: number;
  maxStaff: number;
  features: TierFeature[];
  isActive: boolean;
}

export type UpdateTierPayload = Partial<CreateTierPayload>;

export interface AdminListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
