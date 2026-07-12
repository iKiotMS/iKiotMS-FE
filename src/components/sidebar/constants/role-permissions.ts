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
    delete: new Set(["TENANT_OWNER"]),
  },
  leaveRequests: {
    view: new Set(["TENANT_OWNER", "BRANCH_MANAGER", "WAREHOUSE_MANAGER"]),
    review: new Set(["TENANT_OWNER", "BRANCH_MANAGER"]),
    emergencyCreate: new Set(["TENANT_OWNER", "BRANCH_MANAGER"]),
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

