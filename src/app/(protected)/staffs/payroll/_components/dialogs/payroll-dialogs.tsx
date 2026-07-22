'use client'

import { usePayroll } from '../../_context/payroll-provider'
import { PayrollSettingsDialog } from './payroll-settings-dialog'
import { PayrollPeriodDialog } from './payroll-period-dialog'
import { PayrollAdjustDialog } from './payroll-adjust-dialog'
import { PayrollMarkPaidDialog } from './payroll-mark-paid-dialog'
import { PayrollReturnDraftDialog } from './payroll-return-draft-dialog'
import { PayrollPayslipDetailDialog } from './payroll-payslip-detail-dialog'
import { PayrollCancelPeriodDialog } from './payroll-cancel-period-dialog'

export function PayrollDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, currentPayslip, setCurrentPayslip } = usePayroll()

  return (
    <>
      <PayrollPeriodDialog
        open={open === 'addPeriod'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      <PayrollSettingsDialog
        open={open === 'editSettings'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {currentRow && currentPayslip && open === 'adjustPayslip' && (
        <PayrollAdjustDialog
          open={open === 'adjustPayslip'}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null)
              setCurrentPayslip(null)
            }
          }}
          currentRow={currentRow}
          currentPayslip={currentPayslip}
        />
      )}

      {currentPayslip && open === 'viewPayslipDetail' && (
        <PayrollPayslipDetailDialog
          open={open === 'viewPayslipDetail'}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null)
              setCurrentPayslip(null)
            }
          }}
          currentPayslip={currentPayslip}
          periodStatus={currentRow?.status}
          periodId={currentRow?._id}
          onSaved={(updated) => {
            setCurrentPayslip(updated)
          }}
        />
      )}

      {currentRow && open === 'markPaid' && (
        <PayrollMarkPaidDialog
          open={open === 'markPaid'}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null)
              setCurrentRow(null)
            }
          }}
          currentRow={currentRow}
        />
      )}

      {currentRow && open === 'returnDraft' && (
        <PayrollReturnDraftDialog
          open={open === 'returnDraft'}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null)
              setCurrentRow(null)
            }
          }}
          currentRow={currentRow}
        />
      )}

      {currentRow && open === 'cancelPeriod' && (
        <PayrollCancelPeriodDialog
          open={open === 'cancelPeriod'}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null)
              setCurrentRow(null)
            }
          }}
          currentRow={currentRow}
        />
      )}
    </>
  )
}
