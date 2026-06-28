// [API – Category]
import client from '@/lib/api/client'
import type {
  Category,
  CategoryQueryParams,
  CategoryListResponse,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from '@/types/category'

function mapCategory(doc: any): Category {
  const { _id, ...rest } = doc
  return { ...rest, id: _id, _id }
}

export const categoryApi = {
  getList: async (params?: CategoryQueryParams): Promise<CategoryListResponse> => {
    const res = await client.get<{ success: boolean; data: any[]; pagination: any }>(
      '/categories',
      { params },
    )
    return {
      data: res.data.data.map(mapCategory),
      pagination: res.data.pagination,
    }
  },

  getById: async (id: string): Promise<Category> => {
    const res = await client.get<{ data: any }>(`/categories/${id}`)
    return mapCategory(res.data.data)
  },

  getTree: async (): Promise<Category[]> => {
    const res = await client.get<{ data: any[] }>('/categories/tree')
    return res.data.data.map(mapCategory)
  },

  create: async (payload: CategoryCreatePayload): Promise<Category> => {
    const res = await client.post<{ data: any }>('/categories', payload)
    return mapCategory(res.data.data)
  },

  update: async (id: string, payload: CategoryUpdatePayload): Promise<Category> => {
    const res = await client.patch<{ data: any }>(`/categories/${id}`, payload)
    return mapCategory(res.data.data)
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/categories/${id}`)
  },
}
