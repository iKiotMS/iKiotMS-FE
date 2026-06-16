"use client";

import { Building2 } from "lucide-react";
import { TenantsProvider } from "./components/tenants-provider";
import { TenantsTable } from "./components/tenants-table";
import { TenantsDialogs } from "./components/tenants-dialogs";

export default function TenantsPage() {
  return (
    <TenantsProvider>
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Quản lý Tenant</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem, chỉnh sửa và quản lý trạng thái các tài khoản Tenant trong hệ thống
          </p>
        </div>

        <TenantsTable />
        <TenantsDialogs />
      </div>
    </TenantsProvider>
  );
}
