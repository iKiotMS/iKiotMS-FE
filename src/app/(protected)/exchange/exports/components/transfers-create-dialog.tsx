'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { stockMovementApi } from '@/lib/api/stock-movement'
import { getAuthScope } from '@/app/(protected)/exchange/shared/auth-scope'
import { getStockMovementErrorMessage } from '@/app/(protected)/exchange/shared/stock-movement-error'
import { normalizeOptionalNote } from '@/app/(protected)/exchange/shared/movement-notes'
import { QuantityStepper } from '@/app/(protected)/exchange/shared/quantity-stepper'
import { findDuplicateProductIds } from '@/app/(protected)/exchange/shared/movement-detail-validation'
import type {
  StockMovementLocationOption,
  StockMovementProductItemOption,
} from '@/types/stock-movement'
import { useTransfers } from './transfers-provider'

type TransferFormValues = {
  fromLocationId: string
  toLocationId: string
  note?: string
  details: {
    productItemId: string
    quantity: number
    note?: string
  }[]
}

const EMPTY_VALUES: TransferFormValues = {
  fromLocationId: '',
  toLocationId: '',
  note: '',
  details: [{ productItemId: '', quantity: 1, note: '' }],
}

interface TransfersCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransfersCreateDialog({ open, onOpenChange }: TransfersCreateDialogProps) {
  const { fetchTransfers, labels } = useTransfers()
  const [locations, setLocations] = useState<StockMovementLocationOption[]>([])
  const [products, setProducts] = useState<StockMovementProductItemOption[]>([])
  const [isOptionsLoading, setIsOptionsLoading] = useState(false)
  const authScope = getAuthScope()
  const role = authScope.role

