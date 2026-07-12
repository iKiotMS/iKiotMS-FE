import client from '@/lib/api/client'
import { parseLocationKey } from '@/lib/location-key'
import { useAuthStore } from '@/store/auth-store'
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

type MongoDoc<T extends object> = Omit<T, 'id'> & { _id: string }

// GET /products, GET /products/:id — có items (nested) và totalStock
type MongoProduct = MongoDoc<Omit<Product, 'items'>> & {
  items?: MongoDoc<ProductItem>[]
}

// POST /products, PATCH /products/:id — không trả về items hay totalStock
type MongoProductBase = MongoDoc<Omit<Product, 'items' | 'totalStock'>>

function mapId<T extends object>(doc: MongoDoc<T>): T & { id: string } {
  const { _id, ...rest } = doc
  return { ...(rest as unknown as T), id: _id }
}

function mapProduct(prod: MongoProduct): Product {
  const { _id, items, ...rest } = prod
  return {
    ...(rest as unknown as Omit<Product, 'id' | 'items'>),
    id: _id,
    items: items?.map(mapId),
  }
}

export const productApi = {
  getList: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
    const parsed = parseLocationKey(useAuthStore.getState().locationKey)
    const locationParams = parsed
      ? { locationId: parsed.locationId, locationType: parsed.locationType }
      : {}

    const mergedParams = {
      ...locationParams,
      ...params,
    };

    const res = await client.get<{
      data: MongoProduct[]
      pagination: PaginationResponse
    }>('/products', { params: mergedParams })
    return {
      data: res.data.data.map(mapProduct),
      pagination: res.data.pagination,
    }
  },

  getById: async (id: string): Promise<ProductDetailResponse> => {
    const res = await client.get<{ data: MongoProduct }>(`/products/${id}`)
    return mapProduct(res.data.data) as ProductDetailResponse
  },

  create: async (payload: ProductCreatePayload): Promise<Product> => {
    const res = await client.post<{ data: MongoProductBase }>('/products', payload)
    return mapId(res.data.data)
  },

  update: async (id: string, payload: ProductUpdatePayload): Promise<Product> => {
    const res = await client.patch<{ data: MongoProductBase }>(`/products/${id}`, payload)
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
