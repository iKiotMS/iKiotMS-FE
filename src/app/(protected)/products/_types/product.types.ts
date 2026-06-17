import { z } from 'zod'

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'

export interface Product {
  id: string
  productCode: string
  sku: string
  barcode: string
  name: string
  categoryName: string
  brandName: string
  retailPrice: number
  costPrice: number
  VAT: number
  stock: number
  status: ProductStatus
  warrantyPeriod: string
  description: string
  createdAt: string
  imageUrl?: string
}

export type ProductsDialogType = 'add' | 'edit' | 'delete' | 'deleteMany'

export const productFormSchema = z.object({
  name: z.string().min(1, 'Tên hàng hóa là bắt buộc'),
  productCode: z.string().min(1, 'Mã hàng là bắt buộc'),
  sku: z.string().min(1, 'SKU là bắt buộc'),
  barcode: z.string().optional(),
  categoryName: z.string().min(1, 'Vui lòng chọn danh mục'),
  brandName: z.string().optional(),
  retailPrice: z.number().min(0, 'Giá bán không được âm'),
  costPrice: z.number().min(0, 'Giá vốn không được âm'),
  VAT: z.number().min(0).max(100).optional(),
  warrantyPeriod: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
