import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
import type { LeaveRequestStatus, LeaveRequestType } from "@/types/leave-request";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const LEAVE_STATUS_MAP: Record<
  LeaveRequestStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: "Chờ duyệt", variant: "warning" },
  APPROVED: { label: "Đã duyệt", variant: "success" },
  REJECTED: { label: "Từ chối", variant: "error" },
  CANCELLED: { label: "Đã hủy", variant: "secondary" },
};

export const LEAVE_TYPE_MAP: Record<
  LeaveRequestType,
  { label: string; variant: BadgeVariant }
> = {
  SICK: { label: "Ốm đau", variant: "error" },
  PERSONAL: { label: "Việc cá nhân", variant: "info" },
  ANNUAL: { label: "Nghỉ phép năm", variant: "success" },
  OTHER: { label: "Khác", variant: "secondary" },
};
