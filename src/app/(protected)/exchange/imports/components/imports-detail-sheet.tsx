'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CheckCircle, XCircle, Building2, Warehouse, User, CalendarDays, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useImports } from './imports-provider'
import { STATUS_MAP } from './imports-columns'
import type { StockMovement } from '@/types/stock-movement'

interface ImportsDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: StockMovement | null
}

const formatVND = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

export function ImportsDetailSheet({ open, onOpenChange, request }: ImportsDetailSheetProps) {
  const { handleApprove, handleReject } = useImports()
  const [rejectNote, setRejectNote] = useState('')
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({})
  const [approveNote, setApproveNote] = useState('')
  const [showApproveForm, setShowApproveForm] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!request) return null

  const { label, className } = STATUS_MAP[request.status]
  const totalValue = request.details.reduce((s, d) => s + d.quantity * d.importPrice, 0)
  const isPending = request.status === 'PENDING'

  const getQty = (id: string, original: number) => receivedQtys[id] ?? original

  const onApprove = async () => {
    const details = request.details.map((d) => ({
      productItemId: d.productItemId,
      receivedQuantity: getQty(d.productItemId, d.quantity),
    }))
    await handleApprove(request._id, details, approveNote)
    setShowApproveForm(false)
    setApproveNote('')
    setReceivedQtys({})
  }

  const onReject = async () => {
    await handleReject(request._id, rejectNote)
    setShowRejectForm(false)
    setRejectNote('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="size-5" />
            Chi tiết đơn nhập hàng
            <span className="font-mono text-sm text-muted-foreground">
              #{request._id.slice(-6).toUpperCase()}
            </span>
          </SheetTitle>
          <SheetDescription>
            Xem thông tin và thực hiện duyệt / từ chối đơn nhập hàng.
          </SheetDescription>
        </SheetHeader>

        {/* Trạng thái */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className={`${className} text-sm px-3 py-1`}>{label}</Badge>
          {request.approvedByName && (
            <span className="text-sm text-muted-foreground">
              {request.status === 'APPROVED' ? 'Duyệt bởi' : 'Từ chối bởi'}: <strong>{request.approvedByName}</strong>
            </span>
          )}
        </div>

        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <InfoItem icon={<Building2 className="size-4" />} label="Nhà cung cấp" value={request.supplierName ?? '—'} />
          <InfoItem icon={<Warehouse className="size-4" />} label="Kho nhận" value={`${request.toLocationName} (${request.toLocationType === 'warehouse' ? 'Kho' : 'Chi nhánh'})`} />
          <InfoItem icon={<User className="size-4" />} label="Người tạo" value={request.requestedByName} />
          <InfoItem icon={<CalendarDays className="size-4" />} label="Ngày tạo" value={format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })} />
        </div>

        {request.note && (
          <div className="mb-4 p-3 rounded-lg bg-muted text-sm">
            <span className="font-medium">Ghi chú: </span>{request.note}
          </div>
        )}

        <Separator className="my-4" />

        {/* Bảng hàng hóa */}
        <h3 className="text-sm font-semibold mb-3">Danh sách hàng hóa</h3>
        <div className="rounded-md border mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hàng hóa</TableHead>
                <TableHead className="text-right">SL đặt</TableHead>
                {isPending && showApproveForm && <TableHead className="text-right">SL thực nhận</TableHead>}
                <TableHead className="text-right">Giá nhập</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.details.map((d) => (
                <TableRow key={d.productItemId}>
                  <TableCell>
                    <div className="font-medium text-sm">{d.productName}</div>
                    <div className="text-xs text-muted-foreground">{d.sku}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{d.quantity.toLocaleString('vi-VN')}</TableCell>
                  {isPending && showApproveForm && (
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        max={d.quantity}
                        className="w-20 h-7 text-sm text-right ml-auto"
                        value={getQty(d.productItemId, d.quantity)}
                        onChange={(e) =>
                          setReceivedQtys((prev) => ({ ...prev, [d.productItemId]: e.target.valueAsNumber }))
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell className="text-right tabular-nums">{formatVND(d.importPrice)}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{formatVND(d.quantity * d.importPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Tổng giá trị */}
        <div className="flex justify-end mb-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Tổng giá trị đơn</p>
            <p className="text-xl font-bold">{formatVND(totalValue)}</p>
          </div>
        </div>

        {/* Action buttons (chỉ hiện khi PENDING) */}
        {isPending && !showApproveForm && !showRejectForm && (
          <div className="flex gap-3">
            <Button className="flex-1 cursor-pointer" onClick={() => setShowApproveForm(true)}>
              <CheckCircle className="mr-2 size-4" />
              Duyệt đơn
            </Button>
            <Button variant="outline" className="flex-1 cursor-pointer text-destructive border-destructive hover:bg-destructive/10" onClick={() => setShowRejectForm(true)}>
              <XCircle className="mr-2 size-4" />
              Từ chối
            </Button>
          </div>
        )}

        {/* Form duyệt */}
        {isPending && showApproveForm && (
          <div className="space-y-3 border rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">Xác nhận duyệt đơn</h4>
            <p className="text-xs text-muted-foreground">Kiểm tra số lượng thực nhận ở bảng trên, điều chỉnh nếu cần.</p>
            <div>
              <Label className="text-sm">Ghi chú duyệt (tuỳ chọn)</Label>
              <Textarea value={approveNote} onChange={(e) => setApproveNote(e.target.value)} placeholder="Ghi chú khi duyệt..." className="mt-1 resize-none" rows={2} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 cursor-pointer" onClick={onApprove}>Xác nhận duyệt</Button>
              <Button variant="outline" className="cursor-pointer" onClick={() => setShowApproveForm(false)}>Huỷ</Button>
            </div>
          </div>
        )}

        {/* Form từ chối */}
        {isPending && showRejectForm && (
          <div className="space-y-3 border rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">Từ chối đơn nhập hàng</h4>
            <div>
              <Label className="text-sm">Lý do từ chối <span className="text-destructive">*</span></Label>
              <Textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Nhập lý do từ chối..." className="mt-1 resize-none" rows={2} />
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1 cursor-pointer" onClick={onReject} disabled={!rejectNote.trim()}>Xác nhận từ chối</Button>
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
