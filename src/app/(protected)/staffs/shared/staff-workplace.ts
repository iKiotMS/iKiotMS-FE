import type { StaffRole } from "@/types/staff";

/** STAFF must be assigned to a branch (sales staff — not warehouse). */
export function validateStaffWorkplace(
  role: StaffRole,
  branchId?: string,
  _warehouseId?: string,
): string | null {
  if (role !== "STAFF") return null;
  if (branchId?.trim()) return null;
  return "Nhân viên cần chọn chi nhánh";
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
  // STAFF / BRANCH_MANAGER never attach to a warehouse.
  if (role === "BRANCH_MANAGER" || role === "STAFF") return null;
  return warehouseId || undefined;
}
