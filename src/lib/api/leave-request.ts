import client from "./client";
import {
  extractCreatedLeaveRequest,
  mapLeaveRequestFromApi,
  toApiDate,
} from "./leave-request-mapper";
import type {
  CreateEmergencyLeavePayload,
  LeaveRequest,
  LeaveRequestListApiResponse,
  LeaveRequestListResponse,
  LeaveRequestQueryParams,
  LeaveRequestUserContext,
} from "@/types/leave-request";

function resolveListUrl(context: LeaveRequestUserContext): string {
  const role = context.role ?? "";

  if (role === "BRANCH_MANAGER" && context.branchId) {
    return `/leave-requests/branches/${context.branchId}`;
  }

  if (role === "WAREHOUSE_MANAGER" && context.warehouseId) {
    return `/leave-requests/warehouses/${context.warehouseId}`;
  }

  return "/leave-requests";
}

function buildQueryParams(params?: LeaveRequestQueryParams) {
  return {
    page: params?.page ?? 1,
    recordPerPage: params?.recordPerPage ?? 10,
    status: params?.status,
    leaveType: params?.leaveType,
    keyword: params?.keyword?.trim() || undefined,
    startDate: params?.startDate ? toApiDate(params.startDate) : undefined,
    endDate: params?.endDate ? toApiDate(params.endDate) : undefined,
  };
}

export const leaveRequestApi = {
  getListForUser: async (
    context: LeaveRequestUserContext,
    params?: LeaveRequestQueryParams,
  ): Promise<LeaveRequestListResponse> => {
    const url = resolveListUrl(context);
    const response = await client.get<LeaveRequestListApiResponse>(url, {
      params: buildQueryParams(params),
    });

    const pagination = response.data?.pagination;
    const total = pagination?.total ?? response.data?.data?.length ?? 0;
    const recordPerPage = pagination?.recordPerPage ?? params?.recordPerPage ?? 10;

    return {
      data: (response.data?.data ?? []).map(mapLeaveRequestFromApi),
      total,
      page: pagination?.page ?? params?.page ?? 1,
      totalPages:
        pagination?.totalPage ??
        Math.max(1, Math.ceil(total / recordPerPage)),
    };
  },

  createEmergency: async (
    payload: CreateEmergencyLeavePayload,
  ): Promise<LeaveRequest> => {
    const response = await client.post<{ data: unknown }>(
      "/leave-requests/emergency",
      {
        userId: payload.userId,
        leaveType: payload.leaveType,
        startDate: toApiDate(payload.startDate),
        endDate: toApiDate(payload.endDate),
        reason: payload.reason,
      },
    );

    const raw = extractCreatedLeaveRequest(response.data?.data);
    if (!raw?._id) {
      throw new Error("Phản hồi tạo đơn nghỉ phép không hợp lệ");
    }

    return mapLeaveRequestFromApi(raw);
  },

  approve: async (id: string, reviewNote?: string): Promise<void> => {
    await client.post(`/leave-requests/${id}/approve`, {
      reviewNote: reviewNote?.trim() || undefined,
    });
  },

  reject: async (id: string, reviewNote: string): Promise<void> => {
    await client.post(`/leave-requests/${id}/reject`, {
      reviewNote: reviewNote.trim(),
    });
  },
};
