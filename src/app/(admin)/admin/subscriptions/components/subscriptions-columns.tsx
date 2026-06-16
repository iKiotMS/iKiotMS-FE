"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { VariantProps } from "class-variance-authority";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { SubscriptionRequest, SubscriptionRequestStatus } from "@/types/admin";
import { SubscriptionsRowActions } from "./subscriptions-row-actions";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const SUBSCRIPTION_STATUS_MAP: Record<
  SubscriptionRequestStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Chờ duyệt", variant: "warning" },
  approved: { label: "Đã duyệt", variant: "success" },
  denied: { label: "Từ chối", variant: "error" },
};

export const subscriptionsColumns: ColumnDef<SubscriptionRequest>[] = [
  {
    accessorKey: "tenantName",
    header: "Tên Tenant",
  },
  {
    accessorKey: "tierName",
    header: "Gói đăng ký",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.tierName}</Badge>
    ),
  },
  {
    accessorKey: "requestedAt",
    header: "Ngày yêu cầu",
    cell: ({ row }) =>
      format(new Date(row.original.requestedAt), "dd/MM/yyyy HH:mm", { locale: vi }),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const s = SUBSCRIPTION_STATUS_MAP[row.original.status];
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
  {
    id: "reviewedAt",
    header: "Ngày xử lý",
    cell: ({ row }) =>
      row.original.reviewedAt
        ? format(new Date(row.original.reviewedAt), "dd/MM/yyyy", { locale: vi })
        : <span className="text-muted-foreground">—</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => <SubscriptionsRowActions request={row.original} />,
  },
];
