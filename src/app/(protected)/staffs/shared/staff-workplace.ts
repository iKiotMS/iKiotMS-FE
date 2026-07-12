import type { StaffRole } from "@/types/staff";

/** STAFF must have branch or warehouse — matches BE validateSingleWorkplaceAssignment. */
export function validateStaffWorkplace(
  role: StaffRole,
  branchId?: string,
  warehouseId?: string,
): string | null {
  if (role !== "STAFF") return null;
  if (branchId?.trim() || warehouseId?.trim()) return null;
  return "Nhân viên cần chọn chi nhánh hoặc kho hàng";
}

export function resolveBranchIdForRole(
  role: StaffRole,
  branchId?: string,
): string | null | undefined {
  if (role === "WAREHOUSE_MANAGER") return null;
  return branchId || undefined;
}

export function resolveWarehouseIdForRole(
  role: StaffRole,
  warehouseId?: string,
): string | null | undefined {
  if (role === "BRANCH_MANAGER") return null;
  return warehouseId || undefined;
}
