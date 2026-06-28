// [Domain – Types]
export type BrandStatus = 'ACTIVE' | 'INACTIVE'

export interface Brand {
  id: string
  brandCode: string
  name: string
  country: string
  description: string
  productCount: number
  status: BrandStatus
  createdAt: string
}

export interface BrandQueryParams {
  keyword?: string
  status?: BrandStatus
  country?: string
  page?: number
  limit?: number
}

export interface BrandListResponse {
  data: Brand[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BrandCreatePayload {
  brandCode: string
  name: string
  country?: string
  description?: string
  status: BrandStatus
}

export type BrandUpdatePayload = Partial<BrandCreatePayload>
