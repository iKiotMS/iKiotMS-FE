"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { TENANT_STATUS_MAP } from "./tenants-columns";
import { useTenantsContext } from "./tenants-provider";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function TenantsDetailSheet() {
  const { open, setOpen, currentRow } = useTenantsContext();
  const tenant = currentRow;

  if (!tenant) return null;

  const s = TENANT_STATUS_MAP[tenant.status];

  return (
    <Sheet open={open === "detail"} onOpenChange={() => setOpen(null)}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chi tiết Tenant</SheetTitle>
          <SheetDescription>{tenant.businessName}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-col">
          <Row label="Tên cửa hàng" value={tenant.businessName} />
          <Row label="Chủ sở hữu" value={tenant.ownerName} />
          <Row label="Email" value={tenant.email} />
          <Row label="Số điện thoại" value={tenant.phone} />
          <Row
            label="Trạng thái"
            value={<Badge variant={s.variant}>{s.label}</Badge>}
          />
          <Row
            label="Gói dịch vụ"
            value={
              tenant.subscription ? (
                <span>
                  {tenant.subscription.tierName} — HH:{" "}
                  {format(new Date(tenant.subscription.expiresAt), "dd/MM/yyyy", { locale: vi })}
                </span>
              ) : (
                "Chưa đăng ký"
              )
            }
          />
          <Row
            label="Ngày tạo"
            value={format(new Date(tenant.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
          />
          <Row
            label="Cập nhật lần cuối"
            value={format(new Date(tenant.updatedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
