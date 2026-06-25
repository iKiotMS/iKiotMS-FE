'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadImage } from '@/lib/api/upload'
import { toast } from 'sonner'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { Product } from '@/types/product'
import { productFormSchema, type ProductFormValues } from '../../_types/product.types'
import { useProducts } from '../../_context/products-provider'
import { formatPriceAmount, parsePriceAmount } from '../../_constants/product.constants'

const EMPTY_VALUES: ProductFormValues = {
  name: '',
  categoryName: '',
  status: 'ACTIVE',
  images: [],
  productCode: '',
  sku: '',
  barcode: '',
  retailPrice: '',
  costPrice: '',
  VAT: '',
  warrantyPeriod: '',
  description: '',
}

type ProductsMutateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Product
}

export function ProductsMutateDialog({ open, onOpenChange, currentRow }: ProductsMutateDialogProps) {
  const isEdit = !!currentRow
  const { handleAdd, handleEdit } = useProducts()
  const [uploading, setUploading] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return
    if (isEdit && currentRow) {
      form.reset({
        name: currentRow.name,
        categoryName: currentRow.categoryName ?? '',
        status: currentRow.status,
        images: currentRow.images ?? [],
      })
    } else {
      form.reset(EMPTY_VALUES)
    }
  }, [open, isEdit, currentRow, form])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      form.setValue('images', [{ url, isThumbnail: true }])
      toast.success('Tải ảnh lên thành công')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'Tải ảnh lên thất bại')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data: ProductFormValues) {
    if (!isEdit) {
      let hasErrors = false
      if (!data.productCode?.trim()) {
        form.setError('productCode', { message: 'Mã hàng là bắt buộc' })
        hasErrors = true
      }
      if (!data.sku?.trim()) {
        form.setError('sku', { message: 'SKU là bắt buộc' })
        hasErrors = true
      }
      if (!data.retailPrice?.trim()) {
        form.setError('retailPrice', { message: 'Giá bán là bắt buộc' })
        hasErrors = true
      }
      if (!data.costPrice?.trim()) {
        form.setError('costPrice', { message: 'Giá vốn là bắt buộc' })
        hasErrors = true
      }
      if (hasErrors) return
    }

    const success = isEdit && currentRow
      ? await handleEdit(currentRow.id, data)
      : await handleAdd(data)
    if (success) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa hàng hóa' : 'Thêm hàng hóa mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin hàng hóa. Nhấn Lưu khi hoàn tất.'
              : 'Điền thông tin hàng hóa mới. Nhấn Lưu khi hoàn tất.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Hình ảnh hàng hóa</FormLabel>
              <div className="flex items-center gap-4">
                <div className="size-20 rounded-lg border bg-muted flex items-center justify-center overflow-hidden relative shrink-0">
                  {form.watch('images')?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.watch('images')?.[0]?.url}
                      alt="Product preview"
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

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên hàng hóa <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên hàng hóa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên danh mục" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Đang kinh doanh</SelectItem>
                        <SelectItem value="INACTIVE">Ngừng kinh doanh</SelectItem>
                        <SelectItem value="DISCONTINUED">Ngừng sản xuất</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isEdit && (
              <>
                <Separator />
                <p className="text-sm font-medium">
                  Phiên bản đầu tiên <span className="text-destructive">*</span>
                </p>
                <p className="text-xs text-muted-foreground -mt-2">
                  Mỗi hàng hóa cần ít nhất một phiên bản. Bạn có thể thêm nhiều phiên bản sau.
                </p>

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
                          placeholder="Nhập mô tả hàng hóa"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                    Thêm hàng hóa
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
