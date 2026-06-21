import type {
  Staff,
  StaffGender,
  StaffProfile,
  StaffRole,
  StaffSalaryType,
  StaffStatus,
} from "@/types/staff";

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
  profile?: StaffProfile & {
    firstName?: string;
    lastName?: string;
  };
  hireDate?: string;
  baseSalary?: number;
  salaryType?: string;
  accountNote?: string;
  createdAt: string;
  updatedAt: string;
}

const ROLE_LABELS: Record<StaffRole, string> = {
  STAFF: "Nhân viên bán hàng",
  WAREHOUSE_MANAGER: "Quản lý kho",
  BRANCH_MANAGER: "Quản lý chi nhánh",
};

const GENDER_LABELS: Record<StaffGender, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

const SALARY_TYPE_LABELS: Record<StaffSalaryType, string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
};

export function getStaffRoleLabel(role: StaffRole): string {
  return ROLE_LABELS[role] ?? role;
}

export function getStaffGenderLabel(gender?: StaffGender): string {
  if (!gender) return "—";
  return GENDER_LABELS[gender] ?? gender;
}

export function getStaffSalaryTypeLabel(salaryType?: StaffSalaryType): string {
  if (!salaryType) return "—";
  return SALARY_TYPE_LABELS[salaryType] ?? salaryType;
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
  if (status === "SUSPENDED") return "SUSPENDED";
  return "INACTIVE";
}

function mapRole(role: string): StaffRole {
  if (role === "BRANCH_MANAGER" || role === "WAREHOUSE_MANAGER") {
    return role;
  }
  return "STAFF";
}

function mapSalaryType(value?: string): StaffSalaryType | undefined {
  if (value === "FULL_TIME" || value === "PART_TIME") return value;
  return undefined;
}

function mapProfile(profile?: ApiStaffUser["profile"]): StaffProfile | undefined {
  if (!profile) return undefined;

  const mapped: StaffProfile = {};
  if (profile.identificationId) mapped.identificationId = profile.identificationId;
  if (profile.address) mapped.address = profile.address;
  if (profile.gender) mapped.gender = profile.gender;
  if (profile.dob) mapped.dob = profile.dob;
  if (profile.avatarUrl) mapped.avatarUrl = profile.avatarUrl;
  if (profile.taxNumber) mapped.taxNumber = profile.taxNumber;

  return Object.keys(mapped).length > 0 ? mapped : undefined;
}

export function isDeletedStaff(user: ApiStaffUser): boolean {
  return user.status === "DELETED";
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
    warehouseName: user.warehouseId
      ? resolveRefName(user.warehouseId)
      : undefined,
    firstName,
    lastName,
    fullName: `${lastName} ${firstName}`.trim() || user.phoneNumber,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: mapRole(user.role),
    status: mapStatus(user.status),
    joinedAt: user.hireDate ?? user.createdAt,
    baseSalary: user.baseSalary,
    salaryType: mapSalaryType(user.salaryType),
    profile: mapProfile(user.profile),
    accountNote: user.accountNote,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function extractBranchOptions(staffs: Staff[]): { value: string; label: string }[] {
  const map = new Map<string, string>();
  for (const staff of staffs) {
    if (staff.branchId) {
      const label =
        staff.branchName && staff.branchName !== "—"
          ? staff.branchName
          : "Chi nhánh";
      map.set(staff.branchId, label);
    }
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
}

export function extractWarehouseOptions(
  staffs: Staff[],
): { value: string; label: string }[] {
  const map = new Map<string, string>();
  for (const staff of staffs) {
    if (staff.warehouseId) {
      map.set(
        staff.warehouseId,
        staff.warehouseName && staff.warehouseName !== "—"
          ? staff.warehouseName
          : "Kho",
      );
    }
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
}

export function mergeSelectOptions(
  current: { value: string; label: string }[],
  incoming: { value: string; label: string }[],
): { value: string; label: string }[] {
  const map = new Map(current.map((item) => [item.value, item.label]));
  for (const item of incoming) {
    map.set(item.value, item.label);
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
}

export function getApiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: Record<string, unknown> } })
      .response?.data;

    if (typeof data?.error === "string") return data.error;
    if (typeof data?.message === "string") {
      if (data.message === "Invalid or expired token.") {
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      }
      return data.message;
    }

    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 403) {
      return "Bạn không có quyền thực hiện thao tác này.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Đã xảy ra lỗi";
}
