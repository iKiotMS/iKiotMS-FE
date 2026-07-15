/** Matches BE src/config/permissions.json module access. */
export const rolePermissions = {
  products: {
    view: new Set(["TENANT_OWNER", "BRANCH_MANAGER", "WAREHOUSE_MANAGER", "STAFF", "SUPER_ADMIN"]),
    write: new Set(["TENANT_OWNER", "WAREHOUSE_MANAGER", "SUPER_ADMIN"]),
  },
  brands: {
    write: new Set(["TENANT_OWNER", "WAREHOUSE_MANAGER", "SUPER_ADMIN"]),
  },
  categories: {
    write: new Set(["TENANT_OWNER", "WAREHOUSE_MANAGER", "SUPER_ADMIN"]),
  },
  staff: {
    write: new Set(["TENANT_OWNER", "BRANCH_MANAGER"]),
    delete: new Set(["TENANT_OWNER", "BRANCH_MANAGER"]),
  },
  leaveRequests: {
    view: new Set([
      "TENANT_OWNER",
      "BRANCH_MANAGER",
      "WAREHOUSE_MANAGER",
      "STAFF",
    ]),
    review: new Set(["TENANT_OWNER", "BRANCH_MANAGER"]),
    emergencyCreate: new Set(["TENANT_OWNER", "BRANCH_MANAGER"]),
    createPersonal: new Set([
      "BRANCH_MANAGER",
      "WAREHOUSE_MANAGER",
      "STAFF",
    ]),
    cancel: new Set(["BRANCH_MANAGER", "WAREHOUSE_MANAGER", "STAFF"]),
  },
  billing: {
    manage: new Set(["TENANT_OWNER"]),
  },
  aiChat: {
    access: new Set(["TENANT_OWNER"]),
  },
  account: {
    editProfile: new Set(["TENANT_OWNER"]),
  },
  exchange: {
    // Blocklist (not allowlist): imports page redirects BRANCH_MANAGER to /exchange/exports.
    importsBlocked: new Set(["BRANCH_MANAGER"]),
  },
  promotions: {
    view: new Set(["TENANT_OWNER", "BRANCH_MANAGER", "STAFF", "SUPER_ADMIN"]),
    write: new Set(["TENANT_OWNER", "SUPER_ADMIN"]),
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

// Leave requests — aligned with BE permissions.json leaveRequests actions
export function canViewLeaveRequests(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.leaveRequests.view.has(role);
}
export function canReviewLeaveRequest(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.leaveRequests.review.has(role);
}

/**
 * Ai được duyệt đơn cụ thể (khớp BE reviewLeaveRequest):
 * - Không tự duyệt đơn của mình
 * - TO: duyệt BR / WH / STAFF
 * - BR: chỉ duyệt STAFF (đơn BR/WH chờ TENANT_OWNER)
 */
export function canReviewLeaveRequestTarget(
  reviewerRole?: string | null,
  options?: {
    requestUserId?: string | null;
    currentUserId?: string | null;
    requesterRole?: string | null;
  },
): boolean {
  if (!canReviewLeaveRequest(reviewerRole)) return false;

  const requestUserId = options?.requestUserId
    ? String(options.requestUserId).trim()
    : "";
  const currentUserId = options?.currentUserId
    ? String(options.currentUserId).trim()
    : "";

  // BR/TO không được tự duyệt đơn của chính mình.
  if (requestUserId && currentUserId && requestUserId === currentUserId) {
    return false;
  }

  if (reviewerRole === "TENANT_OWNER") {
    if (!options?.requesterRole) return true;
    return ["BRANCH_MANAGER", "WAREHOUSE_MANAGER", "STAFF"].includes(
      options.requesterRole,
    );
  }

  if (reviewerRole === "BRANCH_MANAGER") {
    // Chưa biết role người nộp → không hiện nút duyệt (tránh BR tự duyệt đơn mình).
    if (!options?.requesterRole) return false;
    return options.requesterRole === "STAFF";
  }

  return false;
}
export function canCreateEmergencyLeave(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.leaveRequests.emergencyCreate.has(role);
}
/** BR / WH / STAFF: POST /leave-requests (đơn nghỉ của chính mình). */
export function canCreatePersonalLeave(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.leaveRequests.createPersonal.has(role);
}
/** BR / WH / STAFF: POST /leave-requests/:id/cancel. */
export function canCancelOwnLeave(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.leaveRequests.cancel.has(role);
}

// Billing
export function canManageBilling(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.billing.manage.has(role);
}

// AI Chat
export function canUseAIChat(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.aiChat.access.has(role);
}

// Account settings
export function canEditAccountProfile(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.account.editProfile.has(role);
}

// Exchange (stock movement)
export function canAccessImports(role?: string | null): boolean {
  return !rolePermissions.exchange.importsBlocked.has(role ?? "");
}

// Promotions
export function canViewPromotions(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.promotions.view.has(role);
}
export function canCreatePromotion(role?: string | null): boolean {
  if (!role) return false;
  return rolePermissions.promotions.write.has(role);
}
export function canUpdatePromotion(role?: string | null): boolean {
  return canCreatePromotion(role);
}
export function canDeletePromotion(role?: string | null): boolean {
  return canCreatePromotion(role);
}

