/** Roles allowed to permanently delete staff (matches BE permissions.json). */
const STAFF_DELETE_ROLES = new Set(["TENANT_OWNER"]);

export function canDeleteStaff(userRole?: string | null): boolean {
  if (!userRole) return false;
  return STAFF_DELETE_ROLES.has(userRole);
}
