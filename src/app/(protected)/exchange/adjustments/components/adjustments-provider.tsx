'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { stockMovementApi } from '@/lib/api/stock-movement'
import { getAuthScope } from '@/app/(protected)/exchange/shared/auth-scope'
import { getStockMovementErrorMessage } from '@/app/(protected)/exchange/shared/stock-movement-error'
import type { StockMovement, MovementStatus } from '@/types/stock-movement'

export type AdjustmentsDialogType = 'create'

interface AdjustmentsContextType {
  adjustments: StockMovement[]
  total: number
  isLoading: boolean
  open: AdjustmentsDialogType | null
  setOpen: (v: AdjustmentsDialogType | null) => void
  statusFilter: MovementStatus | 'ALL'
  setStatusFilter: (v: MovementStatus | 'ALL') => void
  fetchAdjustments: () => Promise<void>
}

const AdjustmentsContext = createContext<AdjustmentsContextType | null>(null)

function filterByRole(
  data: StockMovement[],
  role: string,
  warehouseId?: string,
  branchId?: string,
): StockMovement[] {
  if (role === 'TENANT_OWNER' || role === 'SUPER_ADMIN') return data

  if (role === 'WAREHOUSE_MANAGER' && warehouseId) {
    return data.filter(
      (m) => m.fromLocationType === 'warehouse' && m.fromLocationId === warehouseId,
    )
  }

  if (role === 'BRANCH_MANAGER' && branchId) {
    return data.filter(
      (m) => m.fromLocationType === 'branch' && m.fromLocationId === branchId,
    )
  }

  return []
}

export function AdjustmentsProvider({ children }: { children: React.ReactNode }) {
  const [adjustments, setAdjustments] = useState<StockMovement[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState<AdjustmentsDialogType | null>(null)
  const [statusFilter, setStatusFilter] = useState<MovementStatus | 'ALL'>('ALL')

  const fetchAdjustments = useCallback(async () => {
    setIsLoading(true)
    try {
      const { role, warehouseId, branchId } = getAuthScope()
      const res = await stockMovementApi.getList({
        movementType: 'ADJUST',
        limit: 100,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      })

      const filtered = filterByRole(res.data, role ?? '', warehouseId, branchId)
      setAdjustments(filtered)
      setTotal(filtered.length)
    } catch (error) {
      console.error(error)
      setAdjustments([])
      setTotal(0)
      toast.error(
        getStockMovementErrorMessage(error, 'Không thể tải danh sách điều chỉnh tồn kho'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchAdjustments()
  }, [fetchAdjustments])

  return (
    <AdjustmentsContext.Provider
      value={{
        adjustments,
        total,
        isLoading,
        open,
        setOpen,
        statusFilter,
        setStatusFilter,
        fetchAdjustments,
      }}
    >
      {children}
    </AdjustmentsContext.Provider>
  )
}

export function useAdjustments() {
  const ctx = useContext(AdjustmentsContext)
  if (!ctx) throw new Error('useAdjustments must be used within <AdjustmentsProvider>')
  return ctx
}
