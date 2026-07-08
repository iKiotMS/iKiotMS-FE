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
  handleApprove: (id: string) => Promise<void>
  handleReceive: (id: string, receivedDetails: { productItemId: string; receivedQuantity: number }[]) => Promise<void>
  handleCancel: (id: string) => Promise<void>
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
      setTransfers(res.data)
      setTotal(res.total)
    } catch (error) {
      console.error(error)
      setTransfers([])
      setTotal(0)
      toast.error('Không thể tải danh sách chuyển kho')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchTransfers() }, [fetchTransfers])

  const handleApprove = async (id: string) => {
    try {
      await stockMovementApi.approve(id)
      toast.success('Đã duyệt yêu cầu chuyển kho')
      setOpen(null)
      await fetchTransfers()
    } catch (error) {
      console.error(error)
      toast.error('Không thể duyệt yêu cầu, vui lòng thử lại')
    }
  }

  const handleReceive = async (
    id: string,
    receivedDetails: { productItemId: string; receivedQuantity: number }[],
  ) => {
    try {
      await stockMovementApi.receive(id, { details: receivedDetails })
      toast.success('Đã nhận hàng chuyển kho')
      setOpen(null)
      await fetchTransfers()
    } catch (error) {
      console.error(error)
      toast.error('Không thể nhận hàng chuyển kho')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await stockMovementApi.cancel(id)
      toast.success('Đã huỷ yêu cầu chuyển kho')
      setOpen(null)
      await fetchTransfers()
    } catch (error) {
      console.error(error)
      toast.error('Không thể huỷ yêu cầu chuyển kho')
    }
  }

  return (
    <TransfersContext.Provider
      value={{
        transfers,
        total,
        isLoading,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        statusFilter,
        setStatusFilter,
        fetchTransfers,
        handleApprove,
        handleReceive,
        handleCancel,
      }}
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
