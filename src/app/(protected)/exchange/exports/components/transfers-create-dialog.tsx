'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { stockMovementApi } from '@/lib/api/stock-movement'
import { getAuthScope } from '@/app/(protected)/exchange/shared/auth-scope'
import { getStockMovementErrorMessage } from '@/app/(protected)/exchange/shared/stock-movement-error'
import { normalizeOptionalNote } from '@/app/(protected)/exchange/shared/qty'
import { QuantityStepper } from '@/app/(protected)/exchange/shared/quantity-stepper'
import { MoneyInput, ProductSelect } from '@/app/(protected)/exchange/shared/form-fields'
import {
  MAX_IMPORT_PRICE,
  formatMoneyVnd,
  refineDuplicateProducts,
} from '@/app/(protected)/exchange/shared/movement-detail-validation'
import type {
  StockMovementLocationOption,
  StockMovementProductItemOption,
} from '@/types/stock-movement'
import { useTransfers } from './transfers-provider'

/** BR: chọn loại yêu cầu trước khi điền phiếu. */
type BranchRequestKind = 'transfer' | 'return'

type TransferFormValues = {
  fromLocationId: string
  toLocationId: string
  note?: string
  details: {
    productItemId: string
    quantity: number
    importPrice: number
    note?: string
  }[]
}

const EMPTY_DETAIL = { productItemId: '', quantity: 1, importPrice: 0, note: '' }

