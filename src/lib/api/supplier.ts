// [API – Supplier]
import client from '@/lib/api/client'
import type {
  Supplier,
  SupplierQueryParams,
  SupplierListResponse,
  SupplierCreatePayload,
  SupplierUpdatePayload,
  SupplierTransaction,
} from '@/types/supplier'

export const supplierApi = {
  getList: async (params?: SupplierQueryParams): Promise<SupplierListResponse> => {
    const res = await client.get<SupplierListResponse>('/suppliers', { params })
    return res.data
  },
  getById: async (id: string): Promise<Supplier> => {
    const res = await client.get<{ data: Supplier }>(`/suppliers/${id}`)
    return res.data.data
  },
  create: async (payload: SupplierCreatePayload): Promise<Supplier> => {
    const res = await client.post<{ data: Supplier }>('/suppliers', payload)
    return res.data.data
  },
  update: async (id: string, payload: SupplierUpdatePayload): Promise<Supplier> => {
    const res = await client.patch<{ data: Supplier }>(`/suppliers/${id}`, payload)
    return res.data.data
  },
  remove: async (id: string): Promise<void> => {
    await client.delete(`/suppliers/${id}`)
  },
  removeMany: async (ids: string[]): Promise<void> => {
    await client.delete('/suppliers', { data: { ids } })
  },
  getHistory: async (id: string): Promise<SupplierTransaction[]> => {
    const res = await client.get<{ data: SupplierTransaction[] }>(`/suppliers/${id}/history`)
    return res.data.data
  },
}
