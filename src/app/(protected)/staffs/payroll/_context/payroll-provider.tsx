// [Context – UI State]
'use client'

import React, { createContext, useContext, useState } from 'react'
import { usePayrollMutations } from '../_hooks/use-payroll-mutations'
import type { PayrollDialogType } from '../_types/payroll.types'
import type { PayrollPeriod, PaySheet, Payslip } from '@/types/payroll'

interface PayrollContextProps {
  periods: PayrollPeriod[]
  paysheets: PaySheet[]
  settings: any
  activePeriod: PayrollPeriod | null
  staffs: any[]
  isLoading: boolean
  open: PayrollDialogType | null
  setOpen: (open: PayrollDialogType | null) => void
  currentRow: any
  setCurrentRow: (row: any) => void
  currentPayslip: Payslip | null
  setCurrentPayslip: (slip: Payslip | null) => void
  activePeriodId: string | null
  setActivePeriodId: (id: string | null) => void
  activePaysheetId: string | null
  setActivePaysheetId: (id: string | null) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  fetchPeriodDetails: (id: string) => Promise<PayrollPeriod | null>
  refreshPeriods: () => Promise<void>
  refreshPaysheets: () => Promise<void>
  handleAddPaysheet: (data: any) => Promise<boolean>
  handleEditPaysheet: (id: string, data: any) => Promise<boolean>
  handleUpdateSettings: (data: any) => Promise<boolean>
  handleCreatePeriod: (data: any) => Promise<boolean>
  handleAdjustPayslip: (periodId: string, payslipId: string, data: any) => Promise<boolean>
  handleSubmitPeriod: (id: string) => Promise<boolean>
  handleReturnToDraft: (id: string, reason?: string) => Promise<boolean>
  handleApprovePeriod: (id: string) => Promise<boolean>
  handleMarkPaid: (
    id: string,
    payload: { paymentReference?: string; paymentNote?: string }
  ) => Promise<boolean>
  setActivePeriod: (period: PayrollPeriod | null) => void
}

const PayrollContext = createContext<PayrollContextProps | null>(null)

export function PayrollProvider({ children }: { children: React.ReactNode }) {
  const mutations = usePayrollMutations()
  const [open, setOpen] = useState<PayrollDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<any>(null)
  const [currentPayslip, setCurrentPayslip] = useState<Payslip | null>(null)
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null)
  const [activePaysheetId, setActivePaysheetId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('periods')

  return (
    <PayrollContext.Provider
      value={{
        ...mutations,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        currentPayslip,
        setCurrentPayslip,
        activePeriodId,
        setActivePeriodId,
        activePaysheetId,
        setActivePaysheetId,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </PayrollContext.Provider>
  )
}

export function usePayroll() {
  const ctx = useContext(PayrollContext)
  if (!ctx) throw new Error('usePayroll must be used within <PayrollProvider>')
  return ctx
}
