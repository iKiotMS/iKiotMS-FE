import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
import type { MovementStatus } from "@/types/stock-movement";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const MOVEMENT_STATUS_MAP: Record<
  MovementStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: "Chờ duyệt", variant: "warning" },
  APPROVED: { label: "Đã duyệt", variant: "success" },
  REJECTED: { label: "Từ chối", variant: "error" },
  COMPLETED: { label: "Hoàn thành", variant: "info" },
  CANCELLED: { label: "Đã huỷ", variant: "secondary" },
};
