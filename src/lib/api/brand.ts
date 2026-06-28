// [API – Brand]
import client from '@/lib/api/client'
import type {
  Brand,
  BrandQueryParams,
  BrandListResponse,
  BrandCreatePayload,
  BrandUpdatePayload,
} from '@/types/brand'

function mapBrand(doc: any): Brand {
  const { _id, ...rest } = doc
  return { ...rest, id: _id, _id }
}

export const brandApi = {
  getList: async (params?: BrandQueryParams): Promise<BrandListResponse> => {
    const res = await client.get<{ success: boolean; data: any[]; pagination: any }>(
      '/brands',
      { params },
    )
    return {
      data: res.data.data.map(mapBrand),
      pagination: res.data.pagination,
    }
  },

  getById: async (id: string): Promise<Brand> => {
    const res = await client.get<{ data: any }>(`/brands/${id}`)
    return mapBrand(res.data.data)
  },

  create: async (payload: BrandCreatePayload): Promise<Brand> => {
    const res = await client.post<{ data: any }>('/brands', payload)
    return mapBrand(res.data.data)
  },

  update: async (id: string, payload: BrandUpdatePayload): Promise<Brand> => {
    const res = await client.patch<{ data: any }>(`/brands/${id}`, payload)
    return mapBrand(res.data.data)
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/brands/${id}`)
  },
}
