import client from "./client";
import type {
  CreateLeaveRequestPayload,
  LeaveRequest,
  LeaveRequestListResponse,
  LeaveRequestQueryParams,
  ReviewLeaveRequestPayload,
} from "@/types/leave-request";

export const leaveRequestApi = {
  getList: async (
    params?: LeaveRequestQueryParams,
  ): Promise<LeaveRequestListResponse> => {
    const response = await client.get("/leave-requests", { params });
    return response.data;
  },

  getById: async (id: string): Promise<LeaveRequest> => {
    const response = await client.get(`/leave-requests/${id}`);
    return response.data;
  },

  create: async (payload: CreateLeaveRequestPayload): Promise<LeaveRequest> => {
    const response = await client.post("/leave-requests", payload);
    return response.data;
  },

  review: async (
    id: string,
    payload: ReviewLeaveRequestPayload,
  ): Promise<LeaveRequest> => {
    const response = await client.patch(`/leave-requests/${id}/review`, payload);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/leave-requests/${id}`);
  },
};
