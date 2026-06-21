import client from "./client";

interface BranchItem {
  _id: string;
  name: string;
  status: string;
  address?: string;
}

interface BranchListResponse {
  success: boolean;
  data: BranchItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BranchOption {
  value: string;
  label: string;
}

export const branchApi = {
  getList: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<BranchListResponse> => {
    const response = await client.get<BranchListResponse>("/branches", {
      params,
    });
    return response.data;
  },

  /** Lấy toàn bộ chi nhánh ACTIVE của tenant hiện tại dưới dạng dropdown options. */
  getOptions: async (): Promise<BranchOption[]> => {
    const response = await branchApi.getList({ limit: 100, status: "ACTIVE" });
    return (response.data ?? []).map((b) => ({ value: b._id, label: b.name }));
  },
};
