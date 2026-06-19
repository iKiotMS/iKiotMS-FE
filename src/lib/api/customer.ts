// [API – Customer]
import client from '@/lib/api/client'
import type {
  Customer,
  CustomerQueryParams,
  CustomerListResponse,
  CustomerCreatePayload,
  CustomerUpdatePayload,
} from '@/types/customer'

export const customerApi = {
  getList: async (params?: CustomerQueryParams): Promise<CustomerListResponse> => {
    const res = await client.get<CustomerListResponse>('/customers', { params })
    return res.data
  },
  getById: async (id: string): Promise<Customer> => {
    const res = await client.get<{ data: Customer }>(`/customers/${id}`)
    return res.data.data
  },
  create: async (payload: CustomerCreatePayload): Promise<Customer> => {
    const res = await client.post<{ data: Customer }>('/customers', payload)
    return res.data.data
  },
  update: async (id: string, payload: CustomerUpdatePayload): Promise<Customer> => {
    const res = await client.patch<{ data: Customer }>(`/customers/${id}`, payload)
    return res.data.data
  },
  remove: async (id: string): Promise<void> => {
    await client.delete(`/customers/${id}`)
  },
  removeMany: async (ids: string[]): Promise<void> => {
    await client.delete('/customers', { data: { ids } })
  },
}
