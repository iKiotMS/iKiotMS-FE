'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calculator, Plus, RefreshCw } from 'lucide-react'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePayroll } from '../../_context/payroll-provider'
import { periodCreateSchema, type PeriodCreateFormValues } from '../../_types/payroll.types'
import { payrollApi } from '@/lib/api/payroll'
import { formatVND } from '../../_constants/payroll.constants'
import type { Payslip } from '@/types/payroll'
import { toast } from 'sonner'
import { PayrollPayslipDetailDialog } from './payroll-payslip-detail-dialog'
// Helper to format ISO date string to DD/MM/YYYY (Vietnam locale)
const formatDMY = (dateStr: string) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('vi-VN').format(date)
  } catch {
    return dateStr
  }
}
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
  const { handleCreatePeriod, staffs, settings } = usePayroll()
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewData, setPreviewData] = useState<{
    summary: {
      totalEmployees: number
      generatedCount: number
      skippedCount: number
      totalBasePay: number
      totalOvertimePay: number
      totalGrossSalary: number
      totalNetSalary: number
      totalCost?: number
    }
    payslips: Payslip[]
    skipped: { userId: string; reason: string }[]
  } | null>(null)
  const [activePreviewSlip, setActivePreviewSlip] = useState<Payslip | null>(null)

  const form = useForm<PeriodCreateFormValues>({
    resolver: zodResolver(periodCreateSchema),
    defaultValues: DEFAULT_RANGE,
  })

  // Watch selected dates to display formatted in preview header
  const watchStart = form.watch('periodStart')
  const watchEnd = form.watch('periodEnd')

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
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      toast.error(axiosError.response?.data?.message || 'Tính thử kỳ lương thất bại. Vui lòng kiểm tra lại cấu hình hoặc chấm công.')
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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
                {/* Period date header */}
                <p className="text-xs text-muted-foreground text-center">
                  Kỳ lương: <span className="font-semibold text-foreground">{formatDMY(watchStart)}</span>
                  {' → '}
                  <span className="font-semibold text-foreground">{formatDMY(watchEnd)}</span>
                </p>

                <div className="flex justify-between items-center bg-muted p-3 rounded-lg border border-dashed">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Tổng chi lương dự kiến (Net)
                    </p>
                    <p className="text-xl font-bold text-primary tabular-nums">
                      {formatVND(previewData.summary.totalNetSalary ?? previewData.summary.totalCost ?? 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Nhân viên (Tính / Tổng)
                    </p>
                    <p className="text-xl font-bold tabular-nums">
                      {previewData.summary.generatedCount} / {previewData.summary.totalEmployees}
                    </p>
                  </div>
                </div>

                <div className="border rounded-md max-h-60 overflow-y-auto bg-background">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10 shadow-xs">
                      <TableRow>
                        <TableHead>Nhân viên</TableHead>
                        <TableHead className="text-right">Lương chính</TableHead>
                        <TableHead className="text-right">Phụ cấp</TableHead>
                        <TableHead className="text-right">Tăng ca</TableHead>
                        <TableHead className="text-right">Giảm trừ</TableHead>
                        <TableHead className="text-center">Ngày công</TableHead>
                        <TableHead className="text-right font-medium">Lương thực nhận (Net)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.payslips.map((slip, idx) => {
                        const staffId = typeof slip.userId === 'string' ? slip.userId : slip.userId?._id
                        const staff = staffs.find((s) => s._id === staffId)

                        let name = 'Nhân viên'
                        let email = staff?.email || ''

                        if (slip.user) {
                          if (slip.user.profile) {
                            name = `${slip.user.profile.lastName || ''} ${slip.user.profile.firstName || ''}`.trim()
                          } else {
                            name = slip.user.phoneNumber || slip.user.email || 'Nhân viên'
                          }
                          email = slip.user.email || email
                        } else if (staff) {
                          name = `${staff.lastName || ''} ${staff.firstName || ''}`.trim()
                          if (!name) {
                            name = staff.phoneNumber || staff.email || 'Nhân viên'
                          }
                        }

                        if (!name) name = 'Nhân viên'

                        const rowKey = slip._id || (typeof slip.userId === 'string' ? slip.userId : slip.userId?._id) || `preview-slip-${idx}`

                        return (
                          <TableRow
                            key={rowKey}
                            className="cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/10"
                            onClick={() => setActivePreviewSlip(slip)}
                          >
                            <TableCell className="font-medium">
                              <div>
                                <p className="text-sm font-semibold">{name}</p>
                                {email && <p className="text-[10px] text-muted-foreground">{email}</p>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                              {formatVND(slip.basePay ?? 0)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm text-blue-600 dark:text-blue-400">
                              {formatVND(slip.allowance ?? 0)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm text-orange-600 dark:text-orange-400">
                              {formatVND(slip.overtimePay ?? 0)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm text-destructive">
                              {formatVND(slip.deduction ?? 0)}
                            </TableCell>
                            <TableCell className="text-center tabular-nums text-xs">
                              {slip.totalWorkedDays ?? 0} / {settings?.standardWorkingDays || 26} ngày
                            </TableCell>
                            <TableCell className="text-right font-bold text-green-600 dark:text-green-400 tabular-nums">
                              {formatVND(slip.netSalary ?? 0)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {previewData.skipped?.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-xs font-semibold text-muted-foreground">Bỏ qua không tính lương ({previewData.skipped.length}):</p>
                    <div className="bg-destructive/10 text-destructive text-xs rounded-lg p-2.5 space-y-1">
                      {previewData.skipped.map((skipItem: { userId: string; reason: string }, idx) => {
                        const skipStaff = staffs.find((s) => s._id === skipItem.userId)

                        let skipName = ''
                        if (skipStaff) {
                          const last = skipStaff.lastName || ''
                          const first = skipStaff.firstName || ''
                          skipName = `${last} ${first}`.trim()
                        }
                        if (!skipName) {
                          skipName = skipStaff?.email || skipStaff?.phoneNumber || 'Nhân viên'
                        }

                        return (
                          <div key={idx} className="flex justify-between">
                            <span className="font-semibold">{skipName}</span>
                            <span>{skipItem.reason}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
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

        {activePreviewSlip && (
          <PayrollPayslipDetailDialog
            open={activePreviewSlip !== null}
            onOpenChange={(v) => {
              if (!v) setActivePreviewSlip(null)
            }}
            currentPayslip={activePreviewSlip}
            periodStatus="DRAFT"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
