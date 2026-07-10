import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
import type { MovementStatus } from "@/types/stock-movement";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const MOVEMENT_STATUS_MAP: Record<
  MovementStatus,
  { label: string; variant: BadgeVariant }
> = {
  DRAFT: { label: "Nháp", variant: "secondary" },
  OPENING: { label: "Đang soạn", variant: "warning" },
  CLOSED: { label: "Chờ duyệt xuất", variant: "info" },
  PENDING: { label: "Chờ giao hàng", variant: "warning" },
  IN_TRANSIT: { label: "Đang vận chuyển", variant: "info" },
  RECEIVED: { label: "Đã nhận hàng", variant: "success" },
  CANCELLED: { label: "Đã huỷ", variant: "secondary" },
  COMPLETED: { label: "Hoàn tất", variant: "success" },
};

/** Trạng thái cần xử lý theo loại phiếu */
export function isActionableStatus(
  movementType: string,
  status: MovementStatus,
): boolean {
  if (status === "CANCELLED" || status === "RECEIVED" || status === "COMPLETED") {
    return false;
  }
  if (movementType === "IMPORT") {
    return status === "PENDING" || status === "IN_TRANSIT";
  }
  if (movementType === "EXPORT" || movementType === "RETURN") {
    return ["DRAFT", "OPENING", "CLOSED", "IN_TRANSIT"].includes(status);
  }
  return status === "PENDING";
}
