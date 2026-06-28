const LEAVE_VIEW_ROLES = new Set([
  "TENANT_OWNER",
  "BRANCH_MANAGER",
  "WAREHOUSE_MANAGER",
]);

const LEAVE_REVIEW_ROLES = new Set(["TENANT_OWNER", "BRANCH_MANAGER"]);

const LEAVE_EMERGENCY_CREATE_ROLES = new Set([
  "TENANT_OWNER",
  "BRANCH_MANAGER",
]);

export function canViewLeaveRequests(userRole?: string | null): boolean {
  if (!userRole) return false;
  return LEAVE_VIEW_ROLES.has(userRole);
}

export function canReviewLeaveRequest(userRole?: string | null): boolean {
  if (!userRole) return false;
  return LEAVE_REVIEW_ROLES.has(userRole);
}

export function canCreateEmergencyLeave(userRole?: string | null): boolean {
  if (!userRole) return false;
  return LEAVE_EMERGENCY_CREATE_ROLES.has(userRole);
}
