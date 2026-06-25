'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, ShoppingBag } from 'lucide-react'
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
import type { ProductItem } from '@/types/product'
import { productApi } from '@/lib/api/product'
import { productItemFormSchema, type ProductItemFormValues } from '../../_types/product.types'

const EMPTY_VALUES: ProductItemFormValues = {
  productCode: '',
  sku: '',
  barcode: '',
  retailPrice: 0,
  costPrice: 0,
  VAT: 0,
  warrantyPeriod: '',
  description: '',
  images: [],
}

type Props =
  | {
      mode: 'create'
      productId: string
      open: boolean
      onOpenChange: (open: boolean) => void
      onSuccess: (item: ProductItem) => void
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
  const [uploading, setUploading] = useState(false)

  const form = useForm<ProductItemFormValues>({
    resolver: zodResolver(productItemFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return
    if (isEdit && existingItem) {
      form.reset({
        productCode: existingItem.productCode,
        sku: existingItem.sku,
        barcode: existingItem.barcode ?? '',
        retailPrice: existingItem.retailPrice,
        costPrice: existingItem.costPrice,
        VAT: existingItem.VAT ?? 0,
        warrantyPeriod: existingItem.warrantyPeriod ?? '',
        description: existingItem.description ?? '',
        images: existingItem.images ?? [],
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
    } catch (err: any) {
      toast.error(err.message || 'Tải ảnh lên thất bại')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data: ProductItemFormValues) {
    try {
      let result: ProductItem
      if (props.mode === 'edit') {
        result = await productApi.updateItem(props.item.id, data)
        toast.success('Cập nhật phiên bản thành công')
      } else {
        result = await productApi.createItem(props.productId, data)
        toast.success('Thêm phiên bản thành công')
      }
      onSuccess(result)
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? 'Cập nhật phiên bản thất bại' : 'Thêm phiên bản thất bại')
    }
  }

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
                        type="number"
                        min={0}
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                        type="number"
                        min={0}
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? undefined : e.target.valueAsNumber,
                          )
                        }
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
