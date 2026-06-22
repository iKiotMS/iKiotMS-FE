// [API – Product]
import client from '@/lib/api/client'
import type {
  Product,
  ProductQueryParams,
  ProductListResponse,
  ProductCreatePayload,
  ProductUpdatePayload,
  PaginationResponse,
} from '@/types/product'

export const productApi = {
  getList: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
    const res = await client.get<{
      data: Array<Omit<Product, 'id'> & { _id: string }>
      pagination: PaginationResponse
    }>('/products', { params })
    return {
      data: res.data.data.map(({ _id, ...rest }) => ({ ...rest, id: _id })),
      pagination: res.data.pagination,
    }
  },
  getById: async (id: string): Promise<Product> => {
    const res = await client.get<{ data: Product }>(`/products/${id}`)
    return res.data.data
  },
  create: async (payload: ProductCreatePayload): Promise<Product> => {
    const res = await client.post<{ data: Product }>('/products', payload)
    return res.data.data
  },
  update: async (id: string, payload: ProductUpdatePayload): Promise<Product> => {
    const res = await client.patch<{ data: Product }>(`/products/${id}`, payload)
    return res.data.data
  },
  remove: async (id: string): Promise<void> => {
    await client.delete(`/products/${id}`)
  },
  removeMany: async (ids: string[]): Promise<void> => {
    await client.delete('/products', { data: { ids } })
  },
}
