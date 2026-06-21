import client from "./client";
import {
  isDeletedStaff,
  mapStaffFromApi,
  type ApiStaffUser,
} from "./staff-mapper";
import type {
  CreateStaffAccountPayload,
  CreateStaffPayload,
  Staff,
  StaffListResponse,
  StaffQueryParams,
  StaffRoleOption,
  UpdateStaffPayload,
} from "@/types/staff";

interface StaffListApiResponse {
  success?: boolean;
  data: ApiStaffUser[];
  pagination?: {
    total: number;
    page: number;
    recordPerPage: number;
    totalPages: number;
  };
}

function buildCreateBody(payload: CreateStaffPayload) {
  return {
    phoneNumber: payload.phoneNumber,
    email: payload.email,
    role: payload.role,
    branchId: payload.branchId || undefined,
    warehouseId: payload.warehouseId || undefined,
    hireDate: payload.hireDate || undefined,
    firstName: payload.firstName,
    lastName: payload.lastName,
    profile: {
      firstName: payload.firstName,
      lastName: payload.lastName,
    },
  };
}

function buildUpdateBody(payload: UpdateStaffPayload) {
  const data: Record<string, unknown> = {};

  if (payload.email !== undefined) data.email = payload.email;
  if (payload.role !== undefined) data.role = payload.role;
  if (payload.branchId !== undefined) data.branchId = payload.branchId;
  if (payload.warehouseId !== undefined) data.warehouseId = payload.warehouseId;
  if (payload.hireDate !== undefined) data.hireDate = payload.hireDate;

  const profile: Record<string, string> = {};
  if (payload.firstName !== undefined) profile.firstName = payload.firstName;
  if (payload.lastName !== undefined) profile.lastName = payload.lastName;
  if (Object.keys(profile).length > 0) data.profile = profile;

  return { data };
}

export const staffApi = {
  getList: async (params?: StaffQueryParams): Promise<StaffListResponse> => {
    const response = await client.get<StaffListApiResponse>("/staff", {
      params: {
        page: params?.page ?? 1,
        recordPerPage: params?.recordPerPage ?? 10,
        role: params?.role,
        status: params?.status,
        branchId: params?.branchId,
        warehouseId: params?.warehouseId,
        keyword: params?.keyword,
      },
    });

    const rawItems = response.data?.data ?? [];
    const items = rawItems.filter((user) => !isDeletedStaff(user));
    const pagination = response.data?.pagination;
    const recordPerPage = pagination?.recordPerPage ?? items.length;
    const total = pagination?.total ?? items.length;

    return {
      data: items.map(mapStaffFromApi),
      total,
      page: pagination?.page ?? 1,
      limit: recordPerPage,
      totalPages:
        pagination?.totalPages ??
        Math.max(1, Math.ceil(total / (recordPerPage || 1))),
    };
  },

  create: async (payload: CreateStaffPayload): Promise<Staff> => {
    const response = await client.post<ApiStaffUser>(
      "/staff",
      buildCreateBody(payload),
    );
    return mapStaffFromApi(response.data);
  },

  createAccount: async (
    id: string,
    payload: CreateStaffAccountPayload,
  ): Promise<void> => {
    await client.post(`/staff/${id}/account`, payload);
  },

  update: async (id: string, payload: UpdateStaffPayload): Promise<void> => {
    await client.patch(`/staff/${id}`, buildUpdateBody(payload));
  },

  updatePassword: async (
    id: string,
    payload: CreateStaffAccountPayload,
  ): Promise<void> => {
    await client.patch(`/staff/${id}/account/password`, payload);
  },

  deactivateAccount: async (id: string): Promise<void> => {
    await client.patch(`/staff/${id}/account/deactivate`);
  },

  remove: async (id: string): Promise<void> => {
    await client.delete(`/staff/${id}`);
  },

  getRoles: async (): Promise<StaffRoleOption[]> => {
    const response = await client.get<{ data: StaffRoleOption[] }>(
      "/staff/roles",
    );
    return response.data?.data ?? [];
  },
};
