// [API – Stats]
import client from '@/lib/api/client';

export interface StatsDateRangeParams {
  fromDate?: string;
  toDate?: string;
  branchId?: string;
}

export interface StatsOverview {
  revenue: number;
  orderCount: number;
  customerCount: number;
  aov: number;
  changePct: {
    revenue: number | null;
    orderCount: number | null;
    customerCount: number | null;
    aov: number | null;
  };
  period: { fromDate: string; toDate: string };
  previousPeriod: { fromDate: string; toDate: string };
}

export interface RevenueSeriesPoint {
  bucket: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueSeries {
  groupBy: 'day' | 'month';
  series: RevenueSeriesPoint[];
}

export interface RevenueByPaymentMethodItem {
  paymentMethod: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueByPaymentMethod {
  breakdown: RevenueByPaymentMethodItem[];
}

export interface RevenueByStaffItem {
  userId: string;
  staffName: string | null;
  revenue: number;
  orderCount: number;
  aov: number;
}

export interface RevenueByStaff {
  staff: RevenueByStaffItem[];
}

export interface CashflowByType {
  flowType: 'INCOME' | 'EXPENSE';
  total: number;
  count: number;
}

export interface Cashflow {
  income: number;
  expense: number;
  net: number;
  byType: CashflowByType[];
}

export interface TopProductItem {
  productItemId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface TopProducts {
  sortBy: 'quantity' | 'revenue';
  products: TopProductItem[];
}

export interface LowStockItem {
  productItemId: string;
  productName: string;
  sku: string;
  locationId: string;
  locationType: string;
  stock: number;
}

export interface InventoryStats {
  stockValue: number;
  totalUnits: number;
  skuCount: number;
  outOfStock: number;
  lowStockThreshold: number;
  lowStock: LowStockItem[];
}

async function getStats<T, P extends object = object>(path: string, params?: P): Promise<T> {
  const res = await client.get<{ success: boolean; data: T }>(path, { params });
  return res.data.data;
}

export const statsApi = {
  getOverview: (params?: StatsDateRangeParams) =>
    getStats<StatsOverview>('/stats/overview', params),

  getRevenue: (params?: StatsDateRangeParams & { groupBy?: 'day' | 'month' }) =>
    getStats<RevenueSeries>('/stats/revenue', params),

  getRevenueByPaymentMethod: (params?: StatsDateRangeParams) =>
    getStats<RevenueByPaymentMethod>('/stats/revenue-by-payment-method', params),

  getRevenueByStaff: (params?: StatsDateRangeParams) =>
    getStats<RevenueByStaff>('/stats/revenue-by-staff', params),

  getCashflow: (params?: StatsDateRangeParams & { flow?: 'ORD' | 'SUP'; flowType?: 'INCOME' | 'EXPENSE' }) =>
    getStats<Cashflow>('/stats/cashflow', params),

  getTopProducts: (params?: StatsDateRangeParams & { sortBy?: 'quantity' | 'revenue'; limit?: number }) =>
    getStats<TopProducts>('/stats/top-products', params),

  getInventory: (params?: { branchId?: string; lowStockThreshold?: number }) =>
    getStats<InventoryStats>('/stats/inventory', params),
};
