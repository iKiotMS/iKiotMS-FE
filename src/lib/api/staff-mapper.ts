import type {
  Staff,
  StaffGender,
  StaffLeaveBalance,
  StaffProfile,
  StaffRole,
  StaffStatus,
} from "@/types/staff";

export interface ApiBranchRef {
  _id: string;
  name?: string;
  address?: string;
}

export interface ApiStaffUser {
  _id?: string;
  id?: string;
  tenantId?: string;
  email?: string;
  phoneNumber: string;
  role: string;
  status: string;
  branchId?: string | ApiBranchRef | null;
  warehouseId?: string | { _id: string; name?: string } | null;
  branch?: string | ApiBranchRef | null;
  warehouse?: string | { _id: string; name?: string } | null;
  profile?: StaffProfile & {
    firstName?: string;
    lastName?: string;
  };
  hireDate?: string;
  accountNote?: string;
  paySheetId?: string | { _id?: string; name?: string } | null;
  leaveBalance?: {
    annualLeaveDays?: number;
    remainingDays?: number;
  };
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

export function getStaffRoleLabel(role: StaffRole): string {
  return ROLE_LABELS[role] ?? role;
}

export function getStaffGenderLabel(gender?: StaffGender): string {
  if (!gender) return "—";
  return GENDER_LABELS[gender] ?? gender;
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

function mapLeaveBalance(
  balance?: ApiStaffUser["leaveBalance"],
): StaffLeaveBalance | undefined {
  if (!balance) return undefined;
  const annual = Number(balance.annualLeaveDays);
  const remaining = Number(balance.remainingDays);
  if (!Number.isFinite(annual) || !Number.isFinite(remaining)) return undefined;
  return { annualLeaveDays: annual, remainingDays: remaining };
}

function resolvePaySheetId(
  ref?: string | { _id?: string; name?: string } | null,
): string | null | undefined {
  if (ref === null) return null;
  if (ref === undefined) return undefined;
  if (typeof ref === "string") return ref || null;
  return ref._id ?? null;
}

function resolvePaySheetName(
  ref?: string | { _id?: string; name?: string } | null,
): string | undefined {
  if (!ref || typeof ref === "string") return undefined;
  return ref.name?.trim() || undefined;
}

export function isDeletedStaff(user: ApiStaffUser): boolean {
  return user.status === "DELETED";
}

/** Unwrap create (raw user) hoặc { staff } / { data } từ các action khác. */
export function unwrapStaffPayload(payload: unknown): ApiStaffUser | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as Record<string, unknown>;

  if (body.staff && typeof body.staff === "object") {
    return body.staff as ApiStaffUser;
  }
  if (body.data && typeof body.data === "object" && !Array.isArray(body.data)) {
    return body.data as ApiStaffUser;
  }
  if (
    typeof body.phoneNumber === "string" ||
    typeof body._id === "string" ||
    typeof body.id === "string"
  ) {
    return body as unknown as ApiStaffUser;
  }
  return null;
}

export function mapStaffFromApi(user: ApiStaffUser): Staff {
  const firstName = user.profile?.firstName ?? "";
  const lastName = user.profile?.lastName ?? "";
  const branchRef = user.branchId ?? user.branch;
  const warehouseRef = user.warehouseId ?? user.warehouse;
  const id = user._id ?? user.id ?? "";

  return {
    _id: String(id),
    tenantId: String(user.tenantId ?? ""),
    branchId: resolveRefId(branchRef),
    branchName: resolveRefName(branchRef),
    warehouseId: resolveRefId(warehouseRef) || undefined,
    warehouseName: warehouseRef ? resolveRefName(warehouseRef) : undefined,
    firstName,
    lastName,
    fullName: `${lastName} ${firstName}`.trim() || user.phoneNumber,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: mapRole(user.role),
    status: mapStatus(user.status),
    joinedAt: user.hireDate ?? user.createdAt,
    paySheetId: resolvePaySheetId(user.paySheetId),
    paySheetName: resolvePaySheetName(user.paySheetId),
    profile: mapProfile(user.profile),
    accountNote: user.accountNote,
    leaveBalance: mapLeaveBalance(user.leaveBalance),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function getApiFieldErrors(
  error: unknown,
): Record<string, string> | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const data = (error as { response?: { data?: Record<string, unknown> } })
    .response?.data;
  if (!data || typeof data !== "object") return undefined;

  const rawErrors =
    data.errors ??
    (typeof data.data === "object" &&
    data.data !== null &&
    !Array.isArray(data.data)
      ? (data.data as Record<string, unknown>).errors
      : undefined);

  const mapped: Record<string, string> = {};

  if (Array.isArray(rawErrors)) {
    for (const item of rawErrors) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const key =
        (typeof row.field === "string" && row.field) ||
        (typeof row.path === "string" && row.path) ||
        (typeof row.param === "string" && row.param) ||
        undefined;
      const message =
        (typeof row.message === "string" && row.message) ||
        (typeof row.msg === "string" && row.msg) ||
        undefined;
      if (key && message) mapped[key] = message;
    }
  } else if (rawErrors && typeof rawErrors === "object") {
    for (const [key, value] of Object.entries(rawErrors)) {
      if (typeof value === "string") {
        mapped[key] = value;
      } else if (Array.isArray(value) && typeof value[0] === "string") {
        mapped[key] = value[0];
      } else if (value && typeof value === "object") {
        const nested = value as Record<string, unknown>;
        if (typeof nested.message === "string") mapped[key] = nested.message;
        else if (typeof nested.msg === "string") mapped[key] = nested.msg;
      }
    }
  }

  // Một số BE chỉ trả message + field ở root
  if (
    Object.keys(mapped).length === 0 &&
    typeof data.field === "string" &&
    typeof data.message === "string" &&
    data.message !== "Validation failed"
  ) {
    mapped[data.field] = data.message;
  }

  return Object.keys(mapped).length > 0 ? mapped : undefined;
}

const STAFF_FORM_FIELD_KEYS = new Set([
  "firstName",
  "lastName",
  "phoneNumber",
  "email",
  "role",
  "branchId",
  "warehouseId",
  "hireDate",
  "paySheetId",
  "identificationId",
  "address",
  "gender",
  "dob",
  "taxNumber",
  "newPassword",
  "reEnterPassword",
  "accountNote",
]);

/** Gợi ý field từ nội dung message khi BE trả `general`. */
function inferStaffFormFieldFromMessage(message: string): string | undefined {
  const lower = message.toLowerCase();
  if (
    lower.includes("điện thoại") ||
    lower.includes("phone") ||
    lower.includes("sđt")
  ) {
    return "phoneNumber";
  }
  if (lower.includes("email")) return "email";
  if (
    lower.includes("căn cước") ||
    lower.includes("cccd") ||
    lower.includes("identification")
  ) {
    return "identificationId";
  }
  if (lower.includes("ngày sinh") || lower.includes("dob")) return "dob";
  if (lower.includes("giới tính") || lower.includes("gender")) return "gender";
  if (lower.includes("chi nhánh") || lower.includes("branch")) return "branchId";
  if (lower.includes("kho") || lower.includes("warehouse")) return "warehouseId";
  if (lower.includes("mật khẩu") || lower.includes("password")) {
    return "newPassword";
  }
  return undefined;
}

export function getApiFormFieldErrors(
  error: unknown,
): Record<string, string> | undefined {
  const errors = getApiFieldErrors(error);
  if (!errors) return undefined;

  const mapped: Record<string, string> = {};
  for (const [key, message] of Object.entries(errors)) {
    if (!message) continue;

    if (key === "general") {
      const inferred = inferStaffFormFieldFromMessage(message);
      if (inferred) mapped[inferred] = message;
      continue;
    }

    const formKey = key.includes(".") ? (key.split(".").pop() ?? key) : key;
    if (STAFF_FORM_FIELD_KEYS.has(formKey)) {
      mapped[formKey] = message;
    } else {
      const inferred = inferStaffFormFieldFromMessage(message);
      if (inferred) mapped[inferred] = message;
    }
  }
  return Object.keys(mapped).length > 0 ? mapped : undefined;
}

/** Lỗi validate staff từ BE — form gắn từng ô, không toast chung. */
export function isStaffApiValidationError(error: unknown): boolean {
  if (getApiFormFieldErrors(error)) return true;
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return false;
  }
  const data = (error as { response?: { data?: Record<string, unknown> } })
    .response?.data;
  return data?.message === "Validation failed";
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
      if (data.message === "Staff account is not active") {
        return "Tài khoản chưa được kích hoạt hoặc chưa có mật khẩu. Vui lòng dùng «Kích hoạt tài khoản» trước.";
      }
      if (
        data.message.includes("password") &&
        data.message.includes("required")
      ) {
        return "Nhân viên chưa có tài khoản đăng nhập. Vui lòng «Kích hoạt tài khoản» trước khi đổi quản lý hoặc thay thế quản lý.";
      }
      if (data.message.includes("phân công quản lý")) {
        return data.message;
      }
      if (data.message === "Validation failed") {
        const formFields = getApiFormFieldErrors(error);
        if (formFields) {
          const first = Object.values(formFields).find(Boolean);
          if (first) return first;
        }
        const fieldErrors = getApiFieldErrors(error);
        if (fieldErrors?.general) return fieldErrors.general;
        const firstField = fieldErrors
          ? Object.values(fieldErrors).find(Boolean)
          : undefined;
        if (firstField) return firstField;
        return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường đã nhập.";
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
