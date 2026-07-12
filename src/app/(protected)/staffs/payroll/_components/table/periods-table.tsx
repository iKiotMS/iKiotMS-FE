'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, CheckCircle2, ArrowUpRight, Ban, DollarSign, Calendar } from 'lucide-react'
import { usePayroll } from '../../_context/payroll-provider'
import { formatVND, STATUS_MAP } from '../../_constants/payroll.constants'
import type { PayrollPeriod } from '@/types/payroll'

export function PeriodsTable() {
  const {
    periods,
    setOpen,
    setCurrentRow,
    setActivePeriodId,
    fetchPeriodDetails,
    handleSubmitPeriod,
    handleApprovePeriod,
  } = usePayroll()

  if (periods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-white dark:bg-slate-900/10">
        <Calendar className="size-10 text-muted-foreground mb-4" />
        <h3 className="text-md font-semibold">Chưa có kỳ lương nào được tạo</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Tạo kỳ lương mới để tổng hợp ngày công và tính lương cho nhân viên.
        </p>
      </div>
    )
  }

  async function handleViewDetails(id: string) {
    setActivePeriodId(id)
    await fetchPeriodDetails(id)
  }

  return (
    <div className="rounded-md border bg-white dark:bg-slate-900/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chu kỳ lương (Thời gian)</TableHead>
            <TableHead className="text-right">Tổng chi dự kiến</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((p) => {
            const statusStyle = STATUS_MAP[p.status] || { label: p.status, className: '' }
            return (
              <TableRow key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                <TableCell className="font-semibold text-slate-700 dark:text-slate-200">
                  {p.periodStart} ➔ {p.periodEnd}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatVND(p.totalCost || 0)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={`${statusStyle.className} border font-medium px-2 py-0.5 rounded-full`}>
                    {statusStyle.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-slate-500 hover:text-slate-900">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuItem onClick={() => handleViewDetails(p._id)} className="cursor-pointer">
                        <Eye className="mr-2 size-4 text-slate-400" />
                        Xem chi tiết
                      </DropdownMenuItem>

                      {p.status === 'DRAFT' && (
                        <DropdownMenuItem
                          onClick={() => handleSubmitPeriod(p._id)}
                          className="cursor-pointer"
                        >
                          <ArrowUpRight className="mr-2 size-4 text-blue-500" />
                          Gửi yêu cầu duyệt
                        </DropdownMenuItem>
                      )}

                      {p.status === 'UNDER_REVIEW' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleApprovePeriod(p._id)}
                            className="cursor-pointer font-medium"
                          >
                            <CheckCircle2 className="mr-2 size-4 text-green-500" />
                            Phê duyệt lương
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentRow(p)
                              setOpen('returnDraft')
                            }}
                            className="cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50/50"
                          >
                            <Ban className="mr-2 size-4 text-orange-500" />
                            Trả về nháp
                          </DropdownMenuItem>
                        </>
                      )}

                      {p.status === 'APPROVED' && (
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentRow(p)
                            setOpen('markPaid')
                          }}
                          className="cursor-pointer bg-green-50/20 text-green-700 hover:bg-green-50"
                        >
                          <DollarSign className="mr-2 size-4 text-green-600" />
                          Xác nhận thanh toán
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
