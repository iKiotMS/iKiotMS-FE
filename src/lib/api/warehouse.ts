import client from "./client";

interface WarehouseItem {
  _id: string;
  name: string;
  status: string;
  address?: string;
}

interface WarehouseListResponse {
  success: boolean;
  data: WarehouseItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WarehouseOption {
  value: string;
  label: string;
}

export const warehouseApi = {
  getList: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<WarehouseListResponse> => {
    const response = await client.get<WarehouseListResponse>("/warehouses", {
      params,
    });
    return response.data;
  },

  /** Lấy toàn bộ kho ACTIVE của tenant hiện tại dưới dạng dropdown options. */
  getOptions: async (): Promise<WarehouseOption[]> => {
    const response = await warehouseApi.getList({ limit: 100, status: "ACTIVE" });
    return (response.data ?? []).map((w) => ({ value: w._id, label: w.name }));
  },
};
