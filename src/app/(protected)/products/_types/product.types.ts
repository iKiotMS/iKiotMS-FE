// [UI Types – Product]
import { z } from 'zod'

export type ProductsDialogType = 'add' | 'edit' | 'delete' | 'deleteMany' | 'crossBranchSearch'

const productDetailEntrySchema = z.object({
  name: z.string(),
  value: z.string(),
})

const initialStockEntrySchema = z.object({
  locationId: z.string(),
  locationType: z.enum(['branch', 'warehouse']),
  stock: z.string().optional(),
})

// Schema cho form tạo/chỉnh sửa Product (item fields optional — validate thủ công khi create)
export const productFormSchema = z.object({
  name: z.string().min(1, 'Tên hàng hóa là bắt buộc'),
  brandId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']),
  images: z
    .array(
      z.object({
        url: z.string(),
        isThumbnail: z.boolean(),
      }),
    )
    .optional(),
  // --- Phiên bản đầu tiên ---
  itemImages: z
    .array(z.object({ url: z.string(), isThumbnail: z.boolean() }))
    .optional(),
  productCode: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  retailPrice: z.string().optional(),
  costPrice: z.string().optional(),
  VAT: z.string().optional(),
  warrantyPeriod: z.string().optional(),
  description: z.string().optional(),
  productDetails: z.array(productDetailEntrySchema).optional(),
  initialStock: z.array(initialStockEntrySchema).optional(),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

// Schema cho form tạo/chỉnh sửa ProductItem (standalone)
export const productItemFormSchema = z.object({
  productCode: z.string().min(1, 'Mã hàng là bắt buộc'),
  sku: z.string().min(1, 'SKU là bắt buộc'),
  barcode: z.string().optional(),
  retailPrice: z.string().min(1, 'Giá bán là bắt buộc'),
  costPrice: z.string().min(1, 'Giá vốn là bắt buộc'),
  VAT: z.string().optional(),
  warrantyPeriod: z.string().optional(),
  description: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        isThumbnail: z.boolean(),
      }),
    )
    .optional(),
  productDetails: z.array(productDetailEntrySchema).optional(),
  initialStock: z.array(initialStockEntrySchema).optional(),
})

export type ProductItemFormValues = z.infer<typeof productItemFormSchema>
