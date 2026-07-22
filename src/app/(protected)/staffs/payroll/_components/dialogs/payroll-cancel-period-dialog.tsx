'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Ban, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import type { PayrollPeriod } from '@/types/payroll'
import { usePayroll } from '../../_context/payroll-provider'
import {
  cancelPayrollPeriodSchema,
  type CancelPayrollPeriodFormValues,
} from '../../_types/payroll.types'

type PayrollCancelPeriodDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: PayrollPeriod
}

const formatPeriodDate = (date: string) =>
  new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(date))

export function PayrollCancelPeriodDialog({
  open,
  onOpenChange,
  currentRow,
}: PayrollCancelPeriodDialogProps) {
  const { handleCancelPeriod } = usePayroll()
  const form = useForm<CancelPayrollPeriodFormValues>({
    resolver: zodResolver(cancelPayrollPeriodSchema),
    defaultValues: { reason: '' },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset()
    onOpenChange(nextOpen)
  }

  async function onSubmit(data: CancelPayrollPeriodFormValues) {
    const success = await handleCancelPeriod(currentRow._id, data.reason)
    if (success) handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hủy kỳ lương nháp</DialogTitle>
          <DialogDescription>
            Kỳ lương từ <strong>{formatPeriodDate(currentRow.periodStart)}</strong> đến{' '}
            <strong>{formatPeriodDate(currentRow.periodEnd)}</strong> sẽ chuyển sang trạng thái{' '}
            <strong>Đã hủy</strong>. Dữ liệu vẫn được giữ lại để tra cứu và không thể gửi duyệt.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do hủy</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="VD: Dữ liệu chấm công của kỳ này bị sai..."
                      maxLength={500}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Đóng
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Ban className="mr-2 size-4" />
                )}
                Xác nhận hủy kỳ
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
