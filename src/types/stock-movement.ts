export type MovementType = "IMPORT" | "TRANSFER" | "RETURN" | "ADJUST";

export type MovementStatus =
  | "PENDING"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "CANCELLED";

export type LocationType = "branch" | "warehouse";

export interface StockMovementDetail {
  productItemId: string;
  productName: string;
  sku: string;
  quantity: number;
  importPrice: number;
  receivedQuantity: number;
  note?: string;
}

export interface StockMovement {
  _id: string;
  tenantId: string;
  movementType: MovementType;
  status: MovementStatus;
  fromSupplierId?: string;
  supplierName?: string;
  fromLocationId?: string;
  fromLocationName?: string;
  fromLocationType?: LocationType;
  toLocationId: string;
  toLocationName: string;
  toLocationType: LocationType;
  requestedBy: string;
  requestedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  note?: string;
  details: StockMovementDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateImportPayload {
  movementType: "IMPORT";
  fromSupplierId: string;
  toLocationId: string;
  toLocationType: LocationType;
  note?: string;
  details: {
    productItemId: string;
    quantity: number;
    importPrice: number;
    note?: string;
  }[];
}

export interface CreateTransferPayload {
  movementType: "TRANSFER";
  fromLocationId: string;
  fromLocationType: LocationType;
  toLocationId: string;
  toLocationType: LocationType;
  note?: string;
  details: {
    productItemId: string;
    quantity: number;
    note?: string;
  }[];
}

export interface ReceiveRequestPayload {
  details: {
    productItemId: string;
    receivedQuantity: number;
  }[];
}

export interface StockMovementListResponse {
  data: StockMovement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockMovementQueryParams {
  page?: number;
  limit?: number;
  status?: MovementStatus;
  movementType?: MovementType;
  fromDate?: string;
  toDate?: string;
}

export interface StockMovementSupplierOption {
  _id: string;
  name: string;
}

export interface StockMovementLocationOption {
  _id: string;
  name: string;
  type: LocationType;
}

export interface StockMovementProductItemOption {
  _id: string;
  name: string;
  sku: string;
}
