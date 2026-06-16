"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { VariantProps } from "class-variance-authority";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Tenant, TenantStatus } from "@/types/admin";
import { TenantsRowActions } from "./tenants-row-actions";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const TENANT_STATUS_MAP: Record<
  TenantStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: "Hoạt động", variant: "success" },
  pending: { label: "Chờ duyệt", variant: "warning" },
  suspended: { label: "Tạm khoá", variant: "error" },
};

export const tenantsColumns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "businessName",
    header: "Tên cửa hàng",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.businessName}</p>
        <p className="text-xs text-muted-foreground">{row.original.ownerName}</p>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
  },
  {
    id: "subscription",
    header: "Gói dịch vụ",
    cell: ({ row }) => {
      const sub = row.original.subscription;
      if (!sub) return <span className="text-xs text-muted-foreground">Chưa đăng ký</span>;
      return (
        <div>
          <p className="text-sm font-medium">{sub.tierName}</p>
          <p className="text-xs text-muted-foreground">
            HH: {format(new Date(sub.expiresAt), "dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const s = TENANT_STATUS_MAP[row.original.status];
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) =>
      format(new Date(row.original.createdAt), "dd/MM/yyyy", { locale: vi }),
  },
  {
    id: "actions",
    cell: ({ row }) => <TenantsRowActions tenant={row.original} />,
  },
];
