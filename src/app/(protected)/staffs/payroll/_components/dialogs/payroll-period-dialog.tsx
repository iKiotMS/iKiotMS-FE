'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calculator, Check, Plus, RefreshCw } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePayroll } from '../../_context/payroll-provider'
import { periodCreateSchema, type PeriodCreateFormValues } from '../../_types/payroll.types'
import { payrollApi } from '@/lib/api/payroll'
import { formatVND } from '../../_constants/payroll.constants'
import type { Payslip } from '@/types/payroll'
import { toast } from 'sonner'

type PayrollPeriodDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEFAULT_RANGE: PeriodCreateFormValues = {
  // Default range is current month
  periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  userIds: [],
}

export function PayrollPeriodDialog({ open, onOpenChange }: PayrollPeriodDialogProps) {
  const { handleCreatePeriod } = usePayroll()
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewData, setPreviewData] = useState<{
    summary: { totalCost: number; totalEmployees: number }
    payslips: Payslip[]
  } | null>(null)

  const form = useForm<PeriodCreateFormValues>({
    resolver: zodResolver(periodCreateSchema),
    defaultValues: DEFAULT_RANGE,
  })

  useEffect(() => {
    if (!open) return
    form.reset(DEFAULT_RANGE)
    setPreviewData(null)
  }, [open, form])

  async function handlePreview() {
    const start = form.getValues('periodStart')
    const end = form.getValues('periodEnd')
    if (!start || !end) {
      toast.error('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc')
      return
    }

    setPreviewLoading(true)
    try {
      const res = await payrollApi.preview({
        periodStartDate: start,
        periodEndDate: end,
      })
      setPreviewData(res)
      toast.success('Tính toán thử kỳ lương thành công')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Tính thử kỳ lương thất bại. Vui lòng kiểm tra lại cấu hình hoặc chấm công.')
    } finally {
      setPreviewLoading(false)
    }
  }

  async function onSubmit(data: PeriodCreateFormValues) {
    const success = await handleCreatePeriod(data)
    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo kỳ lương mới</DialogTitle>
          <DialogDescription>
            Chọn khoảng thời gian tính lương. Bạn có thể xem trước tính toán chi tiết trước khi xác nhận lưu.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="periodStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="w-full cursor-pointer flex items-center justify-center gap-2"
                onClick={handlePreview}
                disabled={previewLoading}
              >
                {previewLoading ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <Calculator className="size-4" />
                )}
                Xem trước tính toán (Preview Calculation)
              </Button>
            </div>

            {/* Preview Section */}
            {previewData && (
              <div className="space-y-4 border rounded-lg p-4 bg-muted/40 animate-in fade-in duration-300">
                <div className="flex justify-between items-center bg-muted p-3 rounded-lg border border-dashed">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Tổng chi lương dự kiến (Net)
                    </p>
                    <p className="text-xl font-bold text-primary tabular-nums">
                      {formatVND(previewData.summary.totalCost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Nhân viên
                    </p>
                    <p className="text-xl font-bold tabular-nums">
                      {previewData.summary.totalEmployees}
                    </p>
                  </div>
                </div>

                <div className="border rounded-md max-h-60 overflow-y-auto bg-background">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10 shadow-xs">
                      <TableRow>
                        <TableHead>Nhân viên</TableHead>
                        <TableHead className="text-right">Lương cơ bản</TableHead>
                        <TableHead className="text-center">Ngày công (Thực tế/Chuẩn)</TableHead>
                        <TableHead className="text-right font-medium">Lương thực nhận (Net)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.payslips.map((slip) => {
                        const name = slip.userId?.profile
                          ? `${slip.userId.profile.lastName} ${slip.userId.profile.firstName}`
                          : slip.userId?.phoneNumber || 'Nhân viên'
                        return (
                          <TableRow key={slip.userId?._id || Math.random()}>
                            <TableCell className="font-medium">{name}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatVND(slip.baseSalary)}
                            </TableCell>
                            <TableCell className="text-center tabular-nums text-sm">
                              {slip.actualWorkingDays}/{slip.standardWorkingDays} ngày
                            </TableCell>
                            <TableCell className="text-right font-bold text-green-600 dark:text-green-400 tabular-nums">
                              {formatVND(slip.netSalary)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={!previewData || previewLoading}
              >
                <Plus className="mr-2 size-4" />
                Xác nhận tạo (Lưu nháp)
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
