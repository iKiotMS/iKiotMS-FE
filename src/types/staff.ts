export type StaffRole =
  | "BRANCH_MANAGER"
  | "WAREHOUSE_MANAGER"
  | "STAFF";

export type StaffStatus = "ACTIVE" | "INACTIVE";

export interface Staff {
  _id: string;
  tenantId: string;
  branchId: string;
  branchName: string;
  warehouseId?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: StaffRole;
  status: StaffStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffListResponse {
  data: Staff[];
  total: number;
  page: number;
  limit: number;
}

export interface StaffQueryParams {
  page?: number;
  recordPerPage?: number;
  role?: StaffRole;
  status?: StaffStatus;
  branchId?: string;
  keyword?: string;
}

export interface CreateStaffPayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  role: StaffRole;
  branchId?: string;
  warehouseId?: string;
  newPassword?: string;
  reEnterPassword?: string;
}

export interface UpdateStaffPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: StaffRole;
  branchId?: string;
  warehouseId?: string;
  status?: StaffStatus;
}

export interface CreateStaffAccountPayload {
  newPassword: string;
  reEnterPassword: string;
}

export interface StaffRoleOption {
  value: StaffRole;
  label: string;
}
