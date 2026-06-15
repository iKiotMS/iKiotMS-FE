import client from "./client";
import type {
  CreateWorkingSchedulePayload,
  UpdateWorkingSchedulePayload,
  WorkingSchedule,
  WorkingScheduleListResponse,
  WorkingScheduleQueryParams,
} from "@/types/working-schedule";

export const workingScheduleApi = {
  getList: async (
    params?: WorkingScheduleQueryParams,
  ): Promise<WorkingScheduleListResponse> => {
    const response = await client.get("/working-schedules", { params });
    return response.data;
  },

  getById: async (id: string): Promise<WorkingSchedule> => {
    const response = await client.get(`/working-schedules/${id}`);
    return response.data;
  },

  create: async (
    payload: CreateWorkingSchedulePayload,
  ): Promise<WorkingSchedule> => {
    const response = await client.post("/working-schedules", payload);
    return response.data;
  },

  update: async (
    id: string,
    payload: UpdateWorkingSchedulePayload,
  ): Promise<WorkingSchedule> => {
    const response = await client.patch(`/working-schedules/${id}`, payload);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/working-schedules/${id}`);
  },
};
