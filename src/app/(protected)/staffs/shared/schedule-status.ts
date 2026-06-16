import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
import type { ScheduleStatus, ShiftType } from "@/types/working-schedule";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const SCHEDULE_STATUS_MAP: Record<
  ScheduleStatus,
  { label: string; variant: BadgeVariant }
> = {
  ASSIGNED: { label: "Đã phân ca", variant: "info" },
  COMPLETED: { label: "Hoàn thành", variant: "success" },
  ABSENT: { label: "Vắng mặt", variant: "error" },
  CANCELLED: { label: "Đã hủy", variant: "secondary" },
};

export const SHIFT_TYPE_MAP: Record<
  ShiftType,
  { label: string; variant: BadgeVariant }
> = {
  MORNING: { label: "Ca sáng", variant: "warning" },
  AFTERNOON: { label: "Ca chiều", variant: "info" },
  EVENING: { label: "Ca tối", variant: "secondary" },
};
