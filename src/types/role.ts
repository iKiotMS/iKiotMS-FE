export type UserRole = "TENANT_OWNER" | "BRANCH_MANAGER" | "WAREHOUSE_MANAGER" | "STAFF";

export const ROLE_MAP: Record<UserRole, string> = {
  TENANT_OWNER: "Chủ cửa hàng",
  BRANCH_MANAGER: "Quản lý chi nhánh",
  WAREHOUSE_MANAGER: "Quản lý kho",
  STAFF: "Nhân viên",
};

export function getUserRoleLabel(role?: string): string {
  if (!role) return "—";
  return ROLE_MAP[role as UserRole] || role;
}
