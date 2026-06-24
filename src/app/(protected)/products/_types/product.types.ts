// [UI Types – Product]
import { z } from 'zod'

export type ProductsDialogType = 'add' | 'edit' | 'delete' | 'deleteMany'

// Schema cho form tạo/chỉnh sửa Product (item fields optional — validate thủ công khi create)
export const productFormSchema = z.object({
  name: z.string().min(1, 'Tên hàng hóa là bắt buộc'),
  categoryName: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']),
  productCode: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  retailPrice: z.number().min(0, 'Giá bán không được âm').optional(),
  costPrice: z.number().min(0, 'Giá vốn không được âm').optional(),
  VAT: z.number().min(0).max(100).optional(),
  warrantyPeriod: z.string().optional(),
  description: z.string().optional(),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

// Schema cho form tạo/chỉnh sửa ProductItem (standalone)
export const productItemFormSchema = z.object({
  productCode: z.string().min(1, 'Mã hàng là bắt buộc'),
  sku: z.string().min(1, 'SKU là bắt buộc'),
  barcode: z.string().optional(),
  retailPrice: z.number().min(0, 'Giá bán không được âm'),
  costPrice: z.number().min(0, 'Giá vốn không được âm'),
  VAT: z.number().min(0).max(100).optional(),
  warrantyPeriod: z.string().optional(),
  description: z.string().optional(),
})

export type ProductItemFormValues = z.infer<typeof productItemFormSchema>
