'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  LocationType,
  StockMovementLocationOption,
  StockMovementProductItemOption,
  StockMovementSupplierOption,
} from '@/types/stock-movement'
import { useImports } from './imports-provider'

function createImportFormSchema(isBranchManager: boolean) {
  const detailSchema = z.object({
    productItemId: z.string().min(1, 'Vui lòng chọn hàng hóa'),
    quantity: z.number({ error: 'Nhập số nguyên' }).int().positive('Số lượng phải > 0'),
    importPrice: isBranchManager
      ? z.number().optional()
      : z.number({ error: 'Nhập số tiền' }).positive('Giá nhập phải > 0'),
    note: z.string().optional(),
  })

  return z
    .object({
      fromSupplierId: isBranchManager
        ? z.string().optional()
        : z.string().min(1, 'Vui lòng chọn nhà cung cấp'),
      fromLocationId: isBranchManager
        ? z.string().min(1, 'Vui lòng chọn kho nguồn')
        : z.string().optional(),
      toLocationId: z.string().min(1, isBranchManager ? 'Vui lòng chọn chi nhánh nhận' : 'Vui lòng chọn kho nhận'),
      note: z.string().optional(),
      details: z.array(detailSchema).min(1, 'Cần ít nhất 1 mặt hàng'),
    })
    .superRefine((data, ctx) => {
      if (findDuplicateProductIds(data.details).length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Không được chọn trùng hàng hóa',
          path: ['details'],
        })
      }
    })
}

type ImportFormValues = z.infer<ReturnType<typeof createImportFormSchema>>

const EMPTY_VALUES: ImportFormValues = {
  fromSupplierId: '',
  fromLocationId: '',
  toLocationId: '',
  note: '',
  details: [{ productItemId: '', quantity: 1, importPrice: undefined, note: '' }],
}

