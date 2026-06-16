import type { Staff, StaffRole, StaffStatus } from "@/types/staff";

export interface ApiBranchRef {
  _id: string;
  name?: string;
  address?: string;
}

export interface ApiStaffUser {
  _id: string;
  tenantId: string;
  email?: string;
  phoneNumber: string;
  role: string;
  status: string;
  branchId?: string | ApiBranchRef | null;
  warehouseId?: string | { _id: string; name?: string } | null;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  hireDate?: string;
  createdAt: string;
  updatedAt: string;
}

const ROLE_LABELS: Record<StaffRole, string> = {
  STAFF: "Nhân viên bán hàng",
  WAREHOUSE_MANAGER: "Quản lý kho",
  BRANCH_MANAGER: "Quản lý chi nhánh",
};

export function getStaffRoleLabel(role: StaffRole): string {
  return ROLE_LABELS[role] ?? role;
}

function resolveRefId(
  ref?: string | { _id: string } | null,
): string {
  if (!ref) return "";
  return typeof ref === "string" ? ref : ref._id;
}

function resolveRefName(
  ref?: string | ApiBranchRef | null,
): string {
  if (!ref) return "—";
  if (typeof ref === "string") return ref;
  return ref.name ?? ref._id;
}

function mapStatus(status: string): StaffStatus {
  if (status === "ACTIVE") return "ACTIVE";
  return "INACTIVE";
}

function mapRole(role: string): StaffRole {
  if (role === "BRANCH_MANAGER" || role === "WAREHOUSE_MANAGER") {
    return role;
  }
  return "STAFF";
}

export function mapStaffFromApi(user: ApiStaffUser): Staff {
  const firstName = user.profile?.firstName ?? "";
  const lastName = user.profile?.lastName ?? "";

  return {
    _id: user._id,
    tenantId: String(user.tenantId),
    branchId: resolveRefId(user.branchId),
    branchName: resolveRefName(user.branchId),
    warehouseId: resolveRefId(user.warehouseId) || undefined,
    firstName,
    lastName,
    fullName: `${lastName} ${firstName}`.trim() || user.phoneNumber,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: mapRole(user.role),
    status: mapStatus(user.status),
    joinedAt: user.hireDate ?? user.createdAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function extractBranchOptions(staffs: Staff[]): { value: string; label: string }[] {
  const map = new Map<string, string>();
  for (const staff of staffs) {
    if (staff.branchId) {
      map.set(staff.branchId, staff.branchName || staff.branchId);
    }
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
}

export function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { error?: string } } }).response?.data
      ?.error === "string"
  ) {
    return (error as { response: { data: { error: string } } }).response.data.error;
  }
  if (error instanceof Error) return error.message;
  return "Đã xảy ra lỗi";
}
