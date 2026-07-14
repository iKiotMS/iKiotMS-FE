export type StaffRole =
  | "BRANCH_MANAGER"
  | "WAREHOUSE_MANAGER"
  | "STAFF";

export type StaffStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type StaffGender = "MALE" | "FEMALE" | "OTHER";

export interface StaffProfile {
  identificationId?: string;
  address?: string;
  gender?: StaffGender;
  dob?: string;
  avatarUrl?: string;
  taxNumber?: string;
}

export interface StaffLeaveBalance {
  annualLeaveDays: number;
  remainingDays: number;
}

export interface Staff {
  _id: string;
  tenantId: string;
  branchId: string;
  branchName: string;
  warehouseId?: string;
  warehouseName?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: StaffRole;
  status: StaffStatus;
  joinedAt: string;
  /** Assigned paysheet from User.paySheetId (POST/PATCH /staff). */
  paySheetId?: string | null;
  paySheetName?: string;
  profile?: StaffProfile;
  accountNote?: string;
  leaveBalance?: StaffLeaveBalance;
  createdAt: string;
  updatedAt: string;
}

export interface StaffListResponse {
  data: Staff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffListQuery {
  page: number;
  recordPerPage: number;
  keyword: string;
  role: StaffRole | "all";
  status: StaffStatus | "all";
  branchId: string;
  warehouseId: string;
}

export interface StaffQueryParams {
  page?: number;
  recordPerPage?: number;
  role?: StaffRole;
  status?: StaffStatus;
  branchId?: string | null;
  warehouseId?: string | null;
  keyword?: string;
}

export interface StaffProfilePayload {
  identificationId?: string;
  address?: string;
  gender?: StaffGender;
  dob?: string;
  avatarUrl?: string;
  taxNumber?: string;
}

export interface CreateStaffPayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  role: StaffRole;
  branchId?: string | null;
  warehouseId?: string | null;
  /** Optional — createStaffDTO accepts paySheetId. */
  paySheetId?: string | null;
  hireDate?: string;
  profile?: StaffProfilePayload;
  newPassword?: string;
  reEnterPassword?: string;
}

export interface UpdateStaffPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  /** Không gửi qua PATCH /staff — đổi manager dùng API gán Branch/Warehouse. */
  branchId?: string | null;
  warehouseId?: string | null;
  /**
   * PATCH /staff data.paySheetId — ObjectId string, or null to remove assignment
   * (OpenAPI UpdateStaffRequest).
   */
  paySheetId?: string | null;
  hireDate?: string;
  profile?: StaffProfilePayload;
  accountNote?: string;
}

export interface CreateStaffAccountPayload {
  newPassword: string;
  reEnterPassword: string;
}

export interface StaffManagerActionPayload {
  replacementManagerId?: string;
}

export interface StaffRoleOption {
  value: StaffRole;
  label: string;
}
