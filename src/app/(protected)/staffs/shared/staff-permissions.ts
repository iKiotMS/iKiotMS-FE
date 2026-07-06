/** Matches BE permissions.json staff module access. */
const STAFF_WRITE_ROLES = new Set(["TENANT_OWNER", "BRANCH_MANAGER"]);
const STAFF_DELETE_ROLES = new Set(["TENANT_OWNER", "BRANCH_MANAGER"]);
const TENANT_OWNER = "TENANT_OWNER";
const BRANCH_MANAGER = "BRANCH_MANAGER";

export function canViewStaff(userRole?: string | null): boolean {
  return canManageStaff(userRole);
}

export function canManageStaff(userRole?: string | null): boolean {
  if (!userRole) return false;
  return STAFF_WRITE_ROLES.has(userRole);
}

export function canCreateStaff(userRole?: string | null): boolean {
  return canManageStaff(userRole);
}

export function canUpdateStaff(userRole?: string | null): boolean {
  return canManageStaff(userRole);
}

export function canManageStaffAccount(userRole?: string | null): boolean {
  return canManageStaff(userRole);
}

export function canDeleteStaff(userRole?: string | null): boolean {
  if (!userRole) return false;
  return STAFF_DELETE_ROLES.has(userRole);
}

/** TENANT_OWNER can filter list by branch; BM is auto-scoped by BE. */
export function canFilterStaffByBranch(userRole?: string | null): boolean {
  return userRole === TENANT_OWNER;
}

/** TENANT_OWNER can filter list by warehouse. */
export function canFilterStaffByWarehouse(userRole?: string | null): boolean {
  return userRole === TENANT_OWNER;
}

/** BM create form: branch locked to their workplace. */
export function shouldLockBranchOnCreate(userRole?: string | null): boolean {
  return userRole === BRANCH_MANAGER;
}

/** Chỉ TO gán nhân viên vào kho; BM chỉ quản lý chi nhánh. */
export function canAssignWarehouseOnStaffForm(
  userRole?: string | null,
): boolean {
  return userRole === TENANT_OWNER;
}

/** Manager role/workplace cannot be edited via PATCH /staff — BE blocks. */
export function canEditStaffRoleAndWorkplace(
  userRole: string | undefined | null,
  targetRole: string,
): boolean {
  if (!canUpdateStaff(userRole)) return false;
  if (targetRole === "BRANCH_MANAGER" || targetRole === "WAREHOUSE_MANAGER") {
    return false;
  }
  return true;
}

/** PATCH /branches/:id/manager — chỉ TENANT_OWNER. */
export function canAssignBranchManager(userRole?: string | null): boolean {
  return userRole === TENANT_OWNER;
}
