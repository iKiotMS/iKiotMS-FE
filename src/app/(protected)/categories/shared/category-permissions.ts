/** Matches BE permissions.json categories module access. */
const CATEGORY_WRITE_ROLES = new Set(['TENANT_OWNER', 'SUPER_ADMIN'])

export function canViewCategories(role?: string | null): boolean {
  if (!role) return false
  return CATEGORY_WRITE_ROLES.has(role)
}

export function canCreateCategory(role?: string | null): boolean {
  return canViewCategories(role)
}

export function canUpdateCategory(role?: string | null): boolean {
  return canViewCategories(role)
}

export function canDeleteCategory(role?: string | null): boolean {
  return canViewCategories(role)
}
