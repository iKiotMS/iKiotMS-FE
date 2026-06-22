import client from "./client";
import { mapScheduleFromApi } from "./schedule-mapper";
import type {
  ApiWorkingSchedule,
  CreateWorkingSchedulePayload,
  ShiftTemplate,
  UpdateShiftTemplatePayload,
  UpdateWorkingSchedulePayload,
  WorkingSchedule,
  WorkingScheduleListApiResponse,
  WorkingScheduleListResponse,
  WorkingScheduleQueryParams,
} from "@/types/working-schedule";

interface ShiftTemplateListResponse {
  data: ShiftTemplate[];
  pagination: {
    total: number;
    page: number;
    recordPerPage: number;
    totalPages: number;
  };
}

export const shiftTemplateApi = {
  getList: async (params?: {
    page?: number;
    recordPerPage?: number;
    name?: string;
  }): Promise<ShiftTemplateListResponse> => {
    const response = await client.get<ShiftTemplateListResponse>(
      "/shift-templates",
      { params },
    );
    return response.data;
  },

  getById: async (id: string): Promise<ShiftTemplate> => {
    const response = await client.get<ShiftTemplate>(
      `/shift-templates/${id}`,
    );
    return response.data;
  },

  create: async (
    payload: UpdateShiftTemplatePayload,
  ): Promise<ShiftTemplate> => {
    const response = await client.post<{ data: ShiftTemplate }>(
      "/shift-templates",
      payload,
    );
    return response.data.data;
  },

  update: async (
    id: string,
    payload: UpdateShiftTemplatePayload,
  ): Promise<ShiftTemplate> => {
    const response = await client.patch<{ data: ShiftTemplate }>(
      `/shift-templates/${id}`,
      payload,
    );
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/shift-templates/${id}`);
  },
};

export const workingScheduleApi = {
  getList: async (
    params?: WorkingScheduleQueryParams,
  ): Promise<WorkingScheduleListResponse> => {
    const response = await client.get<WorkingScheduleListApiResponse>(
      "/working-schedules",
      { params },
    );
    const raw = response.data;
    return {
      data: (raw.data ?? []).map(mapScheduleFromApi),
      total: raw.pagination?.total ?? 0,
      page: raw.pagination?.page ?? 1,
      totalPages: raw.pagination?.totalPages ?? 1,
    };
  },

  getById: async (id: string): Promise<WorkingSchedule> => {
    const response = await client.get<ApiWorkingSchedule>(
      `/working-schedules/${id}`,
    );
    return mapScheduleFromApi(response.data);
  },

  create: async (
    payload: CreateWorkingSchedulePayload,
  ): Promise<WorkingSchedule[]> => {
    return workingScheduleApi.createBulk([payload]);
  },

  createBulk: async (
    schedules: CreateWorkingSchedulePayload[],
  ): Promise<WorkingSchedule[]> => {
    const response = await client.post<{ data: ApiWorkingSchedule[] }>(
      "/working-schedules/bulk",
      { schedules },
    );
    return (response.data.data ?? []).map(mapScheduleFromApi);
  },

  update: async (
    id: string,
    payload: UpdateWorkingSchedulePayload,
  ): Promise<WorkingSchedule> => {
    const response = await client.patch<{ data: ApiWorkingSchedule }>(
      `/working-schedules/${id}`,
      payload,
    );
    return mapScheduleFromApi(response.data.data);
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/working-schedules/${id}`);
  },
};
