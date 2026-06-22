export type WarehouseStatus = "ACTIVE" | "INACTIVE";

export interface Warehouse {
  _id: string;
  name: string;
  address?: string;
  status: WarehouseStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface WarehouseQueryParams {
  search?: string;
  status?: WarehouseStatus;
  page?: number;
  limit?: number;
}

export interface WarehouseListResponse {
  success: boolean;
  message: string;
  data: Warehouse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WarehouseCreatePayload {
  name: string;
  address?: string;
}

export interface WarehouseUpdatePayload {
  name?: string;
  address?: string;
  status?: WarehouseStatus;
}
