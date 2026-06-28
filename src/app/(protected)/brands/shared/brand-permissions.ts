/** Matches BE permissions.json brands module access. */
const BRAND_WRITE_ROLES = new Set(['TENANT_OWNER', 'SUPER_ADMIN'])

export function canViewBrands(role?: string | null): boolean {
  if (!role) return false
  return BRAND_WRITE_ROLES.has(role)
}

export function canCreateBrand(role?: string | null): boolean {
  return canViewBrands(role)
}

export function canUpdateBrand(role?: string | null): boolean {
  return canViewBrands(role)
}

export function canDeleteBrand(role?: string | null): boolean {
  return canViewBrands(role)
}
