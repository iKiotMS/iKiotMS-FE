'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { QuantityStepper } from "@/app/(protected)/exchange/shared/quantity-stepper";
import { ProductSelect } from "@/app/(protected)/exchange/shared/form-fields";
import { getAdjustQtyChange } from "@/app/(protected)/exchange/shared/qty";
import { refineDuplicateProducts } from "@/app/(protected)/exchange/shared/movement-detail-validation";
import { stockMovementApi } from "@/lib/api/stock-movement";
import { getAuthScope } from "@/app/(protected)/exchange/shared/auth-scope";
import { filterLocationsByAuthScope } from "@/app/(protected)/exchange/shared/auth-scope";
import { getStockMovementErrorMessage } from "@/app/(protected)/exchange/shared/stock-movement-error";
import { normalizeOptionalNote } from "@/app/(protected)/exchange/shared/qty";
import type {
  LocationType,
  StockMovementLocationOption,
  StockMovementProductItemOption,
} from '@/types/stock-movement'
import { useAdjustments } from './adjustments-provider'

const adjustDetailSchema = z.object({
  productItemId: z.string().min(1, 'Vui lòng chọn hàng hóa'),
  receivedQuantity: z
    .number({ error: 'Nhập số nguyên' })
    .int('Phải là số nguyên')
    .min(0, 'Tồn thực tế phải >= 0'),
  note: z.string().optional(),
})

const adjustFormSchema = z
  .object({
    locationId: z.string().min(1, 'Vui lòng chọn kho / chi nhánh'),
    locationType: z.enum(['warehouse', 'branch']),
    note: z.string().optional(),
    details: z.array(adjustDetailSchema).min(1, 'Cần ít nhất 1 mặt hàng'),
  })
  .superRefine((data, ctx) => refineDuplicateProducts(data.details, ctx))

type AdjustFormValues = z.infer<typeof adjustFormSchema>

const EMPTY: AdjustFormValues = {
  locationId: '',
  locationType: 'warehouse',
  note: '',
  details: [{ productItemId: '', receivedQuantity: 1, note: '' }],
}

