// [Context – Dashboard Data]
'use client'

import React, { useState } from 'react'
import { useDashboardStats, type DashboardRange, type TopProductsSortBy, type RevenueDateRange } from '../hooks/use-dashboard-stats'
import type {
  StatsOverview,
  RevenueSeries,
  RevenueByPaymentMethod,
  RevenueByStaff,
  Cashflow,
  TopProducts,
  InventoryStats,
} from '@/lib/api/stats'

type DashboardContextType = {
  overview: StatsOverview | null
  revenue: RevenueSeries | null
  revenueDateRange: RevenueDateRange | null
  revenueByPaymentMethod: RevenueByPaymentMethod | null
  revenueByStaff: RevenueByStaff | null
  cashflow: Cashflow | null
  topProducts: TopProducts | null
  inventory: InventoryStats | null
  isLoading: boolean
  range: DashboardRange
  setRange: (range: DashboardRange) => void
  topProductsSortBy: TopProductsSortBy
  setTopProductsSortBy: (sortBy: TopProductsSortBy) => void
  lowStockThreshold: number
  setLowStockThreshold: (threshold: number) => void
  refetch: () => void
}

const DashboardContext = React.createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [range, setRange] = useState<DashboardRange>('30d')
  const stats = useDashboardStats(range)

  return (
    <DashboardContext.Provider value={{ ...stats, range, setRange }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = React.useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within <DashboardProvider>')
  return ctx
}
