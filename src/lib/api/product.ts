// [API – Product]
import client from '@/lib/api/client'
import type {
  Product,
  ProductItem,
  ProductQueryParams,
  ProductListResponse,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductItemCreatePayload,
  ProductItemUpdatePayload,
  PaginationResponse,
  ProductDetailResponse,
} from '@/types/product'

type MongoDoc<T> = Omit<T, 'id'> & { _id: string }

function mapId<T extends object>(doc: MongoDoc<T>): T & { id: string } {
  const { _id, ...rest } = doc
  return { ...(rest as T), id: _id }
}

export const productApi = {
  getList: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
    const res = await client.get<{
      data: MongoDoc<Product>[]
      pagination: PaginationResponse
    }>('/products', { params })
    return {
      data: res.data.data.map(mapId),
      pagination: res.data.pagination,
    }
  },

  getById: async (id: string): Promise<ProductDetailResponse> => {
    const res = await client.get<{ data: ProductDetailResponse }>(`/products/${id}`)
    return res.data.data
  },

  create: async (payload: ProductCreatePayload): Promise<Product> => {
    const res = await client.post<{ data: MongoDoc<Product> }>('/products', payload)
    return mapId(res.data.data)
  },

  update: async (id: string, payload: ProductUpdatePayload): Promise<Product> => {
    const res = await client.patch<{ data: MongoDoc<Product> }>(`/products/${id}`, payload)
    return mapId(res.data.data)
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/products/${id}/delete`)
  },

  createItem: async (productId: string, payload: ProductItemCreatePayload): Promise<ProductItem> => {
    const res = await client.post<{ data: MongoDoc<ProductItem> }>(`/products/${productId}/items`, payload)
    return mapId(res.data.data)
  },

  updateItem: async (itemId: string, payload: ProductItemUpdatePayload): Promise<ProductItem> => {
    const res = await client.patch<{ data: MongoDoc<ProductItem> }>(`/products/items/${itemId}`, payload)
    return mapId(res.data.data)
  },

  removeItem: async (itemId: string): Promise<void> => {
    await client.delete(`/products/items/${itemId}/delete`)
  },
}
