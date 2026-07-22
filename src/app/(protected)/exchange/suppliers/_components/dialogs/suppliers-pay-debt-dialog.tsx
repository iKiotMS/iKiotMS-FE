// [Dialog – Thanh toán công nợ nhà cung cấp]
'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Banknote, CheckCircle2, CreditCard, Loader2, QrCode, Copy } from 'lucide-react'
import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getSocket, joinRoom } from '@/lib/socket'
import type { Supplier } from '@/types/supplier'
import { useSuppliers } from '../../_context/suppliers-provider'

// --- Schema ---
const payDebtSchema = z.object({
  amount: z
    .number({ message: 'Số tiền phải là số' })
    .positive('Số tiền phải lớn hơn 0')
    .max(1_000_000_000_000, 'Số tiền vượt giới hạn'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER'] as const),
  note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
})

type PayDebtFormValues = z.infer<typeof payDebtSchema>

// form        → nhập thông tin
// qr-loading  → đang gọi initiateQr (tạo QR + lưu intent)
// qr          → hiển thị QR, lắng nghe socket "supplier:debt-paid"
// done        → hoàn tất (nhận được event socket hoặc CASH thành công)
type DialogStep = 'form' | 'qr-loading' | 'qr' | 'done'

function formatVND(amount: number) {
  return amount.toLocaleString('vi-VN') + ' ₫'
}

type SuppliersPayDebtDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
}

