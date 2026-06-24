import client from "@/lib/api/client";
import type {
  Branch,
  BranchQueryParams,
  BranchListResponse,
  BranchCreatePayload,
  BranchUpdatePayload,
} from "@/types/branch";

export interface BranchOption {
  value: string;
  label: string;
}

export const branchApi = {
  getList: async (params?: BranchQueryParams): Promise<BranchListResponse> => {
    const res = await client.get<BranchListResponse>("/branches", { params });
    return res.data;
  },
  getById: async (id: string): Promise<Branch> => {
    const res = await client.get<{ data: Branch }>(`/branches/${id}`);
    return res.data.data;
  },
  create: async (payload: BranchCreatePayload): Promise<Branch> => {
    const res = await client.post<{ data: Branch }>("/branches", payload);
    return res.data.data;
  },
  update: async (id: string, payload: BranchUpdatePayload): Promise<Branch> => {
    const res = await client.patch<{ data: Branch }>(`/branches/${id}`, payload);
    return res.data.data;
  },
  remove: async (id: string): Promise<void> => {
    await client.delete(`/branches/${id}/delete`);
  },

  /** Lấy toàn bộ chi nhánh ACTIVE của tenant hiện tại dưới dạng dropdown options. */
  getOptions: async (): Promise<BranchOption[]> => {
    const response = await branchApi.getList({ limit: 100, status: "ACTIVE" });
    return (response.data ?? []).map((b) => ({ value: b._id, label: b.name }));
  },
};
