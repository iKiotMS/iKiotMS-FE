// [API – Brand]
import client from '@/lib/api/client'
import type {
  Brand,
  BrandQueryParams,
  BrandListResponse,
  BrandCreatePayload,
  BrandUpdatePayload,
} from '@/types/brand'

export const brandApi = {
  getList: async (params?: BrandQueryParams): Promise<BrandListResponse> => {
    const res = await client.get<BrandListResponse>('/brands', { params })
    return res.data
  },
  getById: async (id: string): Promise<Brand> => {
    const res = await client.get<{ data: Brand }>(`/brands/${id}`)
    return res.data.data
  },
  create: async (payload: BrandCreatePayload): Promise<Brand> => {
    const res = await client.post<{ data: Brand }>('/brands', payload)
    return res.data.data
  },
  update: async (id: string, payload: BrandUpdatePayload): Promise<Brand> => {
    const res = await client.patch<{ data: Brand }>(`/brands/${id}`, payload)
    return res.data.data
  },
  remove: async (id: string): Promise<void> => {
    await client.delete(`/brands/${id}`)
  },
  removeMany: async (ids: string[]): Promise<void> => {
    await client.delete('/brands', { data: { ids } })
  },
}
