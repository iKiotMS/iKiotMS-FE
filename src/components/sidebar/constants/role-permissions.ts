/** Matches BE src/config/permissions.json module access. */
export const rolePermissions = {
  products: {
    view: new Set(["TENANT_OWNER", "BRANCH_MANAGER", "WAREHOUSE_MANAGER", "STAFF", "SUPER_ADMIN"]),
    write: new Set(["TENANT_OWNER", "SUPER_ADMIN"]),
  },
  brands: {
    write: new Set(["TENANT_OWNER", "SUPER_ADMIN"]),
  },
  categories: {
    write: new Set(["TENANT_OWNER", "SUPER_ADMIN"]),
  },
  staff: {
    write: new Set(["TENANT_OWNER", "BRANCH_MANAGER"]),
    delete: new Set(["TENANT_OWNER", "BRANCH_MANAGER"]),
  },
  leaveRequests: {
    view: new Set(["TENANT_OWNER", "BRANCH_MANAGER", "WAREHOUSE_MANAGER"]),
    review: new Set(["TENANT_OWNER", "BRANCH_MANAGER"]),
    emergencyCreate: new Set(["TENANT_OWNER", "BRANCH_MANAGER"]),
  },
};

// Products
export function canViewProducts(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.products.view.has(role);
}
export function canCreateProduct(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.products.write.has(role);
}
export function canUpdateProduct(role?: string | null): boolean {
  return canCreateProduct(role);
}
export function canDeleteProduct(role?: string | null): boolean {
  return canCreateProduct(role);
}

// Brands
export function canViewBrands(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.brands.write.has(role);
}
export function canCreateBrand(role?: string | null): boolean {
  return canViewBrands(role);
}
export function canUpdateBrand(role?: string | null): boolean {
  return canViewBrands(role);
}
export function canDeleteBrand(role?: string | null): boolean {
  return canViewBrands(role);
}

// Categories
export function canViewCategories(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.categories.write.has(role);
}
export function canCreateCategory(role?: string | null): boolean {
  return canViewCategories(role);
}
export function canUpdateCategory(role?: string | null): boolean {
  return canViewCategories(role);
}
export function canDeleteCategory(role?: string | null): boolean {
  return canViewCategories(role);
}

// Staff
export function canManageStaff(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.staff.write.has(role);
}
export function canViewStaff(role?: string | null): boolean {
  return canManageStaff(role);
}
export function canCreateStaff(role?: string | null): boolean {
  return canManageStaff(role);
}
export function canUpdateStaff(role?: string | null): boolean {
  return canManageStaff(role);
}
export function canManageStaffAccount(role?: string | null): boolean {
  return canManageStaff(role);
}
export function canDeleteStaff(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.staff.delete.has(role);
}

/** TENANT_OWNER can filter list by branch; BM is auto-scoped by BE. */
export function canFilterStaffByBranch(role?: string | null): boolean {
  return role === "TENANT_OWNER";
}

/** TENANT_OWNER can filter list by warehouse. */
export function canFilterStaffByWarehouse(role?: string | null): boolean {
  return role === "TENANT_OWNER";
}

/** BM create form: branch locked to their workplace. */
export function shouldLockBranchOnCreate(role?: string | null): boolean {
  return role === "BRANCH_MANAGER";
}

/** Chỉ TO gán nhân viên vào kho; BM chỉ quản lý chi nhánh. */
export function canAssignWarehouseOnStaffForm(role?: string | null): boolean {
  return role === "TENANT_OWNER";
}

/** Manager role/workplace cannot be edited via PATCH /staff — BE blocks. */
export function canEditStaffRoleAndWorkplace(
  role: string | undefined | null,
  targetRole: string,
): boolean {
  if (!canUpdateStaff(role)) return false;
  if (targetRole === "BRANCH_MANAGER" || targetRole === "WAREHOUSE_MANAGER") {
    return false;
  }
  return true;
}

/** PATCH /branches/:id/manager — TENANT_OWNER hoặc BRANCH_MANAGER. */
export function canAssignBranchManager(role?: string | null): boolean {
  return role === "TENANT_OWNER" || role === "BRANCH_MANAGER";
}

/** PATCH /warehouses/:id/manager — chỉ TENANT_OWNER. */
export function canAssignWarehouseManager(role?: string | null): boolean {
  return role === "TENANT_OWNER";
}

/** Thăng STAFF → BM/WM qua form sửa — chỉ TENANT_OWNER. */
export function canPromoteStaffToManager(role?: string | null): boolean {
  return role === "TENANT_OWNER";
}

// Leave requests
export function canViewLeaveRequests(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.leaveRequests.view.has(role);
}
export function canReviewLeaveRequest(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.leaveRequests.review.has(role);
}
export function canCreateEmergencyLeave(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.leaveRequests.emergencyCreate.has(role);
}

