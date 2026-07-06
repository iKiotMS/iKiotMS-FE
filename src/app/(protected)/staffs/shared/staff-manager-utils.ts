import type { Staff, StaffRole } from "@/types/staff";

const MANAGER_ROLES = new Set<StaffRole>([
  "BRANCH_MANAGER",
  "WAREHOUSE_MANAGER",
]);

export function isManagerRole(role: StaffRole): boolean {
  return MANAGER_ROLES.has(role);
}

/** Khớp BE isActiveBranchManager — role BM và đã gán branchId. */
export function isActiveBranchManager(staff: Staff): boolean {
  return staff.role === "BRANCH_MANAGER" && Boolean(staff.branchId);
}

/** Khớp BE isActiveWarehouseManager — role WM và đã gán warehouseId. */
export function isActiveWarehouseManager(staff: Staff): boolean {
  return staff.role === "WAREHOUSE_MANAGER" && Boolean(staff.warehouseId);
}

/**
 * Delete/deactivate manager cần replacementManagerId (BE promote STAFF trước).
 * Nhân viên STAFF thường không cần.
 */
export function requiresManagerReplacement(staff: Staff): boolean {
  return isActiveBranchManager(staff) || isActiveWarehouseManager(staff);
}

export function canDeactivateStaffRow(
  userRole: string | undefined | null,
  staff: Staff,
  requesterBranchId?: string | null,
): boolean {
  if (!userRole) return false;
  if (isManagerRole(staff.role)) {
    return userRole === "TENANT_OWNER";
  }
  if (userRole === "TENANT_OWNER") return true;
  if (userRole === "BRANCH_MANAGER") {
    if (staff.role !== "STAFF" || !staff.branchId || !requesterBranchId) {
      return false;
    }
    return staff.branchId === requesterBranchId;
  }
  return false;
}

export function canDeleteStaffRow(
  userRole: string | undefined | null,
  staff: Staff,
  requesterBranchId?: string | null,
): boolean {
  if (!userRole) return false;
  if (isManagerRole(staff.role)) {
    return userRole === "TENANT_OWNER";
  }
  if (userRole === "TENANT_OWNER") return true;
  if (userRole === "BRANCH_MANAGER") {
    if (staff.role !== "STAFF" || !staff.branchId || !requesterBranchId) {
      return false;
    }
    return staff.branchId === requesterBranchId;
  }
  return false;
}

export function getManagerRoleLabel(role: StaffRole): string {
  if (role === "BRANCH_MANAGER") return "quản lý chi nhánh";
  if (role === "WAREHOUSE_MANAGER") return "quản lý kho";
  return "quản lý";
}

/** BM/WM chưa gán nơi làm việc — BE không xử lý được delete/deactivate. */
export function isOrphanManagerRecord(staff: Staff): boolean {
  if (staff.role === "BRANCH_MANAGER" && !staff.branchId) return true;
  if (staff.role === "WAREHOUSE_MANAGER" && !staff.warehouseId) return true;
  return false;
}
