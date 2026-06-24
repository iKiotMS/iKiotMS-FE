// [API – Category]
import client from '@/lib/api/client'
import type {
  Category,
  CategoryQueryParams,
  CategoryListResponse,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from '@/types/category'

export const categoryApi = {
  getList: async (params?: CategoryQueryParams): Promise<CategoryListResponse> => {
    const res = await client.get<CategoryListResponse>('/categories', { params })
    return res.data
  },
  getById: async (id: string): Promise<Category> => {
    const res = await client.get<{ data: Category }>(`/categories/${id}`)
    return res.data.data
  },
  create: async (payload: CategoryCreatePayload): Promise<Category> => {
    const res = await client.post<{ data: Category }>('/categories', payload)
    return res.data.data
  },
  update: async (id: string, payload: CategoryUpdatePayload): Promise<Category> => {
    const res = await client.patch<{ data: Category }>(`/categories/${id}`, payload)
    return res.data.data
  },
  remove: async (id: string): Promise<void> => {
    await client.delete(`/categories/${id}`)
  },
  removeMany: async (ids: string[]): Promise<void> => {
    await client.delete('/categories', { data: { ids } })
  },
}
