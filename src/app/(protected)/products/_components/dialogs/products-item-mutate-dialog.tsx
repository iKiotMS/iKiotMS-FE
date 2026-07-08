'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, ShoppingBag, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { uploadImage } from '@/lib/api/upload'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { ProductItem } from '@/types/product'
import { productApi } from '@/lib/api/product'
import { productItemFormSchema, type ProductItemFormValues } from '../../_types/product.types'
import { formatPriceAmount, parsePriceAmount } from '../../_constants/product.constants'

const EMPTY_VALUES: ProductItemFormValues = {
  productCode: '',
  sku: '',
  barcode: '',
  retailPrice: '',
  costPrice: '',
  VAT: '',
  warrantyPeriod: '',
  description: '',
  images: [],
  productDetails: [],
  initialStock: [],
}

type LocationOption = { value: string; label: string }

type Props =
  | {
      mode: 'create'
      productId: string
      open: boolean
      onOpenChange: (open: boolean) => void
      onSuccess: (item: ProductItem) => void
      branchOptions: LocationOption[]
      warehouseOptions: LocationOption[]
    }
  | {
      mode: 'edit'
      item: ProductItem
      open: boolean
      onOpenChange: (open: boolean) => void
      onSuccess: (item: ProductItem) => void
    }

export function ProductsItemMutateDialog(props: Props) {
  const { open, onOpenChange, onSuccess } = props
  const isEdit = props.mode === 'edit'
  const existingItem = props.mode === 'edit' ? props.item : undefined
  const branchOptions = props.mode === 'create' ? props.branchOptions : []
  const warehouseOptions = props.mode === 'create' ? props.warehouseOptions : []
  const [uploading, setUploading] = useState(false)

  const form = useForm<ProductItemFormValues>({
    resolver: zodResolver(productItemFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  const { fields: detailFields, append: appendDetail, remove: removeDetail } = useFieldArray({
    control: form.control,
    name: 'productDetails',
  })

  const { fields: stockFields, append: appendStock, remove: removeStock } = useFieldArray({
    control: form.control,
    name: 'initialStock',
  })

  useEffect(() => {
    if (!open) return
    if (isEdit && existingItem) {
      form.reset({
        productCode: existingItem.productCode,
        sku: existingItem.sku,
        barcode: existingItem.barcode ?? '',
        retailPrice: formatPriceAmount(existingItem.retailPrice),
        costPrice: formatPriceAmount(existingItem.costPrice),
        VAT: existingItem.VAT != null ? String(existingItem.VAT) : '',
        warrantyPeriod: existingItem.warrantyPeriod ?? '',
        description: existingItem.description ?? '',
        images: existingItem.images ?? [],
        productDetails: existingItem.productDetails?.map((d) => ({ name: d.name, value: d.value })) ?? [],
        initialStock: [],
      })
    } else {
      form.reset(EMPTY_VALUES)
    }
  }, [open, isEdit, existingItem, form])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      form.setValue('images', [{ url, isThumbnail: true }])
      toast.success('Tải ảnh lên thành công')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tải ảnh lên thất bại')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data: ProductItemFormValues) {
    const payload = {
      ...data,
      costPrice: parsePriceAmount(data.costPrice),
      retailPrice: parsePriceAmount(data.retailPrice),
      VAT: data.VAT ? Math.min(Number(data.VAT), 100) : undefined,
      productDetails: data.productDetails?.filter((d) => d.name.trim() && d.value.trim()),
      initialStock: isEdit
        ? undefined
        : data.initialStock
            ?.filter((s) => s.locationId)
            .map((s) => ({
              locationId: s.locationId,
              locationType: s.locationType,
              ...(s.stock && Number(s.stock) > 0 ? { stock: Number(s.stock) } : {}),
            })),
    }
    try {
      let result: ProductItem
      if (props.mode === 'edit') {
        result = await productApi.updateItem(props.item.id, payload)
        toast.success('Cập nhật phiên bản thành công')
      } else {
        result = await productApi.createItem(props.productId, payload)
        toast.success('Thêm phiên bản thành công')
      }
      onSuccess(result)
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? 'Cập nhật phiên bản thất bại' : 'Thêm phiên bản thất bại')
    }
  }

  const hasLocations = branchOptions.length > 0 || warehouseOptions.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa phiên bản' : 'Thêm phiên bản mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin phiên bản. Nhấn Lưu khi hoàn tất.'
              : 'Điền thông tin phiên bản mới. Nhấn Lưu khi hoàn tất.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* === Tải ảnh phiên bản === */}
            <div className="space-y-2">
              <FormLabel>Hình ảnh phiên bản</FormLabel>
              <div className="flex items-center gap-4">
                <div className="size-20 rounded-lg border bg-muted flex items-center justify-center overflow-hidden relative shrink-0">
                  {form.watch('images')?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.watch('images')?.[0]?.url}
                      alt="Variant preview"
                      className="object-cover size-full"
                    />
                  ) : (
                    <ShoppingBag className="size-8 text-muted-foreground" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <span className="animate-spin size-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="cursor-pointer max-w-xs"
                    />
                    {form.watch('images')?.[0]?.url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue('images', [])}
                        disabled={uploading}
                        className="cursor-pointer text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        Xóa ảnh
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hỗ trợ định dạng JPG, PNG. Dung lượng tối đa 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mã hàng <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: HH-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      SKU <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: SKU-HH001-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giá vốn (đ) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="0"
                        className="tabular-nums"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '')
                          field.onChange(digits ? formatPriceAmount(digits) : '')
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="retailPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giá bán (đ) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="0"
                        className="tabular-nums"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '')
                          field.onChange(digits ? formatPriceAmount(digits) : '')
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="VAT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT (%)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="0"
                        className="tabular-nums"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '')
                          if (!digits) { field.onChange(''); return }
                          const capped = Math.min(Number(digits), 100)
                          field.onChange(String(capped))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã vạch</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập mã vạch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="warrantyPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời hạn bảo hành</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: 12 tháng" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* === Thuộc tính sản phẩm === */}
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Thuộc tính</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer h-7 text-xs"
                  onClick={() => appendDetail({ name: '', value: '' })}
                >
                  <Plus className="mr-1 size-3.5" />
                  Thêm thuộc tính
                </Button>
              </div>
              {detailFields.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  VD: Màu sắc — Đỏ, Dung lượng — 512GB
                </p>
              )}
              <div className="space-y-2">
                {detailFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder="Tên thuộc tính (VD: Màu sắc)"
                      className="flex-1"
                      {...form.register(`productDetails.${index}.name`)}
                    />
                    <Input
                      placeholder="Giá trị (VD: Đỏ)"
                      className="flex-1"
                      {...form.register(`productDetails.${index}.value`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
                      onClick={() => removeDetail(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* === Tồn kho ban đầu (chỉ khi tạo) === */}
            {!isEdit && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel>Tồn kho ban đầu</FormLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">Tùy chọn</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer h-7 text-xs"
                      disabled={!hasLocations}
                      onClick={() => appendStock({ locationId: '', locationType: 'branch', stock: '0' })}
                    >
                      <Plus className="mr-1 size-3.5" />
                      Thêm địa điểm
                    </Button>
                  </div>
                  {!hasLocations && (
                    <p className="text-xs text-muted-foreground">
                      Chưa có chi nhánh hoặc kho. Vui lòng tạo trước để nhập tồn kho.
                    </p>
                  )}
                  <div className="space-y-2">
                    {stockFields.map((field, index) => {
                      const watched = form.watch('initialStock') ?? []
                      const current = watched[index]
                      const combined =
                        current?.locationId
                          ? `${current.locationType}:${current.locationId}`
                          : ''
                      return (
                        <div key={field.id} className="flex gap-2 items-center">
                          <Select
                            value={combined}
                            onValueChange={(val) => {
                              const sepIdx = val.indexOf(':')
                              const type = val.slice(0, sepIdx) as 'branch' | 'warehouse'
                              const id = val.slice(sepIdx + 1)
                              form.setValue(`initialStock.${index}.locationId`, id, { shouldDirty: true })
                              form.setValue(`initialStock.${index}.locationType`, type, { shouldDirty: true })
                            }}
                          >
                            <SelectTrigger className="flex-1 cursor-pointer">
                              <SelectValue placeholder="Chọn chi nhánh / kho" />
                            </SelectTrigger>
                            <SelectContent>
                              {branchOptions.length > 0 && (
                                <SelectGroup>
                                  <SelectLabel>Chi nhánh</SelectLabel>
                                  {branchOptions.map((b) => (
                                    <SelectItem key={b.value} value={`branch:${b.value}`}>
                                      {b.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )}
                              {warehouseOptions.length > 0 && (
                                <SelectGroup>
                                  <SelectLabel>Kho</SelectLabel>
                                  {warehouseOptions.map((w) => (
                                    <SelectItem key={w.value} value={`warehouse:${w.value}`}>
                                      {w.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              )}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-24 tabular-nums"
                            {...form.register(`initialStock.${index}.stock`)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
                            onClick={() => removeStock(index)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Hủy
              </Button>
              <Button type="submit" className="cursor-pointer">
                {isEdit ? (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm phiên bản
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
