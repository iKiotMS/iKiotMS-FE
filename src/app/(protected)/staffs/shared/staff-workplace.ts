import type { StaffRole } from "@/types/staff";

/** STAFF: bắt buộc chi nhánh, không gắn kho. */
export function validateStaffWorkplace(
  role: StaffRole,
  branchId?: string,
  warehouseId?: string,
): string | null {
  if (role !== "STAFF") return null;
  if (warehouseId?.trim()) {
    return "Nhân viên bán hàng chỉ được gắn chi nhánh, không gắn kho";
  }
  if (branchId?.trim()) return null;
  return "Nhân viên cần chọn chi nhánh";
}

/** BR: bắt buộc CN, không kho. WH: bắt buộc kho, không CN. */
export function validateManagerWorkplace(
  role: StaffRole,
  branchId?: string,
  warehouseId?: string,
): { message: string; path: "branchId" | "warehouseId" } | null {
  if (role === "BRANCH_MANAGER") {
    if (warehouseId?.trim()) {
      return {
        message: "Quản lý chi nhánh không được gắn kho",
        path: "warehouseId",
      };
    }
    if (!branchId?.trim()) {
      return {
        message: "Quản lý chi nhánh cần chọn chi nhánh",
        path: "branchId",
      };
    }
    return null;
  }
  if (role === "WAREHOUSE_MANAGER") {
    if (branchId?.trim()) {
      return {
        message: "Quản lý kho không được gắn chi nhánh",
        path: "branchId",
      };
    }
    if (!warehouseId?.trim()) {
      return {
        message: "Quản lý kho cần chọn kho",
        path: "warehouseId",
      };
    }
    return null;
  }
  return null;
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
  if (role === "BRANCH_MANAGER" || role === "STAFF") return null;
  return warehouseId || undefined;
}
