import client from './client'
import type {
  StockMovement,
  StockMovementListResponse,
  StockMovementQueryParams,
  CreateImportPayload,
  CreateTransferPayload,
  ApproveRequestPayload,
} from '@/types/stock-movement'

export const stockMovementApi = {
  getList: async (params?: StockMovementQueryParams): Promise<StockMovementListResponse> => {
    const response = await client.get('/requests', { params })
    return response.data
  },

  getById: async (id: string): Promise<StockMovement> => {
    const response = await client.get(`/requests/${id}`)
    return response.data
  },

  createImport: async (payload: CreateImportPayload): Promise<StockMovement> => {
    const response = await client.post('/requests', payload)
    return response.data
  },

  createTransfer: async (payload: CreateTransferPayload): Promise<StockMovement> => {
    const response = await client.post('/requests', payload)
    return response.data
  },

  updateStatus: async (id: string, payload: ApproveRequestPayload): Promise<StockMovement> => {
    const response = await client.patch(`/requests/${id}`, payload)
    return response.data
  },
}
