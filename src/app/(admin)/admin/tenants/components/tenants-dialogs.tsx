import { TenantsDetailSheet } from "./tenants-detail-sheet";
import { TenantsEditDialog } from "./tenants-edit-dialog";
import { TenantsSuspendDialog } from "./tenants-suspend-dialog";

export function TenantsDialogs() {
  return (
    <>
      <TenantsDetailSheet />
      <TenantsEditDialog />
      <TenantsSuspendDialog />
    </>
  );
}
