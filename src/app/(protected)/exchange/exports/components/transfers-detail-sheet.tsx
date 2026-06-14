'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CheckCircle, XCircle, ArrowRight, User, CalendarDays, Warehouse, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTransfers } from './transfers-provider'
import { STATUS_MAP } from './transfers-columns'
import type { StockMovement } from '@/types/stock-movement'

interface TransfersDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: StockMovement | null
}

export function TransfersDetailSheet({ open, onOpenChange, request }: TransfersDetailSheetProps) {
  const { handleApprove, handleReject } = useTransfers()
  const [approveNote, setApproveNote] = useState('')
  const [rejectNote, setRejectNote] = useState('')
  const [showApproveForm, setShowApproveForm] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!request) return null

  const { label, className } = STATUS_MAP[request.status]
  const totalQty = request.details.reduce((s, d) => s + d.quantity, 0)
  const isPending = request.status === 'PENDING'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="size-5" />
            Chi tiết yêu cầu chuyển kho
            <span className="font-mono text-sm text-muted-foreground">
              #{request._id.slice(-6).toUpperCase()}
            </span>
          </SheetTitle>
          <SheetDescription>
            Xem thông tin và thực hiện duyệt / từ chối yêu cầu chuyển kho.
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className={`${className} text-sm px-3 py-1`}>{label}</Badge>
        </div>

        {/* Luồng chuyển kho */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
          <div className="flex flex-col items-center text-sm">
            <Warehouse className="size-5 mb-1 text-muted-foreground" />
            <span className="font-medium">{request.fromLocationName ?? '—'}</span>
            <span className="text-xs text-muted-foreground capitalize">{request.fromLocationType === 'warehouse' ? 'Kho' : 'Chi nhánh'}</span>
          </div>
          <ArrowRight className="size-5 text-muted-foreground flex-shrink-0" />
          <div className="flex flex-col items-center text-sm">
            <Warehouse className="size-5 mb-1 text-muted-foreground" />
            <span className="font-medium">{request.toLocationName}</span>
            <span className="text-xs text-muted-foreground capitalize">{request.toLocationType === 'warehouse' ? 'Kho' : 'Chi nhánh'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <InfoItem icon={<User className="size-4" />} label="Người yêu cầu" value={request.requestedByName} />
          <InfoItem icon={<CalendarDays className="size-4" />} label="Ngày tạo" value={format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })} />
        </div>

        {request.note && (
          <div className="mb-4 p-3 rounded-lg bg-muted text-sm">
            <span className="font-medium">Ghi chú: </span>{request.note}
          </div>
        )}

        <Separator className="my-4" />

        <h3 className="text-sm font-semibold mb-3">Danh sách hàng hóa chuyển</h3>
        <div className="rounded-md border mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hàng hóa</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.details.map((d) => (
                <TableRow key={d.productItemId}>
                  <TableCell>
                    <div className="font-medium text-sm">{d.productName}</div>
                    <div className="text-xs text-muted-foreground">{d.sku}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{d.quantity.toLocaleString('vi-VN')}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.note ?? '—'}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold">Tổng cộng</TableCell>
                <TableCell className="text-right tabular-nums font-bold">{totalQty.toLocaleString('vi-VN')}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {isPending && !showApproveForm && !showRejectForm && (
          <div className="flex gap-3">
            <Button className="flex-1 cursor-pointer" onClick={() => setShowApproveForm(true)}>
              <CheckCircle className="mr-2 size-4" />Duyệt yêu cầu
            </Button>
            <Button variant="outline" className="flex-1 cursor-pointer text-destructive border-destructive hover:bg-destructive/10" onClick={() => setShowRejectForm(true)}>
              <XCircle className="mr-2 size-4" />Từ chối
            </Button>
          </div>
        )}

        {isPending && showApproveForm && (
          <div className="space-y-3 border rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">Xác nhận duyệt yêu cầu chuyển kho</h4>
            <div>
              <Label className="text-sm">Ghi chú (tuỳ chọn)</Label>
              <Textarea value={approveNote} onChange={(e) => setApproveNote(e.target.value)} placeholder="Ghi chú khi duyệt..." className="mt-1 resize-none" rows={2} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 cursor-pointer" onClick={() => handleApprove(request._id, approveNote)}>Xác nhận duyệt</Button>
              <Button variant="outline" className="cursor-pointer" onClick={() => setShowApproveForm(false)}>Huỷ</Button>
            </div>
          </div>
        )}

        {isPending && showRejectForm && (
          <div className="space-y-3 border rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">Từ chối yêu cầu chuyển kho</h4>
            <div>
              <Label className="text-sm">Lý do từ chối <span className="text-destructive">*</span></Label>
              <Textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Nhập lý do từ chối..." className="mt-1 resize-none" rows={2} />
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1 cursor-pointer" onClick={() => handleReject(request._id, rejectNote)} disabled={!rejectNote.trim()}>Xác nhận từ chối</Button>
              <Button variant="outline" className="cursor-pointer" onClick={() => setShowRejectForm(false)}>Huỷ</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