export function AdjustmentsCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { fetchAdjustments } = useAdjustments()

  const [locations, setLocations] = useState<StockMovementLocationOption[]>([])
  const [products, setProducts] = useState<StockMovementProductItemOption[]>([])
  const [isOptionsLoading, setIsOptionsLoading] = useState(false)

  const authScope = getAuthScope()
  const role = authScope.role
  const isLocationLocked = role === 'WAREHOUSE_MANAGER' || role === 'BRANCH_MANAGER'

  const form = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustFormSchema),
    defaultValues: EMPTY,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'details' })

  const visibleLocations = useMemo(
    () => filterLocationsByAuthScope(locations, authScope),
    [locations, authScope.role, authScope.warehouseId, authScope.branchId],
  )

  const locationId = form.watch('locationId')
  const locationType = form.watch('locationType') as LocationType

  useEffect(() => {
    if (!open) return
    form.reset(EMPTY)
    setProducts([])
  }, [open, form])

  useEffect(() => {
    if (!open) return
    setIsOptionsLoading(true)
    stockMovementApi
      .getLocationOptions()
      .then(setLocations)
      .catch(() => toast.error('Không thể tải danh sách kho'))
      .finally(() => setIsOptionsLoading(false))
  }, [open])

  useEffect(() => {
    if (!open || locations.length === 0) return
    if (role === 'WAREHOUSE_MANAGER' && authScope.warehouseId) {
      form.setValue('locationId', authScope.warehouseId)
      form.setValue('locationType', 'warehouse')
    } else if (role === 'BRANCH_MANAGER' && authScope.branchId) {
      form.setValue('locationId', authScope.branchId)
      form.setValue('locationType', 'branch')
    }
  }, [open, locations, role, authScope.warehouseId, authScope.branchId, form])

  useEffect(() => {
    if (!open || !locationId) {
      setProducts([])
      return
    }
    stockMovementApi
      .getProductItemsForDestination(locationId, locationType)
      .then(setProducts)
      .catch(() => toast.error('Không thể tải danh sách hàng hóa'))
  }, [open, locationId, locationType])

  const handleLocationChange = (id: string) => {
    form.setValue('locationId', id)
    const loc = locations.find((l) => l._id === id)
    if (loc) form.setValue('locationType', loc.type)
    setProducts([])
  }

  async function onSubmit(data: AdjustFormValues) {
    const hasChange = data.details.some((d) => {
      const product = products.find((p) => p._id === d.productItemId)
      const snapshot = product?.stock ?? 0
      return getAdjustQtyChange(snapshot, d.receivedQuantity) !== 0
    })
    if (!hasChange) {
      toast.error('Tồn thực tế trùng hệ thống — không có gì cần điều chỉnh')
      return
    }

    try {
      await stockMovementApi.createAdjust({
        movementType: 'ADJUST',
        fromLocationId: data.locationId,
        fromLocationType: data.locationType,
        toLocationId: data.locationId,
        toLocationType: data.locationType,
        note: normalizeOptionalNote(data.note),
        details: data.details.map((d) => ({
          productItemId: d.productItemId,
          receivedQuantity: d.receivedQuantity,
          note: normalizeOptionalNote(d.note),
        })),
      })
      toast.success('Đã tạo phiếu kiểm kê (PENDING) — mở phiếu để duyệt')
      onOpenChange(false)
      await fetchAdjustments()
    } catch (error) {
      toast.error(getStockMovementErrorMessage(error, 'Không thể tạo phiếu điều chỉnh'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
          <DialogDescription>
            Chỉ nhập <strong>tồn thực tế</strong>. Backend tự snapshot tồn hệ thống.
            Phiếu tạo ở trạng thái PENDING — mở phiếu để sửa (nếu cần) rồi duyệt.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Kho / Chi nhánh điều chỉnh <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleLocationChange}
                    disabled={isLocationLocked || isOptionsLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder={isOptionsLoading ? 'Đang tải...' : 'Chọn kho / chi nhánh'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {visibleLocations.map((l) => (
                        <SelectItem key={l._id} value={l._id}>
                          {l.name}{' '}
                          <span className="text-muted-foreground">
                            ({l.type === 'warehouse' ? 'Kho' : 'Chi nhánh'})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do điều chỉnh</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Vd: Kiểm kê thực tế, sai số kho..."
                      rows={2}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Danh sách mặt hàng</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => append({ productItemId: '', receivedQuantity: 1, note: '' })}
                >
                  <Plus className="mr-1 size-4" />
                  Thêm dòng
                </Button>
              </div>

              {!locationId && (
                <p className="text-xs text-muted-foreground">
                  Chọn kho / chi nhánh để tải danh sách hàng hóa.
                </p>
              )}

              {fields.map((f, idx) => {
                const selected = products.find((p) => p._id === form.watch(`details.${idx}.productItemId`))
                const snapshot = selected?.stock ?? 0
                const actual = form.watch(`details.${idx}.receivedQuantity`) ?? 0
                const diff = getAdjustQtyChange(snapshot, actual)

                return (
                  <div key={f.id} className="rounded-lg border bg-muted/30 p-3 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
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
                                placeholder={isOptionsLoading ? 'Đang tải...' : 'Chọn hàng hóa'}
                                onValueChange={(value) => {
                                  field.onChange(value)
                                  const p = products.find((x) => x._id === value)
                                  const stock = p?.stock ?? 0
                                  form.setValue(
                                    `details.${idx}.receivedQuantity`,
                                    Math.max(0, stock),
                                  )
                                  void form.trigger('details')
                                }}
                              />
                              {selected && (
                                <p className="text-xs text-muted-foreground">
                                  Tồn hệ thống:{' '}
                                  <strong>{snapshot.toLocaleString('vi-VN')}</strong>
                                </p>
                              )}
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
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`details.${idx}.receivedQuantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Tồn thực tế <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <QuantityStepper
                                min={0}
                                value={
                                  Number.isFinite(field.value) && field.value >= 0
                                    ? field.value
                                    : 0
                                }
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormItem>
                        <FormLabel className="text-xs">Chênh lệch</FormLabel>
                        <p
                          className={`h-9 flex items-center text-sm font-semibold tabular-nums ${
                            diff > 0
                              ? 'text-green-600 dark:text-green-400'
                              : diff < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </p>
                      </FormItem>
                    </div>

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
                )
              })}
              {form.formState.errors.details?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.details.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isOptionsLoading || !locationId}
                className="cursor-pointer"
              >
                <CheckCircle className="mr-2 size-4" />
                {form.formState.isSubmitting ? 'Đang tạo...' : 'Tạo phiếu kiểm kê'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
