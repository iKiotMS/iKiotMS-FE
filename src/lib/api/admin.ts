import client from "./client";
import type {
  AdminListResponse,
  AdminQueryParams,
  CreateTierPayload,
  ReviewSubscriptionPayload,
  SubscriptionRequest,
  SubscriptionTier,
  SystemStats,
  Tenant,
  UpdateTenantPayload,
  UpdateTierPayload,
} from "@/types/admin";

const BASE = "/admin";

const MOCK_TENANTS: Tenant[] = [
  {
    _id: "t1",
    ownerName: "Nguyễn Văn An",
    email: "an.nguyen@example.com",
    phone: "0901234567",
    businessName: "Cửa hàng An",
    subscription: { tierId: "tier1", tierName: "Pro", expiresAt: "2025-12-31" },
    status: "active",
    createdAt: "2024-01-15T07:00:00Z",
    updatedAt: "2024-06-01T10:00:00Z",
  },
  {
    _id: "t2",
    ownerName: "Trần Thị Bích",
    email: "bich.tran@example.com",
    phone: "0912345678",
    businessName: "Shop Bích",
    subscription: { tierId: "tier2", tierName: "Starter", expiresAt: "2025-06-30" },
    status: "active",
    createdAt: "2024-02-20T08:00:00Z",
    updatedAt: "2024-05-15T09:00:00Z",
  },
  {
    _id: "t3",
    ownerName: "Lê Minh Cường",
    email: "cuong.le@example.com",
    phone: "0923456789",
    businessName: "Kiot Cường",
    status: "suspended",
    createdAt: "2024-03-10T09:00:00Z",
    updatedAt: "2024-06-10T14:00:00Z",
  },
  {
    _id: "t4",
    ownerName: "Phạm Thu Hà",
    email: "ha.pham@example.com",
    phone: "0934567890",
    businessName: "Shop Hà Fashion",
    status: "pending",
    createdAt: "2024-06-12T11:00:00Z",
    updatedAt: "2024-06-12T11:00:00Z",
  },
];

const MOCK_REQUESTS: SubscriptionRequest[] = [
  {
    _id: "req1",
    tenantId: "t4",
    tenantName: "Shop Hà Fashion",
    tierId: "tier1",
    tierName: "Pro",
    requestedAt: "2024-06-12T11:00:00Z",
    status: "pending",
  },
  {
    _id: "req2",
    tenantId: "t2",
    tenantName: "Shop Bích",
    tierId: "tier1",
    tierName: "Pro",
    requestedAt: "2024-06-10T09:00:00Z",
    status: "pending",
  },
  {
    _id: "req3",
    tenantId: "t1",
    tenantName: "Cửa hàng An",
    tierId: "tier1",
    tierName: "Pro",
    requestedAt: "2024-01-14T07:00:00Z",
    status: "approved",
    reviewedBy: "admin",
    reviewedAt: "2024-01-15T08:00:00Z",
    note: "Đã xác minh thông tin kinh doanh.",
  },
];

