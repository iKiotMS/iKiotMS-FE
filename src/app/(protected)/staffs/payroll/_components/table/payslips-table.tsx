'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit3, ShieldAlert, CheckCircle2, ArrowUpRight, Ban, DollarSign } from 'lucide-react'
import { usePayroll } from '../../_context/payroll-provider'
import { formatVND, STATUS_MAP, ADJUSTMENT_TYPE_MAP } from '../../_constants/payroll.constants'

export function PayslipsTable() {
  const {
    activePeriod,
    setActivePeriod,
    setActivePeriodId,
    setOpen,
    setCurrentRow,
    setCurrentPayslip,
    handleSubmitPeriod,
    handleApprovePeriod,
  } = usePayroll()

  if (!activePeriod) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900/10 rounded-lg border">
        <span className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
        <p className="text-sm text-muted-foreground">Đang tải danh sách phiếu lương...</p>
      </div>
    )
  }

  function handleBack() {
    setActivePeriod(null)
    setActivePeriodId(null)
  }

  function handleAdjust(slip: any) {
    setCurrentRow(activePeriod)
    setCurrentPayslip(slip)
    setOpen('adjustPayslip')
  }

  const statusStyle = STATUS_MAP[activePeriod.status] || { label: activePeriod.status, className: '' }

  return (
    <div className="space-y-6">
      {/* Detail Header Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handleBack} className="cursor-pointer size-8">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Chi tiết kỳ lương: {activePeriod.periodStart} ➔ {activePeriod.periodEnd}
            </h2>
            <p className="text-xs text-muted-foreground">
              Tổng quan ngày công, làm thêm giờ và thu nhập thực tế.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${statusStyle.className} border font-medium px-3 py-1 rounded-full text-xs`}>
            {statusStyle.label}
          </Badge>

          {activePeriod.status === 'DRAFT' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleSubmitPeriod(activePeriod._id)}
              className="cursor-pointer"
            >
              <ArrowUpRight className="mr-1.5 size-4" />
              Gửi yêu cầu duyệt
            </Button>
          )}

          {activePeriod.status === 'UNDER_REVIEW' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentRow(activePeriod)
                  setOpen('returnDraft')
                }}
                className="cursor-pointer text-orange-600 border-orange-200 hover:bg-orange-50/50"
              >
                <Ban className="mr-1.5 size-4" />
                Từ chối (Về nháp)
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApprovePeriod(activePeriod._id)}
                className="cursor-pointer bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="mr-1.5 size-4" />
                Phê duyệt lương
              </Button>
            </>
          )}

          {activePeriod.status === 'APPROVED' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setCurrentRow(activePeriod)
                setOpen('markPaid')
              }}
              className="cursor-pointer bg-green-600 hover:bg-green-700 text-white"
            >
              <DollarSign className="mr-1.5 size-4" />
              Xác nhận thanh toán
            </Button>
          )}
        </div>
      </div>

      {/* Summary Financial Metric */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-white dark:bg-slate-900/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tổng chi phí thực nhận (Net)
          </p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 tabular-nums">
            {formatVND(activePeriod.totalCost || 0)}
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-white dark:bg-slate-900/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Số lượng phiếu lương
          </p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {activePeriod.payslips?.length || 0} nhân viên
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-white dark:bg-slate-900/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Thời điểm tổng hợp
          </p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-2.5">
            {activePeriod.createdAt ? new Date(activePeriod.createdAt).toLocaleString('vi-VN') : '—'}
          </p>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="rounded-md border bg-white dark:bg-slate-900/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead className="text-right">Lương cơ bản</TableHead>
              <TableHead className="text-center">Ngày công (Thực tế/Chuẩn)</TableHead>
              <TableHead className="text-right">Phạt đi muộn</TableHead>
              <TableHead className="text-right">Lương làm thêm</TableHead>
              <TableHead className="text-right">Điều chỉnh khác</TableHead>
              <TableHead className="text-right font-medium">Thực nhận (Net)</TableHead>
              {activePeriod.status === 'DRAFT' && <TableHead className="w-[80px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {activePeriod.payslips?.map((slip) => {
              const name = slip.userId?.profile
                ? `${slip.userId.profile.lastName} ${slip.userId.profile.firstName}`
                : slip.userId?.phoneNumber || 'Nhân viên'
              const phone = slip.userId?.phoneNumber || ''

              // Compute other manual adjustments sum
              const diffAdjust = (slip.manualAdjustments || []).reduce((sum, c) => sum + c.amount, 0)

              return (
                <TableRow key={slip._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 align-middle">
                  <TableCell>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{name}</div>
                    <div className="text-xs text-muted-foreground">{phone}</div>
                    {slip.note && (
                      <div className="text-[11px] text-orange-600 bg-orange-50/50 border border-orange-100 rounded px-1.5 py-0.5 mt-1 inline-block dark:bg-orange-950/10 dark:border-orange-900/10">
                        {slip.note}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatVND(slip.baseSalary)}</TableCell>
                  <TableCell className="text-center tabular-nums text-sm">
                    {slip.actualWorkingDays}/{slip.standardWorkingDays} ngày
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400 tabular-nums">
                    {slip.latePenalty > 0 ? `-${formatVND(slip.latePenalty)}` : '—'}
                  </TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400 tabular-nums">
                    {slip.overtimePay > 0 ? `+${formatVND(slip.overtimePay)}` : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {diffAdjust > 0 ? (
                      <span className="text-green-600 font-medium">+{formatVND(diffAdjust)}</span>
                    ) : diffAdjust < 0 ? (
                      <span className="text-red-600 font-medium">-{formatVND(Math.abs(diffAdjust))}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600 dark:text-green-400 tabular-nums">
                    {formatVND(slip.netSalary)}
                  </TableCell>
                  {activePeriod.status === 'DRAFT' && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer h-8 w-8 text-primary hover:bg-primary/10"
                        onClick={() => handleAdjust(slip)}
                      >
                        <Edit3 className="size-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
