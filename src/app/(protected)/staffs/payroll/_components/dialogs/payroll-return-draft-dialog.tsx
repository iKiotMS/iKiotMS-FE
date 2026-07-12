'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePayroll } from '../../_context/payroll-provider'

type PayrollReturnDraftDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: any // PayrollPeriod
}

export function PayrollReturnDraftDialog({ open, onOpenChange, currentRow }: PayrollReturnDraftDialogProps) {
  const { handleReturnToDraft } = usePayroll()
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setReason('')
    setSubmitting(false)
  }, [open])

  async function handleConfirm() {
    if (!currentRow) return
    setSubmitting(true)
    const success = await handleReturnToDraft(currentRow._id, reason)
    setSubmitting(false)
    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trả kỳ lương về nháp</DialogTitle>
          <DialogDescription>
            Đưa kỳ lương từ ngày <strong>{currentRow?.periodStart}</strong> đến{' '}
            <strong>{currentRow?.periodEnd}</strong> về trạng thái <strong>Bản nháp (Draft)</strong> để cho phép điều chỉnh tiếp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="reject-reason">Lý do từ chối / trả về nháp <span className="text-red-500">*</span></Label>
          <Input
            id="reject-reason"
            placeholder="VD: Cần xem lại ngày công của nhân viên A..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white"
            disabled={submitting || !reason.trim()}
          >
            <RefreshCw className="mr-2 size-4" />
            Xác nhận trả về nháp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
