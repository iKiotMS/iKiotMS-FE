/** Aligned with BE permissions.json schedules module. */

const SCHEDULE_CREATE_ROLES = new Set(["TENANT_OWNER", "BRANCH_MANAGER"]);
const SCHEDULE_DELETE_ROLES = new Set(["TENANT_OWNER", "BRANCH_MANAGER"]);
const SCHEDULE_UPDATE_ROLES = new Set(["TENANT_OWNER", "BRANCH_MANAGER"]);
const SCHEDULE_SHIFT_TEMPLATE_ROLES = new Set([
  "TENANT_OWNER",
  "BRANCH_MANAGER",
]);

const SCHEDULE_VIEW_ROLES = new Set([
  "TENANT_OWNER",
  "BRANCH_MANAGER",
  "WAREHOUSE_MANAGER",
  "STAFF",
]);

export type ScheduleListScope = "all" | "branch" | "warehouse" | "own";

export function canViewSchedule(userRole?: string | null): boolean {
  if (!userRole) return false;
  return SCHEDULE_VIEW_ROLES.has(userRole);
}

export function canCreateSchedule(userRole?: string | null): boolean {
  if (!userRole) return false;
  return SCHEDULE_CREATE_ROLES.has(userRole);
}

export function canDeleteSchedule(userRole?: string | null): boolean {
  if (!userRole) return false;
  return SCHEDULE_DELETE_ROLES.has(userRole);
}

export function canUpdateSchedule(userRole?: string | null): boolean {
  if (!userRole) return false;
  return SCHEDULE_UPDATE_ROLES.has(userRole);
}

/** BM không được sửa/xóa ca được gán cho chính mình. */
export function isBranchManagerOwnScheduleAssignee(
  userRole?: string | null,
  sessionUserId?: string | null,
  assigneeUserId?: string | null,
): boolean {
  if (userRole !== "BRANCH_MANAGER") return false;
  if (!sessionUserId || !assigneeUserId) return false;
  return String(sessionUserId) === String(assigneeUserId);
}

export function resolveScheduleAssigneeUserId(
  assigneeUserId?: string | null,
  assignees?: { userId: string }[],
): string | null {
  if (assigneeUserId) return assigneeUserId;
  if (assignees?.length === 1) return assignees[0].userId;
  return null;
}

export function canDeleteScheduleAssignee(
  userRole?: string | null,
  sessionUserId?: string | null,
  assigneeUserId?: string | null,
): boolean {
  if (!canDeleteSchedule(userRole)) return false;
  if (
    isBranchManagerOwnScheduleAssignee(userRole, sessionUserId, assigneeUserId)
  ) {
    return false;
  }
  return true;
}

export function canUpdateScheduleAssignee(
  userRole?: string | null,
  sessionUserId?: string | null,
  assigneeUserId?: string | null,
): boolean {
  if (!canUpdateSchedule(userRole)) return false;
  if (
    isBranchManagerOwnScheduleAssignee(userRole, sessionUserId, assigneeUserId)
  ) {
    return false;
  }
  return true;
}

export function canManageShiftTemplates(userRole?: string | null): boolean {
  if (!userRole) return false;
  return SCHEDULE_SHIFT_TEMPLATE_ROLES.has(userRole);
}

export function canFilterScheduleByStaff(userRole?: string | null): boolean {
  return (
    userRole === "TENANT_OWNER" ||
    userRole === "BRANCH_MANAGER" ||
    userRole === "WAREHOUSE_MANAGER"
  );
}

export function getScheduleListScope(
  userRole?: string | null,
): ScheduleListScope | null {
  switch (userRole) {
    case "TENANT_OWNER":
      return "all";
    case "BRANCH_MANAGER":
      return "branch";
    case "WAREHOUSE_MANAGER":
      return "warehouse";
    case "STAFF":
      return "own";
    default:
      return null;
  }
}

export function getScheduleScopeLabel(userRole?: string | null): string | null {
  switch (userRole) {
    case "TENANT_OWNER":
      return "Toàn bộ tenant";
    case "BRANCH_MANAGER":
      return "Nhân viên trong chi nhánh";
    case "WAREHOUSE_MANAGER":
      return "Nhân viên trong kho";
    case "STAFF":
      return "Ca của tôi";
    default:
      return null;
  }
}
