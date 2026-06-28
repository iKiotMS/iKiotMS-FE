/** Matches BE permissions.json products module access. */
const PRODUCT_READ_ROLES = new Set([
  'TENANT_OWNER',
  'BRANCH_MANAGER',
  'WAREHOUSE_MANAGER',
  'STAFF',
  'SUPER_ADMIN',
])
const PRODUCT_WRITE_ROLES = new Set(['TENANT_OWNER', 'SUPER_ADMIN'])

export function canViewProducts(role?: string | null): boolean {
  if (!role) return false
  return PRODUCT_READ_ROLES.has(role)
}

export function canCreateProduct(role?: string | null): boolean {
  if (!role) return false
  return PRODUCT_WRITE_ROLES.has(role)
}

export function canUpdateProduct(role?: string | null): boolean {
  return canCreateProduct(role)
}

export function canDeleteProduct(role?: string | null): boolean {
  return canCreateProduct(role)
}
