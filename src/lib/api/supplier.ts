// [API – Supplier]
import client from '@/lib/api/client'
import type {
  Supplier,
  SupplierPagination,
  SupplierQueryParams,
  SupplierListResponse,
  SupplierCreatePayload,
  SupplierUpdatePayload,
  SupplierPayDebtPayload,
} from '@/types/supplier'

// Backend trả về document Mongoose với `_id`; FE dùng `id`.
type SupplierDoc = Omit<Supplier, 'id'> & { _id: string }

function mapSupplier(doc: SupplierDoc): Supplier {
  const { _id, ...rest } = doc
  return { ...rest, id: _id, _id }
}

export const supplierApi = {
  getList: async (params?: SupplierQueryParams): Promise<SupplierListResponse> => {
    const res = await client.get<{
      success: boolean
      data: SupplierDoc[]
      pagination: SupplierPagination
    }>('/suppliers', { params })
    return {
      data: res.data.data.map(mapSupplier),
      pagination: res.data.pagination,
    }
  },

  getById: async (id: string): Promise<Supplier> => {
    const res = await client.get<{ data: SupplierDoc }>(`/suppliers/${id}`)
    return mapSupplier(res.data.data)
  },

  create: async (payload: SupplierCreatePayload): Promise<Supplier> => {
    const res = await client.post<{ data: SupplierDoc }>('/suppliers', payload)
    return mapSupplier(res.data.data)
  },

  update: async (id: string, payload: SupplierUpdatePayload): Promise<Supplier> => {
    const res = await client.patch<{ data: SupplierDoc }>(`/suppliers/${id}`, payload)
    return mapSupplier(res.data.data)
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/suppliers/${id}`)
  },

  // Thanh toán công nợ: backend giảm outstandingDebt và tạo bản ghi CashFlow (chi).
  payDebt: async (id: string, payload: SupplierPayDebtPayload): Promise<Supplier> => {
    const res = await client.post<{ data: { supplier: SupplierDoc } }>(
      `/suppliers/${id}/payments`,
      payload,
    )
    return mapSupplier(res.data.data.supplier)
  },
}
