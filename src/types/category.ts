// [Domain – Types]
export type CategoryStatus = 'ACTIVE' | 'INACTIVE'

export interface Category {
  id: string
  categoryCode: string
  name: string
  description: string
  productCount: number
  status: CategoryStatus
  createdAt: string
}

export interface CategoryQueryParams {
  keyword?: string
  status?: CategoryStatus
  page?: number
  limit?: number
}

export interface CategoryListResponse {
  data: Category[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CategoryCreatePayload {
  categoryCode: string
  name: string
  description?: string
  status: CategoryStatus
}

export type CategoryUpdatePayload = Partial<CategoryCreatePayload>