const EMPTY_VALUES: TransferFormValues = {
  fromLocationId: '',
  toLocationId: '',
  note: '',
  details: [{ ...EMPTY_DETAIL }],
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
  const [branchRequestKind, setBranchRequestKind] =
    useState<BranchRequestKind>('transfer')
  const authScope = getAuthScope()
  const role = authScope.role
  const isBranchManager = role === 'BRANCH_MANAGER'

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
                importPrice: z
                  .number({ error: 'Nhập số tiền' })
                  .positive('Giá phải > 0')
                  .max(MAX_IMPORT_PRICE, 'Giá tối đa 1000 tỷ'),
                note: z.string().optional(),
              }),
            )
            .min(1, 'Cần ít nhất 1 mặt hàng'),
        })
        .refine((d) => d.fromLocationId !== d.toLocationId, {
          message: labels.sameLocationError,
          path: ['toLocationId'],
        })
        .superRefine((data, ctx) => refineDuplicateProducts(data.details, ctx)),
    [labels],
  )

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: EMPTY_VALUES,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'details' })
  const fromLocationId = useWatch({ control: form.control, name: 'fromLocationId' })
  const details = useWatch({ control: form.control, name: 'details' }) ?? []

  const total = useMemo(
    () =>
      details.reduce(
        (sum, d) => sum + (d.quantity || 0) * (d.importPrice || 0),
        0,
      ),
    [details],
  )

  const dialogCopy = useMemo(() => {
    if (!isBranchManager) {
      return {
        title: labels.createDialogTitle,
        description: labels.createDialogDescription,
        toLabel: labels.toLabel,
        toPlaceholder: labels.toPlaceholder,
        listTitle: 'Danh sách hàng hóa cần chuyển',
        submit: labels.submitButton,
      }
    }
    if (branchRequestKind === 'return') {
      return {
        title: 'Tạo yêu cầu trả hàng',
        description: 'Trả hàng từ chi nhánh về kho (RETURN).',
        toLabel: 'Kho nhận',
        toPlaceholder: 'Chọn kho nhận',
        listTitle: 'Danh sách hàng hóa trả về kho',
        submit: 'Tạo yêu cầu trả hàng',
      }
    }
    return {
      title: 'Tạo yêu cầu chuyển hàng',
      description: 'Chuyển hàng sang chi nhánh khác (EXPORT).',
      toLabel: 'Chi nhánh nhận',
      toPlaceholder: 'Chọn chi nhánh nhận',
      listTitle: 'Danh sách hàng hóa cần chuyển',
      submit: 'Tạo yêu cầu chuyển hàng',
    }
  }, [isBranchManager, branchRequestKind, labels])

  useEffect(() => {
    if (!open) return
    form.reset(EMPTY_VALUES)
    setProducts([])
    setBranchRequestKind('transfer')
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
      if (branchRequestKind === 'return') {
        return locations.filter((l) => l.type === 'warehouse')
      }
      return locations.filter((l) => l.type === 'branch' && l._id !== fromLocationId)
    }
    return locations.filter((l) => l._id !== fromLocationId)
  }, [locations, fromLocationId, role, branchRequestKind])

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

  const onBranchRequestKindChange = (value: string) => {
    if (value !== 'transfer' && value !== 'return') return
    setBranchRequestKind(value)
    form.setValue('toLocationId', '')
  }

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
      if (branchRequestKind === 'transfer' && toLoc?.type !== 'branch') {
        toast.error('Yêu cầu chuyển hàng chỉ sang chi nhánh khác')
        return
      }
      if (branchRequestKind === 'return' && toLoc?.type !== 'warehouse') {
        toast.error('Yêu cầu trả hàng phải chọn kho nhận')
        return
      }
    }

    const movementType = isBranchManager
      ? branchRequestKind === 'return'
        ? ('RETURN' as const)
        : ('EXPORT' as const)
      : fromLoc?.type === 'branch' && toLoc?.type === 'warehouse'
        ? ('RETURN' as const)
        : ('EXPORT' as const)

    if (role === 'BRANCH_MANAGER' && movementType === 'EXPORT' && toLoc?.type !== 'branch') {
      toast.error('Xuất nội bộ chỉ sang chi nhánh khác; trả kho dùng yêu cầu trả hàng')
      return
    }

    try {
      await stockMovementApi.createExport({
        movementType,
        fromLocationId: data.fromLocationId,
        fromLocationType: fromLoc?.type ?? 'warehouse',
        toLocationId: data.toLocationId,
        toLocationType: toLoc?.type ?? 'branch',
        note: normalizeOptionalNote(data.note),
        details: data.details.map((d) => ({
          productItemId: d.productItemId,
          quantity: d.quantity,
          importPrice: d.importPrice,
          note: normalizeOptionalNote(d.note),
        })),
      })
      toast.success(
        movementType === 'RETURN'
          ? 'Tạo yêu cầu trả hàng về kho thành công'
          : labels.successToast,
      )
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
          <DialogTitle>{dialogCopy.title}</DialogTitle>
          <DialogDescription>{dialogCopy.description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {isBranchManager && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Loại yêu cầu <span className="text-destructive">*</span>
                </p>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={branchRequestKind}
                  onValueChange={onBranchRequestKindChange}
                  className="grid w-full grid-cols-2 gap-2"
                >
                  <ToggleGroupItem
                    value="transfer"
                    className="h-10 cursor-pointer data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Yêu cầu chuyển hàng
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="return"
                    className="h-10 cursor-pointer data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Yêu cầu trả hàng
                  </ToggleGroupItem>
                </ToggleGroup>
                <p className="text-xs text-muted-foreground">
                  {branchRequestKind === 'return'
                    ? 'Chi nhánh → Kho (RETURN)'
                    : 'Chi nhánh → Chi nhánh (EXPORT)'}
                </p>
              </div>
            )}

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
                  <FormLabel>{dialogCopy.toLabel} <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder={dialogCopy.toPlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {visibleToLocations.map((l) => (
                        <SelectItem key={l._id} value={l._id}>{l.name} ({l.type === 'warehouse' ? 'Kho' : 'Chi nhánh'})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {visibleToLocations.length === 0 && (
                    <p className="text-xs text-amber-600">
                      {isBranchManager
                        ? branchRequestKind === 'return'
                          ? 'Chưa có kho đích phù hợp.'
                          : 'Chưa có chi nhánh đích phù hợp.'
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
                <h3 className="text-sm font-semibold">{dialogCopy.listTitle}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => append({ ...EMPTY_DETAIL })}
                >
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
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Hàng hóa <span className="text-destructive">*</span>
                              </FormLabel>
                              <ProductSelect
                                products={products}
                                value={field.value}
                                metaMode="stock"
                                onValueChange={(v) => {
                                  field.onChange(v)
                                  const p = products.find((x) => x._id === v)
                                  if (p?.costPrice) {
                                    form.setValue(
                                      `details.${idx}.importPrice`,
                                      Math.min(p.costPrice, MAX_IMPORT_PRICE),
                                      { shouldDirty: true, shouldValidate: true },
                                    )
                                  }
                                  if (typeof p?.stock === 'number' && p.stock > 0) {
                                    const currentQty = form.getValues(`details.${idx}.quantity`)
                                    form.setValue(
                                      `details.${idx}.quantity`,
                                      Math.min(Math.max(1, currentQty || 1), p.stock),
                                      { shouldDirty: true, shouldValidate: true },
                                    )
                                  }
                                  void form.trigger('details')
                                }}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`details.${idx}.quantity`}
                        render={({ field }) => {
                          const selected = products.find(
                            (p) => p._id === details[idx]?.productItemId,
                          )
                          const stockMax =
                            typeof selected?.stock === 'number'
                              ? selected.stock
                              : undefined
                          return (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Số lượng <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <QuantityStepper
                                min={1}
                                max={stockMax}
                                value={Number.isFinite(field.value) ? field.value : 1}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            {typeof stockMax === 'number' && (
                              <p className="text-[11px] text-muted-foreground">
                                Tối đa tồn nguồn: {stockMax.toLocaleString('vi-VN')}
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                          )
                        }}
                      />

                      <FormField
                        control={form.control}
                        name={`details.${idx}.importPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Giá (đ) <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <MoneyInput value={field.value} onChange={field.onChange} />
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
                              <Input placeholder="Ghi chú mặt hàng (tùy chọn)" className="h-9 text-sm" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <p className="text-right text-xs text-muted-foreground">
                      Thành tiền:{' '}
                      <span className="font-medium text-foreground tabular-nums">
                        {formatMoneyVnd(
                          (details[idx]?.quantity || 0) * (details[idx]?.importPrice || 0),
                        )}
                      </span>
                    </p>
                  </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">Tổng giá trị đơn hàng</span>
              <span className="text-lg font-bold tabular-nums" title={formatMoneyVnd(total)}>
                {formatMoneyVnd(total)}
              </span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting || isOptionsLoading} className="cursor-pointer">
                <Plus className="mr-2 size-4" />
                {form.formState.isSubmitting ? 'Đang tạo...' : dialogCopy.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