  const transferFormSchema = useMemo(
    () =>
      z
        .object({
          fromLocationId: z.string().min(1, labels.fromRequired),
          toLocationId: z.string().min(1, labels.toRequired),
          note: z.string().optional(),
          details: z
            .array(
              z.object({
                productItemId: z.string().min(1, 'Vui lòng chọn hàng hóa'),
                quantity: z
                  .number({ error: 'Nhập số nguyên' })
                  .int()
                  .positive('Số lượng phải > 0'),
                note: z.string().optional(),
              }),
            )
            .min(1, 'Cần ít nhất 1 mặt hàng'),
        })
        .refine((d) => d.fromLocationId !== d.toLocationId, {
          message: labels.sameLocationError,
          path: ['toLocationId'],
        })
        .superRefine((data, ctx) => {
          if (findDuplicateProductIds(data.details).length > 0) {
            ctx.addIssue({
              code: 'custom',
              message: 'Không được chọn trùng hàng hóa',
              path: ['details'],
            })
          }
        }),
    [labels],
  )

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'details' })

  useEffect(() => {
    if (!open) return
    form.reset(EMPTY_VALUES)
    setProducts([])
  }, [open, form])

  useEffect(() => {
    if (!open) return
    setIsOptionsLoading(true)
    stockMovementApi
      .getLocationOptions()
      .then(setLocations)
      .catch(() => toast.error(labels.loadLocationsError))
      .finally(() => setIsOptionsLoading(false))
  }, [open, labels.loadLocationsError])

  const fromLocationId = form.watch('fromLocationId')
  const visibleFromLocations = useMemo(() => {
    if (role === 'WAREHOUSE_MANAGER' && authScope.warehouseId) {
      return locations.filter((l) => l._id === authScope.warehouseId && l.type === 'warehouse')
    }
    if (role === 'BRANCH_MANAGER' && authScope.branchId) {
      return locations.filter((l) => l._id === authScope.branchId && l.type === 'branch')
    }
    return locations
  }, [locations, role, authScope.warehouseId, authScope.branchId])
  const fromLocation = visibleFromLocations.find((l) => l._id === fromLocationId)

  const visibleToLocations = useMemo(() => {
    if (!fromLocationId) return []
    if (role === 'WAREHOUSE_MANAGER') {
      return locations.filter((l) => l.type === 'branch' && l._id !== fromLocationId)
    }
    if (role === 'BRANCH_MANAGER') {
      return locations.filter((l) => l.type === 'branch' && l._id !== fromLocationId)
    }
    return locations.filter((l) => l._id !== fromLocationId)
  }, [locations, fromLocationId, role])

  useEffect(() => {
    if (!open || !fromLocationId || !fromLocation) {
      setProducts([])
      return
    }
    stockMovementApi
      .getProductItemsAtSource(fromLocationId, fromLocation.type)
      .then(setProducts)
      .catch(() => toast.error(labels.loadProductsError))
  }, [open, fromLocationId, fromLocation, labels.loadProductsError])

  useEffect(() => {
    if (!open) return
    const currentTo = form.getValues('toLocationId')
    if (currentTo && !visibleToLocations.some((l) => l._id === currentTo)) {
      form.setValue('toLocationId', '')
    }
  }, [open, visibleToLocations, form])

  useEffect(() => {
    if (!open) return
    if (role === 'WAREHOUSE_MANAGER' && authScope.warehouseId) {
      form.setValue('fromLocationId', authScope.warehouseId)
      form.setValue('toLocationId', '')
    }
    if (role === 'BRANCH_MANAGER' && authScope.branchId) {
      form.setValue('fromLocationId', authScope.branchId)
      form.setValue('toLocationId', '')
    }
  }, [open, role, authScope.warehouseId, authScope.branchId, form])

  async function onSubmit(data: TransferFormValues) {
    const fromLoc = locations.find((l) => l._id === data.fromLocationId)
    const toLoc = locations.find((l) => l._id === data.toLocationId)
    if (role === 'WAREHOUSE_MANAGER' && data.fromLocationId !== authScope.warehouseId) {
      toast.error('Kho chỉ được xuất từ kho của bạn')
      return
    }
    if (role === 'BRANCH_MANAGER') {
      if (data.fromLocationId !== authScope.branchId) {
        toast.error('Chi nhánh chỉ được xuất từ chi nhánh của bạn')
        return
      }
      if (toLoc?.type !== 'branch') {
        toast.error('Chi nhánh chỉ được xuất sang chi nhánh khác')
        return
      }
    }
    try {
      await stockMovementApi.createExport({
        movementType: 'EXPORT',
        fromLocationId: data.fromLocationId,
        fromLocationType: fromLoc?.type ?? 'warehouse',
        toLocationId: data.toLocationId,
        toLocationType: toLoc?.type ?? 'branch',
        note: normalizeOptionalNote(data.note),
        details: data.details.map((d) => ({
          productItemId: d.productItemId,
          quantity: d.quantity,
          note: normalizeOptionalNote(d.note),
        })),
      })
      toast.success(labels.successToast)
      onOpenChange(false)
      await fetchTransfers()
    } catch (error) {
      toast.error(getStockMovementErrorMessage(error, 'Không thể tạo yêu cầu, vui lòng thử lại'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{labels.createDialogTitle}</DialogTitle>
          <DialogDescription>{labels.createDialogDescription}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="fromLocationId" render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.fromLabel} <span className="text-destructive">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={role === 'WAREHOUSE_MANAGER' || role === 'BRANCH_MANAGER'}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full"><SelectValue placeholder={labels.fromPlaceholder} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {visibleFromLocations.map((l) => (
                        <SelectItem key={l._id} value={l._id}>{l.name} ({l.type === 'warehouse' ? 'Kho' : 'Chi nhánh'})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="toLocationId" render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.toLabel} <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full"><SelectValue placeholder={labels.toPlaceholder} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {visibleToLocations.map((l) => (
                        <SelectItem key={l._id} value={l._id}>{l.name} ({l.type === 'warehouse' ? 'Kho' : 'Chi nhánh'})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {visibleToLocations.length === 0 && (
                    <p className="text-xs text-amber-600">
                      {role === 'BRANCH_MANAGER'
                        ? 'Chưa có chi nhánh đích khác trong tenant để chuyển.'
                        : role === 'WAREHOUSE_MANAGER'
                          ? 'Chưa có chi nhánh đích để chuyển từ kho hiện tại.'
                          : 'Không có nơi nhận phù hợp.'}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="note" render={({ field }) => (
              <FormItem>
                  <FormLabel>Ghi chú đơn</FormLabel>
                  <FormControl>
                    <Textarea placeholder={labels.orderNotePlaceholder} rows={2} className="resize-none" {...field} />
                  </FormControl>
              </FormItem>
            )} />

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Danh sách hàng hóa cần chuyển</h3>
                <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => append({ productItemId: '', quantity: 1, note: '' })}>
                  <Plus className="mr-1 size-4" />Thêm dòng
                </Button>
              </div>

              {!fromLocationId && (
                <p className="text-xs text-muted-foreground">{labels.selectFromHint}</p>
              )}
              {fromLocationId && products.length === 0 && (
                <p className="text-xs text-amber-600">{labels.noStockAtSource}</p>
              )}

              {fields.map((f, idx) => (
                  <div key={f.id} className="space-y-3 rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <FormField
                          control={form.control}
                          name={`details.${idx}.productItemId`}
                          render={({ field }) => {
                            const selectedProduct = products.find((p) => p._id === field.value)
                            const selectedLabel = selectedProduct
                              ? `${selectedProduct.name}${selectedProduct.sku ? ` (${selectedProduct.sku})` : ''}`
                              : ''

                            return (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Hàng hóa <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger
                                      title={selectedLabel || undefined}
                                      className="h-auto min-h-9 w-full cursor-pointer whitespace-normal py-1.5 text-left text-sm *:data-[slot=select-value]:line-clamp-none"
                                    >
                                      <SelectValue placeholder="Chọn hàng hóa">
                                        {selectedProduct ? (
                                          <span className="flex min-w-0 flex-col items-start gap-0.5 pr-1 text-left">
                                            <span className="break-words font-medium leading-snug">
                                              {selectedProduct.name}
                                            </span>
                                            {selectedProduct.sku ? (
                                              <span className="text-xs text-muted-foreground">
                                                SKU: {selectedProduct.sku}
                                              </span>
                                            ) : null}
                                          </span>
                                        ) : null}
                                      </SelectValue>
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-w-[min(90vw,40rem)]">
                                    {products.map((p) => (
                                      <SelectItem
                                        key={p._id}
                                        value={p._id}
                                        className="items-start whitespace-normal py-2"
                                        title={`${p.name}${p.sku ? ` (${p.sku})` : ''}`}
                                      >
                                        <span className="flex min-w-0 flex-col">
                                          <span className="break-words leading-snug">{p.name}</span>
                                          {p.sku ? (
                                            <span className="text-xs text-muted-foreground">
                                              SKU: {p.sku}
                                              {typeof p.stock === 'number' ? ` · Tồn: ${p.stock}` : ''}
                                            </span>
                                          ) : null}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )
                          }}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6 h-8 w-8 shrink-0 text-destructive cursor-pointer"
                        onClick={() => remove(idx)}
                        disabled={fields.length === 1}
                        aria-label="Xóa dòng"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`details.${idx}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Số lượng <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <QuantityStepper
                                min={1}
                                value={Number.isFinite(field.value) ? field.value : 1}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${idx}.note`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Ghi chú dòng</FormLabel>
                            <FormControl>
                              <Input placeholder="Ghi chú mặt hàng (tùy chọn)" className="h-8 text-sm" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting || isOptionsLoading} className="cursor-pointer">
                <Plus className="mr-2 size-4" />
                {form.formState.isSubmitting ? 'Đang tạo...' : labels.submitButton}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
