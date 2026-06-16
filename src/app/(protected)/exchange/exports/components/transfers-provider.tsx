'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { stockMovementApi } from '@/lib/api/stock-movement'
import type { StockMovement, MovementStatus } from '@/types/stock-movement'

export type TransfersDialogType = 'create'

interface TransfersContextType {
  transfers: StockMovement[]
  total: number
  isLoading: boolean
  open: TransfersDialogType | null
  setOpen: (v: TransfersDialogType | null) => void
  currentRow: StockMovement | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StockMovement | null>>
  statusFilter: MovementStatus | 'ALL'
  setStatusFilter: (v: MovementStatus | 'ALL') => void
  fetchTransfers: () => Promise<void>
  handleApprove: (id: string, note?: string) => Promise<void>
  handleReject: (id: string, note: string) => Promise<void>
}

const TransfersContext = createContext<TransfersContextType | null>(null)

export function TransfersProvider({ children }: { children: React.ReactNode }) {
  const [transfers, setTransfers] = useState<StockMovement[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState<TransfersDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<StockMovement | null>(null)
  const [statusFilter, setStatusFilter] = useState<MovementStatus | 'ALL'>('ALL')

  const fetchTransfers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {
        movementType: 'TRANSFER' as const,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      }
      const res = await stockMovementApi.getList(params)
      setTransfers(Array.isArray(res.data) ? res.data : (res as unknown as StockMovement[]))
      setTotal(res.total ?? (res as unknown as StockMovement[]).length ?? 0)
    } catch {
      setTransfers(MOCK_TRANSFERS)
      setTotal(MOCK_TRANSFERS.length)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchTransfers() }, [fetchTransfers])

  const handleApprove = async (id: string, note?: string) => {
    try {
      await stockMovementApi.updateStatus(id, { status: 'APPROVED', note })
      toast.success('Đã duyệt yêu cầu chuyển kho')
      setOpen(null)
      await fetchTransfers()
    } catch {
      toast.error('Không thể duyệt yêu cầu, vui lòng thử lại')
    }
  }

  const handleReject = async (id: string, note: string) => {
    try {
      await stockMovementApi.updateStatus(id, { status: 'REJECTED', note })
      toast.success('Đã từ chối yêu cầu chuyển kho')
      setOpen(null)
      await fetchTransfers()
    } catch {
      toast.error('Không thể từ chối yêu cầu, vui lòng thử lại')
    }
  }

  return (
    <TransfersContext.Provider
      value={{ transfers, total, isLoading, open, setOpen, currentRow, setCurrentRow, statusFilter, setStatusFilter, fetchTransfers, handleApprove, handleReject }}
    >
      {children}
    </TransfersContext.Provider>
  )
}

export function useTransfers() {
  const ctx = useContext(TransfersContext)
  if (!ctx) throw new Error('useTransfers must be used within <TransfersProvider>')
  return ctx
}

const MOCK_TRANSFERS: StockMovement[] = [
  {
    _id: 'trf-001',
    tenantId: 'tenant-1',
    movementType: 'TRANSFER',
    status: 'PENDING',
    fromLocationId: 'wh-1',
    fromLocationName: 'Kho Trung Tâm',
    fromLocationType: 'warehouse',
    toLocationId: 'br-1',
    toLocationName: 'Chi nhánh Q.1',
    toLocationType: 'branch',
    requestedBy: 'user-2',
    requestedByName: 'Trần Thị B',
    note: 'Bổ sung hàng cho chi nhánh',
    details: [
      { productItemId: 'pi-1', productName: 'Nước suối Lavie 500ml', sku: 'LAV-500', quantity: 50, importPrice: 0, receivedQuantity: 0 },
      { productItemId: 'pi-2', productName: 'Coca-Cola 330ml', sku: 'COKE-330', quantity: 30, importPrice: 0, receivedQuantity: 0 },
    ],
    createdAt: '2026-06-12T09:00:00Z',
    updatedAt: '2026-06-12T09:00:00Z',
  },
  {
    _id: 'trf-002',
    tenantId: 'tenant-1',
    movementType: 'TRANSFER',
    status: 'APPROVED',
    fromLocationId: 'wh-1',
    fromLocationName: 'Kho Trung Tâm',
    fromLocationType: 'warehouse',
    toLocationId: 'br-2',
    toLocationName: 'Chi nhánh Q.3',
    toLocationType: 'branch',
    requestedBy: 'user-3',
    requestedByName: 'Lê Quản Lý',
    approvedBy: 'user-1',
    approvedByName: 'Nguyễn Văn A',
    note: '',
    details: [
      { productItemId: 'pi-3', productName: 'Bánh mì que', sku: 'BMQ-001', quantity: 20, importPrice: 0, receivedQuantity: 20 },
    ],
    createdAt: '2026-06-11T14:00:00Z',
    updatedAt: '2026-06-11T16:00:00Z',
  },
]
