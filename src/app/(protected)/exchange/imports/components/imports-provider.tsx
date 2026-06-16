'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { stockMovementApi } from '@/lib/api/stock-movement'
import type { StockMovement, MovementStatus } from '@/types/stock-movement'

export type ImportsDialogType = 'create'

interface ImportsContextType {
  imports: StockMovement[]
  total: number
  isLoading: boolean
  open: ImportsDialogType | null
  setOpen: (v: ImportsDialogType | null) => void
  currentRow: StockMovement | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StockMovement | null>>
  statusFilter: MovementStatus | 'ALL'
  setStatusFilter: (v: MovementStatus | 'ALL') => void
  fetchImports: () => Promise<void>
  handleApprove: (id: string, receivedDetails: { productItemId: string; receivedQuantity: number }[], note?: string) => Promise<void>
  handleReject: (id: string, note: string) => Promise<void>
}

const ImportsContext = createContext<ImportsContextType | null>(null)

export function ImportsProvider({ children }: { children: React.ReactNode }) {
  const [imports, setImports] = useState<StockMovement[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState<ImportsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<StockMovement | null>(null)
  const [statusFilter, setStatusFilter] = useState<MovementStatus | 'ALL'>('ALL')

  const fetchImports = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {
        movementType: 'IMPORT' as const,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      }
      const res = await stockMovementApi.getList(params)
      setImports(Array.isArray(res.data) ? res.data : (res as unknown as StockMovement[]))
      setTotal(res.total ?? (res as unknown as StockMovement[]).length ?? 0)
    } catch {
      // Nếu API chưa sẵn sàng, dùng mock data
      setImports(MOCK_IMPORTS)
      setTotal(MOCK_IMPORTS.length)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchImports()
  }, [fetchImports])

  const handleApprove = async (
    id: string,
    receivedDetails: { productItemId: string; receivedQuantity: number }[],
    note?: string
  ) => {
    try {
      await stockMovementApi.updateStatus(id, {
        status: 'APPROVED',
        details: receivedDetails,
        note,
      })
      toast.success('Đã duyệt đơn nhập hàng')
      setOpen(null)
      await fetchImports()
    } catch {
      toast.error('Không thể duyệt đơn, vui lòng thử lại')
    }
  }

  const handleReject = async (id: string, note: string) => {
    try {
      await stockMovementApi.updateStatus(id, { status: 'REJECTED', note })
      toast.success('Đã từ chối đơn nhập hàng')
      setOpen(null)
      await fetchImports()
    } catch {
      toast.error('Không thể từ chối đơn, vui lòng thử lại')
    }
  }

  return (
    <ImportsContext.Provider
      value={{ imports, total, isLoading, open, setOpen, currentRow, setCurrentRow, statusFilter, setStatusFilter, fetchImports, handleApprove, handleReject }}
    >
      {children}
    </ImportsContext.Provider>
  )
}

export function useImports() {
  const ctx = useContext(ImportsContext)
  if (!ctx) throw new Error('useImports must be used within <ImportsProvider>')
  return ctx
}

// ---------- Mock data (dùng khi BE chưa sẵn sàng) ----------
const MOCK_IMPORTS: StockMovement[] = [
  {
    _id: 'imp-001',
    tenantId: 'tenant-1',
    movementType: 'IMPORT',
    status: 'PENDING',
    fromSupplierId: 'sup-1',
    supplierName: 'Công ty TNHH Đại Phát',
    toLocationId: 'wh-1',
    toLocationName: 'Kho Trung Tâm',
    toLocationType: 'warehouse',
    requestedBy: 'user-1',
    requestedByName: 'Nguyễn Văn A',
    note: 'Nhập hàng định kỳ tháng 6',
    details: [
      { productItemId: 'pi-1', productName: 'Nước suối Lavie 500ml', sku: 'LAV-500', quantity: 100, importPrice: 4500, receivedQuantity: 0 },
      { productItemId: 'pi-2', productName: 'Coca-Cola 330ml', sku: 'COKE-330', quantity: 200, importPrice: 8000, receivedQuantity: 0 },
    ],
    createdAt: '2026-06-10T08:00:00Z',
    updatedAt: '2026-06-10T08:00:00Z',
  },
  {
    _id: 'imp-002',
    tenantId: 'tenant-1',
    movementType: 'IMPORT',
    status: 'APPROVED',
    fromSupplierId: 'sup-2',
    supplierName: 'Nhà phân phối Miền Nam',
    toLocationId: 'br-1',
    toLocationName: 'Chi nhánh Q.1',
    toLocationType: 'branch',
    requestedBy: 'user-2',
    requestedByName: 'Trần Thị B',
    approvedBy: 'user-3',
    approvedByName: 'Lê Quản Lý',
    note: '',
    details: [
      { productItemId: 'pi-3', productName: 'Bánh mì que', sku: 'BMQ-001', quantity: 50, importPrice: 12000, receivedQuantity: 50 },
    ],
    createdAt: '2026-06-08T09:30:00Z',
    updatedAt: '2026-06-09T10:00:00Z',
  },
  {
    _id: 'imp-003',
    tenantId: 'tenant-1',
    movementType: 'IMPORT',
    status: 'REJECTED',
    fromSupplierId: 'sup-1',
    supplierName: 'Công ty TNHH Đại Phát',
    toLocationId: 'wh-1',
    toLocationName: 'Kho Trung Tâm',
    toLocationType: 'warehouse',
    requestedBy: 'user-1',
    requestedByName: 'Nguyễn Văn A',
    approvedBy: 'user-3',
    approvedByName: 'Lê Quản Lý',
    note: 'Giá nhập không phù hợp',
    details: [
      { productItemId: 'pi-4', productName: 'Mì gói Hảo Hảo', sku: 'HH-001', quantity: 500, importPrice: 3500, receivedQuantity: 0 },
    ],
    createdAt: '2026-06-05T14:00:00Z',
    updatedAt: '2026-06-06T08:00:00Z',
  },
]
