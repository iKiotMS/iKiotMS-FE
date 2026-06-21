export type StaffRole =
  | "BRANCH_MANAGER"
  | "WAREHOUSE_MANAGER"
  | "STAFF";

export type StaffStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

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
  branchId?: string;
  warehouseId?: string;
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
  hireDate?: string;
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
  hireDate?: string;
}

export interface CreateStaffAccountPayload {
  newPassword: string;
  reEnterPassword: string;
}

export interface StaffRoleOption {
  value: StaffRole;
  label: string;
}