const MOCK_TIERS: SubscriptionTier[] = [
  {
    _id: "tier_starter",
    name: "Starter",
    description: "Phù hợp cho cửa hàng nhỏ mới bắt đầu",
    priceMonthly: 199000,
    priceYearly: 1990000,
    maxBranches: 1,
    maxStaff: 5,
    features: [
      { name: "Quản lý sản phẩm", included: true },
      { name: "Quản lý nhân viên", included: true, limit: 5 },
      { name: "Báo cáo cơ bản", included: true },
      { name: "Đa chi nhánh", included: false },
      { name: "AI Analytics", included: false },
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "tier_pro",
    name: "Pro",
    description: "Dành cho chuỗi cửa hàng vừa và lớn",
    priceMonthly: 499000,
    priceYearly: 4990000,
    maxBranches: 5,
    maxStaff: 30,
    features: [
      { name: "Quản lý sản phẩm", included: true },
      { name: "Quản lý nhân viên", included: true, limit: 30 },
      { name: "Báo cáo nâng cao", included: true },
      { name: "Đa chi nhánh", included: true, limit: 5 },
      { name: "AI Analytics", included: false },
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    _id: "tier_enterprise",
    name: "Enterprise",
    description: "Giải pháp toàn diện không giới hạn",
    priceMonthly: 1499000,
    priceYearly: 14990000,
    maxBranches: 999,
    maxStaff: 999,
    features: [
      { name: "Quản lý sản phẩm", included: true },
      { name: "Quản lý nhân viên", included: true },
      { name: "Báo cáo nâng cao", included: true },
      { name: "Đa chi nhánh", included: true },
      { name: "AI Analytics", included: true },
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export const adminApi = {
  getStats: async (): Promise<SystemStats> => {
    try {
      const res = await client.get(`${BASE}/stats`);
      return res.data?.data || res.data;
    } catch {
      return {
        totalTenants: 48,
        activeTenants: 42,
        suspendedTenants: 3,
        pendingRequests: 7,
        totalRevenue: 125_000_000,
        revenueThisMonth: 18_500_000,
        newTenantsThisMonth: 5,
        activeTiersCount: 3,
      };
    }
  },

  getTenants: async (
    params?: AdminQueryParams,
  ): Promise<AdminListResponse<Tenant>> => {
    try {
      const res = await client.get(`${BASE}/tenants`, { params });
      return res.data?.data || res.data;
    } catch {
      const search = params?.search?.toLowerCase() ?? "";
      const filtered = MOCK_TENANTS.filter(
        (t) =>
          !search ||
          t.ownerName.toLowerCase().includes(search) ||
          t.businessName.toLowerCase().includes(search),
      );
      return { data: filtered, total: filtered.length, page: 1, limit: 10 };
    }
  },

  getTenant: async (id: string): Promise<Tenant> => {
    const res = await client.get(`${BASE}/tenants/${id}`);
    return res.data?.data || res.data;
  },

  updateTenant: async (id: string, data: UpdateTenantPayload): Promise<Tenant> => {
    const res = await client.put(`${BASE}/tenants/${id}`, data);
    return res.data?.data || res.data;
  },

  suspendTenant: async (id: string): Promise<Tenant> => {
    const res = await client.patch(`${BASE}/tenants/${id}/suspend`);
    return res.data?.data || res.data;
  },

  activateTenant: async (id: string): Promise<Tenant> => {
    const res = await client.patch(`${BASE}/tenants/${id}/activate`);
    return res.data?.data || res.data;
  },

  getSubscriptionRequests: async (
    params?: AdminQueryParams,
  ): Promise<AdminListResponse<SubscriptionRequest>> => {
    try {
      const res = await client.get(`${BASE}/subscription-requests`, { params });
      return res.data?.data || res.data;
    } catch {
      return {
        data: MOCK_REQUESTS,
        total: MOCK_REQUESTS.length,
        page: 1,
        limit: 10,
      };
    }
  },

  getSubscriptionRequest: async (id: string): Promise<SubscriptionRequest> => {
    const res = await client.get(`${BASE}/subscription-requests/${id}`);
    return res.data?.data || res.data;
  },

  reviewSubscriptionRequest: async (
    id: string,
    data: ReviewSubscriptionPayload,
  ): Promise<SubscriptionRequest> => {
    const res = await client.patch(
      `${BASE}/subscription-requests/${id}/review`,
      data,
    );
    return res.data?.data || res.data;
  },

  getTiers: async (): Promise<SubscriptionTier[]> => {
    try {
      const res = await client.get(`${BASE}/tiers`);
      return res.data?.data || res.data;
    } catch {
      return MOCK_TIERS;
    }
  },

  createTier: async (data: CreateTierPayload): Promise<SubscriptionTier> => {
    const res = await client.post(`${BASE}/tiers`, data);
    return res.data?.data || res.data;
  },

  updateTier: async (
    id: string,
    data: UpdateTierPayload,
  ): Promise<SubscriptionTier> => {
    const res = await client.put(`${BASE}/tiers/${id}`, data);
    return res.data?.data || res.data;
  },

  deleteTier: async (id: string): Promise<void> => {
    await client.delete(`${BASE}/tiers/${id}`);
  },
};