export function SuppliersPayDebtDialog({
  open,
  onOpenChange,
  supplier,
}: SuppliersPayDebtDialogProps) {
  const { handleInitiateQr, handlePayDebt, updateSupplierInList } = useSuppliers()
  const [step, setStep] = useState<DialogStep>('form')
  const [qrUrl, setQrUrl] = useState<string>('')
  const [paymentReference, setPaymentReference] = useState<string>('')
  const [pendingFormData, setPendingFormData] = useState<PayDebtFormValues | null>(null)
  const [paidAmount, setPaidAmount] = useState<number>(0)

  const form = useForm<PayDebtFormValues>({
    resolver: zodResolver(payDebtSchema),
    defaultValues: {
      amount: undefined as unknown as number,
      paymentMethod: 'CASH',
      note: '',
    },
  })

  // ── Reset khi đóng ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      form.reset({
        amount: undefined as unknown as number,
        paymentMethod: 'CASH',
        note: '',
      })
      setStep('form')
      setQrUrl('')
      setPaymentReference('')
      setPendingFormData(null)
      setPaidAmount(0)
    }
  }, [open, form])

  // ── Socket: lắng nghe "supplier:debt-paid" khi đang ở bước QR ───────────────
  useEffect(() => {
    if (step !== 'qr' || !paymentReference) return

    const room = `supplier-payment:${paymentReference}`
    joinRoom(room)

    const socket = getSocket()

    const handlePaid = (data: { supplier: Supplier; paidAmount: number }) => {
      setPaidAmount(data.paidAmount)
      // Cập nhật supplier trong danh sách
      if (data.supplier) {
        // Map _id -> id nếu backend trả về Mongoose document
        const mapped = {
          ...data.supplier,
          id: String((data.supplier as unknown as { _id: string })._id ?? data.supplier.id),
        } as Supplier
        updateSupplierInList(mapped)
      }
      toast.success(`Đã xác nhận chuyển khoản ${formatVND(data.paidAmount)}`)
      setStep('done')
    }

    socket.on('supplier:debt-paid', handlePaid)
    return () => {
      socket.off('supplier:debt-paid', handlePaid)
    }
  }, [step, paymentReference])

  const watchedAmount = form.watch('amount')
  const watchedMethod = form.watch('paymentMethod')
  const exceedsDebt =
    supplier && watchedAmount > 0 && watchedAmount > supplier.outstandingDebt

  const debtRatio =
    supplier && supplier.creditLimit > 0
      ? (supplier.outstandingDebt / supplier.creditLimit) * 100
      : 0

  async function onSubmit(data: PayDebtFormValues) {
    if (!supplier) return

    if (data.paymentMethod === 'CASH') {
      // CASH: gọi payDebt ngay lập tức
      const success = await handlePayDebt(supplier.id, {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        note: data.note || undefined,
      })
      if (success) {
        setPaidAmount(data.amount)
        setStep('done')
      }
    } else {
      // BANK_TRANSFER: bước 1 — gọi initiateQr (lưu intent vào DB, tạo QR)
      setStep('qr-loading')
      setPendingFormData(data)

      const result = await handleInitiateQr(supplier.id, data.amount, data.note)
      if (!result) {
        setStep('form')
        setPendingFormData(null)
        return
      }
      setQrUrl(result.qrUrl)
      setPaymentReference(result.paymentReference)
      setStep('qr') // ← Socket listener sẽ kích hoạt ở đây
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(paymentReference)
    toast.success('Đã sao chép nội dung chuyển khoản')
  }

  if (!supplier) return null

  // Chỉ cho đóng dialog ở các bước an toàn
  const isCloseable = step !== 'qr-loading'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && isCloseable) onOpenChange(false) }}>
      <DialogContent className="sm:max-w-md">

        {/* ─── Step: Form ─────────────────────────────────────────────────────── */}
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Banknote className="size-5 text-primary" />
                Thanh toán công nợ
              </DialogTitle>
              <DialogDescription>
                Thanh toán một phần hoặc toàn bộ công nợ cho nhà cung cấp
              </DialogDescription>
            </DialogHeader>

            {/* Thông tin công nợ */}
            <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nhà cung cấp</span>
                <span className="font-semibold">{supplier.supplierName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Công nợ hiện tại</span>
                <Badge
                  variant={supplier.outstandingDebt > 0 ? 'destructive' : 'secondary'}
                  className="tabular-nums font-bold text-sm px-2 py-0.5"
                >
                  {formatVND(supplier.outstandingDebt)}
                </Badge>
              </div>
              {supplier.creditLimit > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tỷ lệ hạn mức</span>
                  <span
                    className={
                      debtRatio >= 90
                        ? 'text-destructive font-semibold'
                        : debtRatio >= 60
                        ? 'text-orange-500 font-medium'
                        : 'text-muted-foreground'
                    }
                  >
                    {debtRatio.toFixed(1)}% / {formatVND(supplier.creditLimit)}
                  </span>
                </div>
              )}
            </div>

            {supplier.outstandingDebt <= 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Nhà cung cấp này không có công nợ cần thanh toán.
              </p>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Số tiền */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Số tiền thanh toán <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: 5000000"
                            type="number"
                            min={1}
                            max={supplier.outstandingDebt}
                            {...field}
                            onChange={(e) => {
                              const val = e.target.valueAsNumber
                              field.onChange(isNaN(val) ? undefined : val)
                            }}
                          />
                        </FormControl>
                        {exceedsDebt && (
                          <p className="text-xs text-destructive">
                            Số tiền ({formatVND(watchedAmount)}) vượt quá công nợ ({formatVND(supplier.outstandingDebt)})
                          </p>
                        )}
                        <div className="flex gap-2 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => form.setValue('amount', Math.floor(supplier.outstandingDebt / 2))}
                          >
                            50%
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => form.setValue('amount', supplier.outstandingDebt)}
                          >
                            Toàn bộ
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phương thức thanh toán */}
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phương thức thanh toán</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn phương thức" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASH">
                              <span className="flex items-center gap-2">
                                <Banknote className="size-4" />
                                Tiền mặt
                              </span>
                            </SelectItem>
                            <SelectItem value="BANK_TRANSFER">
                              <span className="flex items-center gap-2">
                                <CreditCard className="size-4" />
                                Chuyển khoản ngân hàng
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {watchedMethod === 'BANK_TRANSFER' && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <QrCode className="size-3" />
                            Hệ thống tự xác nhận khi nhận được chuyển khoản.
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ghi chú */}
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ghi chú kèm theo thanh toán (tuỳ chọn)"
                            className="resize-none"
                            rows={2}
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
                      onClick={() => onOpenChange(false)}
                      className="cursor-pointer"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      className="cursor-pointer"
                      disabled={!!exceedsDebt || form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <><Loader2 className="mr-2 size-4 animate-spin" />Đang xử lý...</>
                      ) : watchedMethod === 'BANK_TRANSFER' ? (
                        <><QrCode className="mr-2 size-4" />Tạo mã QR</>
                      ) : (
                        <><Banknote className="mr-2 size-4" />Xác nhận thanh toán</>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </>
        )}

        {/* ─── Step: QR Loading ───────────────────────────────────────────────── */}
        {step === 'qr-loading' && (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang tạo mã QR...</p>
          </div>
        )}

        {/* ─── Step: QR — chờ webhook SePay ──────────────────────────────────── */}
        {step === 'qr' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="size-5 text-primary" />
                Quét mã QR để chuyển khoản
              </DialogTitle>
              <DialogDescription>
                Chuyển{' '}
                <strong className="text-foreground">
                  {pendingFormData && formatVND(pendingFormData.amount)}
                </strong>{' '}
                cho nhà cung cấp{' '}
                <strong className="text-foreground">{supplier.supplierName}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-2">
              {/* QR Image */}
              <div className="rounded-xl border-2 border-border p-2 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="QR chuyển khoản"
                  className="w-56 h-56 object-contain"
                />
              </div>

              {/* Amount */}
              <div className="text-center">
                <div className="text-3xl font-extrabold text-primary tabular-nums">
                  {pendingFormData && formatVND(pendingFormData.amount)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Quét mã để chuyển đúng số tiền trên
                </p>
              </div>

              {/* Payment reference */}
              {paymentReference && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border w-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Nội dung chuyển khoản</p>
                    <p className="font-mono font-bold text-base tracking-wider truncate">
                      {paymentReference}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="size-8 shrink-0 cursor-pointer"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              )}

              {/* Waiting indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span>Đang chờ xác nhận thanh toán...</span>
              </div>
            </div>

            <Separator />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Đóng
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ─── Step: Done ─────────────────────────────────────────────────────── */}
        {step === 'done' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-500" />
                Thanh toán thành công
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400 animate-bounce" />
              </div>
              <div>
                <p className="text-lg font-semibold">{formatVND(paidAmount)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Đã thanh toán thành công cho{' '}
                  <strong>{supplier.supplierName}</strong>
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                className="w-full cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
