// [Query – Dashboard Stats]
'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth-store'
import {
  statsApi,
  type StatsOverview,
  type RevenueSeries,
  type RevenueByPaymentMethod,
  type RevenueByStaff,
  type Cashflow,
  type TopProducts,
  type InventoryStats,
} from '@/lib/api/stats'

export type DashboardRange = '7d' | '30d' | '90d' | '12m'

const RANGE_DAYS: Record<DashboardRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '12m': 365,
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getBranchIdFromLocationKey(locationKey: string): string | undefined {
  if (!locationKey || locationKey === 'all') return undefined
  const [type, id] = locationKey.split('-')
  return type === 'branch' && id ? id : undefined
}

export type TopProductsSortBy = 'quantity' | 'revenue'

export type RevenueDateRange = { fromDate: string; toDate: string; groupBy: 'day' | 'month' }

export function useDashboardStats(range: DashboardRange) {
  const locationKey = useAuthStore((state) => state.locationKey)
  const branchId = getBranchIdFromLocationKey(locationKey)

  const [overview, setOverview] = useState<StatsOverview | null>(null)
  const [revenue, setRevenue] = useState<RevenueSeries | null>(null)
  const [revenueDateRange, setRevenueDateRange] = useState<RevenueDateRange | null>(null)
  const [revenueByPaymentMethod, setRevenueByPaymentMethod] = useState<RevenueByPaymentMethod | null>(null)
  const [revenueByStaff, setRevenueByStaff] = useState<RevenueByStaff | null>(null)
  const [cashflow, setCashflow] = useState<Cashflow | null>(null)
  const [topProducts, setTopProducts] = useState<TopProducts | null>(null)
  const [inventory, setInventory] = useState<InventoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [topProductsSortBy, setTopProductsSortBy] = useState<TopProductsSortBy>('revenue')
  const [lowStockThreshold, setLowStockThreshold] = useState(10)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const toDate = new Date()
      const fromDate = new Date(toDate.getTime() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000)
      const fromDateStr = toDateOnly(fromDate)
      const toDateStr = toDateOnly(toDate)
      const dateParams = { fromDate: fromDateStr, toDate: toDateStr, branchId }
      const groupBy = range === '12m' ? ('month' as const) : ('day' as const)

      const [overviewRes, revenueRes, paymentRes, staffRes, cashflowRes, topProductsRes, inventoryRes] =
        await Promise.all([
          statsApi.getOverview(dateParams),
          statsApi.getRevenue({ ...dateParams, groupBy }),
          statsApi.getRevenueByPaymentMethod(dateParams),
          statsApi.getRevenueByStaff(dateParams),
          statsApi.getCashflow({ ...dateParams, flow: 'ORD' }),
          statsApi.getTopProducts({ ...dateParams, sortBy: topProductsSortBy, limit: 5 }),
          statsApi.getInventory({ branchId, lowStockThreshold }),
        ])

      setOverview(overviewRes)
      setRevenue(revenueRes)
      setRevenueDateRange({ fromDate: fromDateStr, toDate: toDateStr, groupBy })
      setRevenueByPaymentMethod(paymentRes)
      setRevenueByStaff(staffRes)
      setCashflow(cashflowRes)
      setTopProducts(topProductsRes)
      setInventory(inventoryRes)
    } catch (err) {
      console.error(err)
      toast.error('Tải dữ liệu thống kê thất bại')
    } finally {
      setIsLoading(false)
    }
  }, [range, branchId, topProductsSortBy, lowStockThreshold])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    overview,
    revenue,
    revenueDateRange,
    revenueByPaymentMethod,
    revenueByStaff,
    cashflow,
    topProducts,
    inventory,
    isLoading,
    topProductsSortBy,
    setTopProductsSortBy,
    lowStockThreshold,
    setLowStockThreshold,
    refetch: fetchAll,
  }
}
