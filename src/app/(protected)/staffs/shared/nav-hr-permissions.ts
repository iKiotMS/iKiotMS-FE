/** HR submenu visibility — aligned with BE permissions.json. */

const HR_NAV_ROLES = {
  staffList: ["TENANT_OWNER", "BRANCH_MANAGER"],
  schedule: ["TENANT_OWNER", "BRANCH_MANAGER", "WAREHOUSE_MANAGER", "STAFF"],
  leaveRequests: [
    "TENANT_OWNER",
    "BRANCH_MANAGER",
    "WAREHOUSE_MANAGER",
    "STAFF",
  ],
  holidays: ["TENANT_OWNER"],
  payroll: [] as string[], // hidden until page exists
} as const;

export type HrNavItemKey = keyof typeof HR_NAV_ROLES;

export function canAccessHrNavItem(
  item: HrNavItemKey,
  userRole?: string | null,
): boolean {
  if (!userRole) return false;
  const allowed = HR_NAV_ROLES[item] as readonly string[];
  return allowed.includes(userRole);
}

export function filterHrNavItems<
  T extends { title: string; url: string },
>(items: T[], userRole?: string | null): T[] {
  const urlToKey: Record<string, HrNavItemKey> = {
    "/staffs": "staffList",
    "/staffs/schedule": "schedule",
    "/staffs/schedule/leave-requests": "leaveRequests",
    "/staffs/holidays": "holidays",
    "/staffs/payroll": "payroll",
  };

  return items.filter((item) => {
    const key = urlToKey[item.url];
    if (!key) return true;
    return canAccessHrNavItem(key, userRole);
  });
}
