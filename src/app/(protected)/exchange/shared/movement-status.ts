import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
import type { MovementStatus } from "@/types/stock-movement";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const MOVEMENT_STATUS_MAP: Record<
  MovementStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: "Chờ duyệt", variant: "warning" },
  IN_TRANSIT: { label: "Đang vận chuyển", variant: "info" },
  RECEIVED: { label: "Đã nhận hàng", variant: "success" },
  CANCELLED: { label: "Đã huỷ", variant: "secondary" },
};
