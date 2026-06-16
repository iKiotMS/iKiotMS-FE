import client from "./client";
import type {
  CreateStaffPayload,
  Staff,
  StaffListResponse,
  StaffQueryParams,
  UpdateStaffPayload,
} from "@/types/staff";

export const staffApi = {
  getList: async (params?: StaffQueryParams): Promise<StaffListResponse> => {
    const response = await client.get("/staffs", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Staff> => {
    const response = await client.get(`/staffs/${id}`);
    return response.data;
  },

  create: async (payload: CreateStaffPayload): Promise<Staff> => {
    const response = await client.post("/staffs", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateStaffPayload): Promise<Staff> => {
    const response = await client.patch(`/staffs/${id}`, payload);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/staffs/${id}`);
  },
};
