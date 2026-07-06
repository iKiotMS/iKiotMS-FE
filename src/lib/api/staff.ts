import client from "./client";
import {
  isDeletedStaff,
  mapStaffFromApi,
  type ApiStaffUser,
} from "./staff-mapper";
import { parseIdentificationId } from "@/app/(protected)/staffs/shared/identification-format";
import {
  normalizeDateInput,
  parseTaxNumber,
} from "@/app/(protected)/staffs/shared/staff-date-validation";
import type {
  CreateStaffAccountPayload,
  CreateStaffPayload,
  Staff,
  StaffListResponse,
  StaffManagerActionPayload,
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

function buildProfileBody(
  firstName?: string,
  lastName?: string,
  profile?: CreateStaffPayload["profile"],
) {
  const result: Record<string, string> = {};

  if (firstName !== undefined) result.firstName = firstName;
  if (lastName !== undefined) result.lastName = lastName;
  if (profile?.identificationId) {
    result.identificationId = parseIdentificationId(profile.identificationId);
  }
  if (profile?.address) result.address = profile.address;
  if (profile?.gender) result.gender = profile.gender;
  if (profile?.dob) result.dob = normalizeDateInput(profile.dob) ?? profile.dob;
  if (profile?.avatarUrl !== undefined) result.avatarUrl = profile.avatarUrl;
  if (profile?.taxNumber) result.taxNumber = parseTaxNumber(profile.taxNumber);

  return Object.keys(result).length > 0 ? result : undefined;
}

function buildCreateBody(payload: CreateStaffPayload) {
  const profile = buildProfileBody(
    payload.firstName,
    payload.lastName,
    payload.profile,
  );

  return {
    phoneNumber: payload.phoneNumber,
    email: payload.email,
    role: payload.role,
    branchId: payload.branchId ?? undefined,
    warehouseId: payload.warehouseId ?? undefined,
    hireDate: normalizeDateInput(payload.hireDate),
    firstName: payload.firstName,
    lastName: payload.lastName,
    avatarUrl: payload.profile?.avatarUrl || undefined,
    taxNumber: parseTaxNumber(payload.profile?.taxNumber) || undefined,
    dob: normalizeDateInput(payload.profile?.dob),
    profile,
  };
}

function buildUpdateBody(payload: UpdateStaffPayload) {
  const data: Record<string, unknown> = {};

  if (payload.email !== undefined) data.email = payload.email;
  if (payload.role !== undefined) data.role = payload.role;
  if (payload.branchId !== undefined) data.branchId = payload.branchId;
  if (payload.warehouseId !== undefined) data.warehouseId = payload.warehouseId;
  if (payload.hireDate !== undefined) {
    data.hireDate = normalizeDateInput(payload.hireDate) ?? payload.hireDate;
  }
  if (payload.accountNote !== undefined) {
    data.accountNote = payload.accountNote.trim();
  }

  const profile = buildProfileBody(
    payload.firstName,
    payload.lastName,
    payload.profile,
  );
  if (profile) data.profile = profile;

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
    const rawTotal = pagination?.total ?? items.length;
    const deletedOnPage = rawItems.length - items.length;
    const total =
      !params?.status && deletedOnPage > 0
        ? Math.max(items.length, rawTotal - deletedOnPage)
        : rawTotal;
    const totalPages =
      pagination?.totalPages ??
      Math.max(1, Math.ceil(total / (recordPerPage || 1)));

    return {
      data: items.map(mapStaffFromApi),
      total,
      page: pagination?.page ?? 1,
      limit: recordPerPage,
      totalPages,
    };
  },

  /** Paginate GET /staff — dùng cho dropdown phân ca (chỉ nhân viên ACTIVE). */
  getActiveForScheduleOptions: async (): Promise<Staff[]> => {
    const all = await staffApi.getAllForOptions();
    return all.filter((staff) => staff.status === "ACTIVE");
  },

  /** Paginate GET /staff to collect all staff records across pages. */
  getAllForOptions: async (): Promise<Staff[]> => {
    const merged: Staff[] = [];
    let page = 1;
    let totalPages = 1;
    const recordPerPage = 100;

    while (page <= totalPages && page <= 10) {
      const response = await staffApi.getList({ page, recordPerPage });
      merged.push(...response.data);
      totalPages = response.totalPages;
      page += 1;
    }

    return merged;
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

  deactivateAccount: async (
    id: string,
    payload?: StaffManagerActionPayload,
  ): Promise<void> => {
    const body = payload?.replacementManagerId
      ? { replacementManagerId: payload.replacementManagerId }
      : {};
    await client.patch(`/staff/${id}/account/deactivate`, body);
  },

  remove: async (
    id: string,
    payload?: StaffManagerActionPayload,
  ): Promise<void> => {
    const body = payload?.replacementManagerId
      ? { replacementManagerId: payload.replacementManagerId }
      : {};
    await client.delete(`/staff/${id}`, { data: body });
  },

  getRoles: async (): Promise<StaffRoleOption[]> => {
    const response = await client.get<{ data: StaffRoleOption[] }>(
      "/staff/roles",
    );
    return response.data?.data ?? [];
  },
};
