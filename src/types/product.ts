// [Domain – Types]
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

export interface ProductQueryParams {
  keyword?: string
  status?: ProductStatus
  categoryName?: string
  page?: number
  limit?: number
}

export interface ProductListResponse {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductCreatePayload {
  productCode: string
  sku: string
  barcode?: string
  name: string
  categoryName: string
  brandName?: string
  retailPrice: number
  costPrice: number
  VAT?: number
  warrantyPeriod?: string
  description?: string
  status: ProductStatus
}

export type ProductUpdatePayload = Partial<ProductCreatePayload>
