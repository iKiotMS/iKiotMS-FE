'use client'

import { useEffect, useState } from 'react'
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
import type {
  StockMovementLocationOption,
  StockMovementProductItemOption,
  StockMovementSupplierOption,
} from '@/types/stock-movement'
import { useImports } from './imports-provider'

// --- Zod Schema ---
const importDetailSchema = z.object({
  productItemId: z.string().min(1, 'Vui lòng chọn hàng hóa'),
  quantity: z.number({ error: 'Nhập số nguyên' }).int().positive('Số lượng phải > 0'),
  importPrice: z.number({ error: 'Nhập số tiền' }).min(0, 'Giá nhập không được âm'),
  note: z.string().optional(),
})

const importFormSchema = z.object({
  fromSupplierId: z.string().min(1, 'Vui lòng chọn nhà cung cấp'),
  toLocationId: z.string().min(1, 'Vui lòng chọn kho nhận'),
  note: z.string().optional(),
  details: z.array(importDetailSchema).min(1, 'Cần ít nhất 1 mặt hàng'),
})

type ImportFormValues = z.infer<typeof importFormSchema>

const EMPTY_VALUES: ImportFormValues = {
  fromSupplierId: '',
  toLocationId: '',
  note: '',
  details: [{ productItemId: '', quantity: 1, importPrice: 0, note: '' }],
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

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'details' })

  useEffect(() => {
    if (!open) return
    form.reset(EMPTY_VALUES)
  }, [open, form])

  useEffect(() => {
    if (!open) return

    async function loadOptions() {
      setIsOptionsLoading(true)
      try {
        const [supplierOptions, locationOptions, productOptions] =
          await Promise.all([
            stockMovementApi.getSupplierOptions(),
            stockMovementApi.getLocationOptions(),
            stockMovementApi.getProductItemOptions(),
          ])
        setSuppliers(supplierOptions)
        setLocations(locationOptions)
        setProducts(productOptions)
      } catch (error) {
        console.error(error)
        toast.error('Không thể tải dữ liệu tạo đơn nhập hàng')
      } finally {
        setIsOptionsLoading(false)
      }
    }

    loadOptions()
  }, [open])

  const calcTotal = () => {
    const details = form.watch('details')
    return details.reduce((sum, d) => sum + (d.quantity || 0) * (d.importPrice || 0), 0)
  }

  const formatVND = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

  async function onSubmit(data: ImportFormValues) {
    const location = locations.find((l) => l._id === data.toLocationId)
    try {
      await stockMovementApi.createImport({
        movementType: 'IMPORT',
        fromSupplierId: data.fromSupplierId,
        toLocationId: data.toLocationId,
        toLocationType: location?.type ?? 'warehouse',
        note: data.note,
        details: data.details.map((d) => ({
          productItemId: d.productItemId,
          quantity: d.quantity,
          importPrice: d.importPrice,
          note: d.note,
        })),
      })
      toast.success('Tạo đơn nhập hàng thành công')
      onOpenChange(false)
      await fetchImports()
    } catch {
      toast.error('Không thể tạo đơn, vui lòng thử lại')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn nhập hàng mới</DialogTitle>
          <DialogDescription>Điền thông tin nhà cung cấp, kho nhận và danh sách hàng hóa cần nhập.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Nhà cung cấp + Kho nhận */}
            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="toLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kho / Chi nhánh nhận <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Chọn kho nhận" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((l) => (
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

            {/* Ghi chú */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ghi chú đơn hàng (tùy chọn)" rows={2} className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Danh sách mặt hàng */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Danh sách hàng hóa nhập</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => append({ productItemId: '', quantity: 1, importPrice: 0, note: '' })}
                >
                  <Plus className="mr-1 size-4" />
                  Thêm dòng
                </Button>
              </div>

              {fields.map((f, idx) => (
                <div key={f.id} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg border bg-muted/30">
                  {/* Hàng hóa */}
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name={`details.${idx}.productItemId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Hàng hóa <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="cursor-pointer h-8 text-sm">
                                <SelectValue placeholder="Chọn hàng hóa" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p._id} value={p._id}>
                                  {p.name} <span className="text-xs text-muted-foreground">({p.sku})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Số lượng */}
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`details.${idx}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Số lượng <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input type="number" min={1} placeholder="0" className="h-8 text-sm" value={field.value} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Giá nhập */}
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`details.${idx}.importPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Giá nhập (đ) <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input type="number" min={0} placeholder="0" className="h-8 text-sm" value={field.value} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Ghi chú dòng */}
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`details.${idx}.note`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Ghi chú</FormLabel>
                          <FormControl>
                            <Input placeholder="..." className="h-8 text-sm" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Xóa dòng */}
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive cursor-pointer"
                      onClick={() => remove(idx)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {form.formState.errors.details?.root && (
                <p className="text-sm text-destructive">{form.formState.errors.details.root.message}</p>
              )}
            </div>

            {/* Tổng giá trị */}
            <div className="flex justify-end pt-2">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tổng giá trị đơn hàng</p>
                <p className="text-xl font-bold">{formatVND(calcTotal())}</p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">Hủy</Button>
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
