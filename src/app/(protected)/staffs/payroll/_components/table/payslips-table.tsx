'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Edit3, CheckCircle2, ArrowUpRight, Ban, DollarSign,
  Eye, Lock, AlertCircle, Info,
} from 'lucide-react'
import { usePayroll } from '../../_context/payroll-provider'
import { formatVND, STATUS_MAP } from '../../_constants/payroll.constants'
import type { Payslip, DeductionLine } from '@/types/payroll'

const formatDMY = (dateStr: string) => {
  if (!dateStr) return '—'
  try { return new Intl.DateTimeFormat('vi-VN').format(new Date(dateStr)) } catch { return dateStr }
}

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

  const isDraft = activePeriod.status === 'DRAFT'
  const isUnderReview = activePeriod.status === 'REVIEW'
  const isApproved = activePeriod.status === 'APPROVED'
  const isPaid = activePeriod.status === 'PAID'
  const statusStyle = STATUS_MAP[activePeriod.status] || { label: activePeriod.status, className: '' }

  function handleBack() {
    setActivePeriod(null)
    setActivePeriodId(null)
  }

  function handleAdjust(slip: Payslip, e: React.MouseEvent) {
    e.stopPropagation()
    setCurrentRow(activePeriod)
    setCurrentPayslip(slip)
    // Open the detail dialog — manual adjustments are edited inline in DRAFT mode
    setOpen('viewPayslipDetail')
  }

  function handleViewDetail(slip: Payslip, e?: React.MouseEvent) {
    if (e) e.stopPropagation()
    setCurrentRow(activePeriod)
    setCurrentPayslip(slip)
    setOpen('viewPayslipDetail')
  }

  const payslips = activePeriod.payslips || []
  const periodStart = formatDMY(activePeriod.periodStart)
  const periodEnd = formatDMY(activePeriod.periodEnd)
  const totalCost = payslips.reduce((sum, p) => sum + p.netSalary, 0)

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
              Chi tiết kỳ lương: {periodStart} ➔ {periodEnd}
            </h2>
            <p className="text-xs text-muted-foreground">
              Tổng quan ngày công, làm thêm giờ và thu nhập thực tế.
            </p>
          </div>
        </div>

        {/* Action Controls — follow business rules */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${statusStyle.className} border font-medium px-3 py-1 rounded-full text-xs`}>
            {statusStyle.label}
          </Badge>

          {/* DRAFT: can submit if has at least 1 payslip */}
          {isDraft && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleSubmitPeriod(activePeriod._id)}
              className="cursor-pointer"
              disabled={payslips.length === 0}
              title={payslips.length === 0 ? 'Phải có ít nhất một phiếu lương để gửi duyệt' : 'Gửi kỳ lương để phê duyệt'}
            >
              <ArrowUpRight className="mr-1.5 size-4" />
              Gửi yêu cầu duyệt
            </Button>
          )}

          {/* UNDER_REVIEW: return to draft (with reason) OR approve */}
          {isUnderReview && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentRow(activePeriod)
                  setOpen('returnDraft')
                }}
                className="cursor-pointer text-orange-600 border-orange-200 hover:bg-orange-50/50"
                title="Trả về bản nháp để sửa (bắt buộc nhập lý do)"
              >
                <Ban className="mr-1.5 size-4" />
                Trả về nháp
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApprovePeriod(activePeriod._id)}
                className="cursor-pointer bg-green-600 hover:bg-green-700 text-white"
                title="Phê duyệt — nhân viên sẽ nhận thông báo và xem được phiếu lương"
              >
                <CheckCircle2 className="mr-1.5 size-4" />
                Phê duyệt lương
              </Button>
            </>
          )}

          {/* APPROVED: mark as paid */}
          {isApproved && (
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

      {/* Info Banner — context-aware hints */}
      {isDraft && (
        <div className="flex items-start gap-2 text-xs bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/20 rounded-lg px-3 py-2.5 text-blue-700 dark:text-blue-400">
          <Info className="size-3.5 shrink-0 mt-0.5" />
          <span>
            Kỳ lương đang ở <strong>Bản nháp</strong>. Bấm vào biểu tượng ✏️ hoặc bấm thẳng vào dòng để thêm/sửa điều chỉnh thủ công và ghi chú cho từng phiếu lương. Nhân viên chưa xem được phiếu lương ở bước này.
          </span>
        </div>
      )}
      {isUnderReview && (
        <div className="flex items-start gap-2 text-xs bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/20 rounded-lg px-3 py-2.5 text-orange-700 dark:text-orange-400">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
          <span>
            Kỳ lương đang <strong>Chờ duyệt</strong>. Không thể sửa phiếu lương. Nếu cần chỉnh sửa, hãy bấm <strong>&quot;Trả về nháp&quot;</strong> (cần nhập lý do). Nhân viên chưa xem được phiếu lương ở bước này.
          </span>
        </div>
      )}
      {isApproved && (
        <div className="flex items-start gap-2 text-xs bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/20 rounded-lg px-3 py-2.5 text-blue-700 dark:text-blue-400">
          <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
          <span>
            Kỳ lương đã <strong>Được duyệt</strong>. Nhân viên đã nhận thông báo và có thể xem phiếu lương của mình. Xác nhận thanh toán khi đã chuyển lương.
          </span>
        </div>
      )}
      {isPaid && (
        <div className="flex items-start gap-2 text-xs bg-green-50/60 dark:bg-green-950/20 border border-green-100 dark:border-green-900/20 rounded-lg px-3 py-2.5 text-green-700 dark:text-green-400">
          <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
          <span>
            Kỳ lương đã <strong>Thanh toán xong</strong>. Không thể thực hiện thêm hành động nào.
          </span>
        </div>
      )}

      {/* Summary Financial Metric */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-white dark:bg-slate-900/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tổng chi phí thực nhận (Net)
          </p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 tabular-nums">
            {formatVND(totalCost)}
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-white dark:bg-slate-900/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Số lượng phiếu lương
          </p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {payslips.length} nhân viên
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
              <TableHead className="w-[80px] text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.map((slip: Payslip) => {
              const name = slip.userId?.profile
                ? `${slip.userId.profile.lastName} ${slip.userId.profile.firstName}`
                : slip.userId?.phoneNumber || 'Nhân viên'
              const phone = slip.userId?.phoneNumber || ''

              const diffAdjust = (slip.manualAdjustments || []).reduce((sum, c) => sum + c.amount, 0)
              const latePenalty = (slip.deductionLines || [])
                .filter((d: DeductionLine) => d.deductionType === 'LATE')
                .reduce((sum: number, d: DeductionLine) => sum + (d.amount || 0), 0) || (slip.latePenalty ?? 0)

              const basePay = slip.basePay ?? slip.baseSalary ?? 0
              const workedDays = slip.totalWorkedDays ?? slip.actualWorkingDays ?? 0
              const standardDays = slip.standardWorkingDays ?? 26
              const overtimePay = slip.overtimePay ?? 0

              return (
                <TableRow
                  key={slip._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 align-middle cursor-pointer"
                  onClick={(e) => handleViewDetail(slip, e)}
                >
                  <TableCell>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{name}</div>
                    <div className="text-xs text-muted-foreground">{phone}</div>
                    {slip.note && (
                      <div className="text-[11px] text-orange-600 bg-orange-50/50 border border-orange-100 rounded px-1.5 py-0.5 mt-1 inline-block dark:bg-orange-950/10 dark:border-orange-900/10">
                        {slip.note}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatVND(basePay)}</TableCell>
                  <TableCell className="text-center tabular-nums text-sm">
                    {workedDays}/{standardDays} ngày
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400 tabular-nums">
                    {latePenalty > 0 ? `-${formatVND(latePenalty)}` : '—'}
                  </TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400 tabular-nums">
                    {overtimePay > 0 ? `+${formatVND(overtimePay)}` : '—'}
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      {/* View always available */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        onClick={(e) => handleViewDetail(slip, e)}
                        title="Xem chi tiết"
                      >
                        <Eye className="size-4" />
                      </Button>

                      {/* Edit only in DRAFT */}
                      {isDraft && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={(e) => handleAdjust(slip, e)}
                          title="Thêm/sửa điều chỉnh (chỉ khi Bản nháp)"
                        >
                          <Edit3 className="size-4" />
                        </Button>
                      )}

                      {/* Lock icon when editing not allowed */}
                      {!isDraft && !isPaid && (
                        <span title="Không thể sửa phiếu lương khi kỳ không còn ở trạng thái Bản nháp">
                          <Lock className="size-3.5 text-muted-foreground/40 ml-1" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {payslips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <AlertCircle className="size-8 mb-3 opacity-40" />
            <p className="text-sm">Chưa có phiếu lương nào trong kỳ này.</p>
          </div>
        )}
      </div>
    </div>
  )
}
