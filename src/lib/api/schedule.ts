import client from "./client";
import {
  getSessionBranchId,
  getSessionRole,
  getSessionWarehouseId,
} from "@/lib/auth";
import {
  filterSchedulesToWorkplaceScope,
  filterScheduleToWorkplaceScope,
  filterVisibleSchedules,
  mapScheduleFromApi,
  resolveScheduleWorkplaceScope,
} from "./schedule-mapper";
import {
  getScheduleListScope,
  type ScheduleListScope,
} from "@/app/(protected)/staffs/shared/schedule-permissions";
import { isDeletedScheduleStatus } from "@/app/(protected)/staffs/shared/schedule-utils";
import type {
  ApiScheduleUser,
  ApiWorkingSchedule,
  CreateWorkingSchedulePayload,
  CurrentWorkingScheduleResponse,
  ShiftTemplate,
  UpdateShiftTemplatePayload,
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

const LIST_PATH: Record<ScheduleListScope, string> = {
  all: "/working-schedules",
  branch: "/working-schedules/branches",
  warehouse: "/working-schedules/warehouses",
  own: "/working-schedules/me",
};

function resolveListPath(role?: string | null): string {
  const scope = getScheduleListScope(role);
  if (!scope) {
    throw new Error("Bạn không có quyền xem lịch làm việc");
  }
  return LIST_PATH[scope];
}

function mapListResponse(
  raw: WorkingScheduleListApiResponse,
  role = getSessionRole(),
): WorkingScheduleListResponse {
  const visible = filterVisibleSchedules(raw.data ?? []);
  const scope = resolveScheduleWorkplaceScope(
    role,
    getSessionBranchId(),
    getSessionWarehouseId(),
  );
  const mapped = filterSchedulesToWorkplaceScope(
    visible.map(mapScheduleFromApi),
    scope,
  );
  const pagination = raw.pagination;
  const recordPerPage = pagination?.recordPerPage ?? mapped.length;
  const total = pagination?.total ?? mapped.length;
  const totalPages =
    pagination?.totalPages ??
    pagination?.totalPage ??
    Math.max(1, Math.ceil(total / (recordPerPage || 1)));

  return {
    data: mapped,
    total: pagination?.total ?? mapped.length,
    page: pagination?.page ?? 1,
    totalPages,
  };
}

function applyWorkplaceScope(
  schedule: WorkingSchedule,
  role = getSessionRole(),
): WorkingSchedule | null {
  const scope = resolveScheduleWorkplaceScope(
    role,
    getSessionBranchId(),
    getSessionWarehouseId(),
  );
  return filterScheduleToWorkplaceScope(schedule, scope);
}

function normalizeBulkUserId(
  userId: CreateWorkingSchedulePayload["userId"],
): string | string[] {
  return Array.isArray(userId) ? userId : userId;
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
    role = getSessionRole(),
  ): Promise<WorkingScheduleListResponse> => {
    const response = await client.get<WorkingScheduleListApiResponse>(
      resolveListPath(role),
      { params },
    );
    return mapListResponse(response.data, role);
  },

  getById: async (id: string): Promise<WorkingSchedule> => {
    const response = await client.get<ApiWorkingSchedule>(
      `/working-schedules/${id}`,
    );
    if (isDeletedScheduleStatus(response.data.status)) {
      throw new Error("Không tìm thấy lịch làm việc");
    }
    const scoped = applyWorkplaceScope(mapScheduleFromApi(response.data));
    if (!scoped) {
      throw new Error("Bạn không có quyền xem lịch làm việc này");
    }
    return scoped;
  },

  getUserDetail: async (
    scheduleId: string,
    userId: string,
  ): Promise<WorkingSchedule> => {
    const response = await client.get<
      ApiWorkingSchedule & { user?: ApiWorkingSchedule["userId"] }
    >(`/working-schedules/${scheduleId}/users/${userId}`);

    const payload = response.data;
    const nestedUser =
      payload && typeof payload === "object" && "user" in payload
        ? (payload as { user?: ApiScheduleUser }).user
        : undefined;

    let raw: ApiWorkingSchedule;
    if (nestedUser) {
      const { user, ...scheduleData } = payload as ApiWorkingSchedule & {
        user: ApiScheduleUser;
      };
      const users = Array.isArray(user) ? user : [user];
      raw = {
        ...scheduleData,
        userId: users,
      } as ApiWorkingSchedule;
    } else {
      raw = payload as ApiWorkingSchedule;
    }

    const scoped = applyWorkplaceScope(mapScheduleFromApi(raw));
    if (!scoped) {
      throw new Error("Bạn không có quyền xem lịch làm việc này");
    }
    return scoped;
  },

  getCurrent: async (): Promise<CurrentWorkingScheduleResponse> => {
    const response = await client.get<CurrentWorkingScheduleResponse>(
      "/working-schedules/current",
    );
    return response.data;
  },

  createBulk: async (
    schedules: CreateWorkingSchedulePayload[],
  ): Promise<WorkingSchedule[]> => {
    const response = await client.post<{ data: ApiWorkingSchedule[] }>(
      "/working-schedules/bulk",
      {
        schedules: schedules.map((schedule) => ({
          ...schedule,
          userId: normalizeBulkUserId(schedule.userId),
        })),
      },
    );
    return (response.data.data ?? []).map(mapScheduleFromApi);
  },

  create: async (
    payload: CreateWorkingSchedulePayload,
  ): Promise<WorkingSchedule[]> => {
    return workingScheduleApi.createBulk([payload]);
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/working-schedules/${id}`);
  },
};
