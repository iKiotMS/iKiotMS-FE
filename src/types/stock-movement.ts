export type MovementType = 'IMPORT' | 'TRANSFER'

export type MovementStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED'

export type LocationType = 'branch' | 'warehouse'

export interface StockMovementDetail {
  productItemId: string
  productName: string
  sku: string
  quantity: number
  importPrice: number
  receivedQuantity: number
  note?: string
}

export interface StockMovement {
  _id: string
  tenantId: string
  movementType: MovementType
  status: MovementStatus
  fromSupplierId?: string
  supplierName?: string
  fromLocationId?: string
  fromLocationName?: string
  fromLocationType?: LocationType
  toLocationId: string
  toLocationName: string
  toLocationType: LocationType
  requestedBy: string
  requestedByName: string
  approvedBy?: string
  approvedByName?: string
  note?: string
  details: StockMovementDetail[]
  createdAt: string
  updatedAt: string
}

export interface CreateImportPayload {
  movementType: 'IMPORT'
  fromSupplierId: string
  toLocationId: string
  toLocationType: LocationType
  note?: string
  details: {
    productItemId: string
    quantity: number
    importPrice: number
    note?: string
  }[]
}

export interface CreateTransferPayload {
  movementType: 'TRANSFER'
  fromLocationId: string
  fromLocationType: LocationType
  toLocationId: string
  toLocationType: LocationType
  note?: string
  details: {
    productItemId: string
    quantity: number
    note?: string
  }[]
}

export interface ApproveRequestPayload {
  status: 'APPROVED' | 'REJECTED'
  details?: {
    productItemId: string
    receivedQuantity: number
  }[]
  note?: string
}

export interface StockMovementListResponse {
  data: StockMovement[]
  total: number
  page: number
  limit: number
}

export interface StockMovementQueryParams {
  page?: number
  limit?: number
  status?: MovementStatus
  movementType?: MovementType
  fromDate?: string
  toDate?: string
}
