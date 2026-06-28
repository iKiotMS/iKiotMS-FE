/** Matches BE permissions.json staff module access. */
const STAFF_WRITE_ROLES = new Set(["TENANT_OWNER", "BRANCH_MANAGER"]);
const STAFF_DELETE_ROLES = new Set(["TENANT_OWNER"]);

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