interface ImportsCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportsCreateDialog({ open, onOpenChange }: ImportsCreateDialogProps) {
  const { fetchImports } = useImports()
  const [suppliers, setSuppliers] = useState<StockMovementSupplierOption[]>([])
  const [locations, setLocations] = useState<StockMovementLocationOption[]>([])
  const [products, setProducts] = useState<StockMovementProductItemOption[]>([])
  const [isOptionsLoading, setIsOptionsLoading] = useState(false)
  const authScope = getAuthScope()
  const role = authScope.role
  const isBranchManager = role === 'BRANCH_MANAGER'
  const importFormSchema = useMemo(() => createImportFormSchema(isBranchManager), [isBranchManager])

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'details' })
  const visibleLocations = useMemo(() => {
    if (role === 'WAREHOUSE_MANAGER' && authScope.warehouseId) {
      return locations.filter((l) => l._id === authScope.warehouseId)
    }
    if (role === 'BRANCH_MANAGER' && authScope.branchId) {
      return locations.filter((l) => l._id === authScope.branchId)
    }
    return locations
  }, [locations, role, authScope.warehouseId, authScope.branchId])

  const sourceWarehouses = useMemo(
    () => locations.filter((l) => l.type === 'warehouse'),
    [locations],
  )

  const fromLocationId = form.watch('fromLocationId')
  const toLocationId = form.watch('toLocationId')
  const selectedLocation = visibleLocations.find((l) => l._id === toLocationId)

  const loadProductsForLocation = useCallback(async (locId: string, locType: LocationType) => {
    if (!locId) {
      setProducts([])
      return
    }
    try {
      const items = await stockMovementApi.getProductItemsForDestination(locId, locType)
      setProducts(items)
    } catch (error) {
      console.error(error)
      toast.error('Không thể tải danh sách hàng hóa tại kho/chi nhánh')
    }
  }, [])

  useEffect(() => {
    if (!open) return
    form.reset(EMPTY_VALUES)
    setProducts([])
  }, [open, form])

  useEffect(() => {
    if (!open) return

    async function loadOptions() {
      setIsOptionsLoading(true)
      try {
        const [supplierOptions, locationOptions] = await Promise.all([
          stockMovementApi.getSupplierOptions(),
          stockMovementApi.getLocationOptions(),
        ])
        setSuppliers(supplierOptions)
        setLocations(locationOptions)
      } catch (error) {
        console.error(error)
        toast.error('Không thể tải dữ liệu tạo đơn nhập hàng')
      } finally {
        setIsOptionsLoading(false)
      }
    }

    loadOptions()
  }, [open])

  useEffect(() => {
    if (!open) return
    if (isBranchManager) {
      if (!fromLocationId) {
        setProducts([])
        return
      }
      stockMovementApi
        .getProductItemsAtSource(fromLocationId, 'warehouse')
        .then(setProducts)
        .catch(() => toast.error('Không thể tải hàng tại kho nguồn'))
      return
    }
    if (!toLocationId || !selectedLocation) return
    loadProductsForLocation(toLocationId, selectedLocation.type)
  }, [open, isBranchManager, fromLocationId, toLocationId, selectedLocation, loadProductsForLocation])

  useEffect(() => {
    if (!open) return
    if (role === 'WAREHOUSE_MANAGER' && authScope.warehouseId) {
      form.setValue('toLocationId', authScope.warehouseId)
    }
    if (role === 'BRANCH_MANAGER' && authScope.branchId) {
      form.setValue('toLocationId', authScope.branchId)
    }
  }, [open, role, authScope.warehouseId, authScope.branchId, form])

  const calcTotal = () => {
    if (isBranchManager) return 0
    const details = form.watch('details')
    return details.reduce((sum, d) => sum + (d.quantity || 0) * (d.importPrice || 0), 0)
  }

  const formatVND = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

  async function onSubmit(data: ImportFormValues) {
    const location = visibleLocations.find((l) => l._id === data.toLocationId)
    if (isBranchManager) {
      try {
        await stockMovementApi.createExport({
          movementType: 'EXPORT',
          fromLocationId: data.fromLocationId!,
          fromLocationType: 'warehouse',
          toLocationId: data.toLocationId,
          toLocationType: 'branch',
          note: normalizeOptionalNote(data.note),
          details: data.details.map((d) => ({
            productItemId: d.productItemId,
            quantity: d.quantity,
            note: normalizeOptionalNote(d.note),
          })),
        })
        toast.success('Tạo yêu cầu nhập từ kho thành công')
        onOpenChange(false)
        await fetchImports()
      } catch (error) {
        toast.error(getStockMovementErrorMessage(error, 'Không thể tạo yêu cầu nhập'))
      }
      return
    }

    try {
      await stockMovementApi.createImport({
        movementType: 'IMPORT',
        fromSupplierId: data.fromSupplierId!,
        toLocationId: data.toLocationId,
        toLocationType: location?.type ?? 'warehouse',
        note: normalizeOptionalNote(data.note),
        details: data.details.map((d) => ({
          productItemId: d.productItemId,
          quantity: d.quantity,
          importPrice: d.importPrice!,
          note: normalizeOptionalNote(d.note),
        })),
      })
      toast.success('Tạo đơn nhập hàng thành công')
      onOpenChange(false)
      await fetchImports()
    } catch (error) {
      toast.error(getStockMovementErrorMessage(error, 'Không thể tạo đơn, vui lòng thử lại'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isBranchManager ? 'Tạo yêu cầu nhập từ kho' : 'Tạo đơn nhập hàng mới'}
            </DialogTitle>
            <DialogDescription>
              {isBranchManager
                ? 'Chọn kho nguồn thuộc tenant, hàng sẽ chuyển về chi nhánh của bạn.'
                : 'Nhập hàng từ nhà cung cấp vào kho của bạn. Chọn kho nhận trước để xem hàng đã có tại đó.'}
            </DialogDescription>
          </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {isBranchManager ? (
                  <FormField
                    control={form.control}
                    name="fromLocationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kho nguồn <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="cursor-pointer w-full">
                              <SelectValue placeholder="Chọn kho nguồn" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sourceWarehouses.map((warehouse) => (
                              <SelectItem key={warehouse._id} value={warehouse._id}>
                                {warehouse.name} (Kho)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="fromSupplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nhà cung cấp <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="cursor-pointer w-full">
                              <SelectValue placeholder="Chọn nhà cung cấp" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((s) => (
                              <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="toLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isBranchManager ? 'Chi nhánh nhận' : 'Kho nhận'} <span className="text-destructive">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={role === 'WAREHOUSE_MANAGER' || role === 'BRANCH_MANAGER'}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer w-full">
                            <SelectValue placeholder="Chọn kho nhận" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {visibleLocations.map((l) => (
                            <SelectItem key={l._id} value={l._id}>
                              {l.name} ({l.type === 'warehouse' ? 'Kho' : 'Chi nhánh'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú đơn</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ghi chú cho cả phiếu nhập (tùy chọn)" rows={2} className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Danh sách hàng hóa nhập</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => append({ productItemId: '', quantity: 1, importPrice: undefined, note: '' })}
                    >
                      <Plus className="mr-1 size-4" />
                      Thêm dòng
                    </Button>
                  </div>
                </div>

                {!toLocationId && (
                  <p className="text-xs text-muted-foreground">
                    Chọn kho/chi nhánh nhận để tải danh sách hàng hóa.
                  </p>
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

                            return (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Hàng hóa <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select onValueChange={(v) => {
                                  field.onChange(v)
                                  const p = products.find((x) => x._id === v)
                                  if (p?.costPrice) {
                                    form.setValue(`details.${idx}.importPrice`, p.costPrice)
                                  }
                                }} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-auto min-h-9 w-full cursor-pointer whitespace-normal py-1.5 text-left text-sm">
                                      <SelectValue placeholder={isOptionsLoading ? 'Đang tải...' : 'Chọn hàng hóa'} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-w-[min(90vw,40rem)]">
                                    {products.map((p) => (
                                      <SelectItem key={p._id} value={p._id} className="items-start whitespace-normal py-2">
                                        <span className="flex min-w-0 flex-col gap-1">
                                          <span className="break-words leading-snug">{p.name}</span>
                                          <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            {p.sku ? <span>SKU: {p.sku}</span> : null}
                                            {p.atLocation ? (
                                              <Badge variant="secondary" className="text-[10px]">Đã có tại kho</Badge>
                                            ) : (
                                              <Badge variant="outline" className="text-[10px]">Chưa có tại kho</Badge>
                                            )}
                                          </span>
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {selectedProduct && !selectedProduct.atLocation && (
                                  <p className="text-xs text-amber-600 dark:text-amber-400">
                                    Sản phẩm chưa có tại kho này — vẫn nhập được, tồn sẽ cộng khi nhận hàng.
                                  </p>
                                )}
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

                    <div className={`grid grid-cols-1 gap-3 ${isBranchManager ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                      <FormField
                        control={form.control}
                        name={`details.${idx}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Số lượng <span className="text-destructive">*</span></FormLabel>
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

                      {!isBranchManager && (
                        <FormField
                          control={form.control}
                          name={`details.${idx}.importPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Giá nhập (đ) <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="Nhập giá nhập"
                                  className="h-8 text-sm tabular-nums"
                                  value={Number.isFinite(field.value) && field.value! > 0 ? String(field.value) : ''}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/[^\d]/g, '')
                                    field.onChange(raw === '' ? undefined : Number(raw))
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name={`details.${idx}.note`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Ghi chú dòng</FormLabel>
                            <FormControl>
                              <Input placeholder="Tùy chọn" className="h-8 text-sm" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                {form.formState.errors.details?.message && (
                  <p className="text-sm text-destructive">{form.formState.errors.details.message}</p>
                )}
              </div>

              {!isBranchManager && (
                <div className="flex justify-end pt-2">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tổng giá trị đơn hàng</p>
                    <p className="text-xl font-bold">{formatVND(calcTotal())}</p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Huỷ</Button>
                <Button type="submit" disabled={form.formState.isSubmitting || isOptionsLoading} className="cursor-pointer">
                  <Plus className="mr-2 size-4" />
                  {form.formState.isSubmitting ? 'Đang tạo...' : 'Tạo đơn nhập hàng'}
                </Button>
              </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
