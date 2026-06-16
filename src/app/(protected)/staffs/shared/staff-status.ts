import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
import type { StaffRole, StaffStatus } from "@/types/staff";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const STAFF_STATUS_MAP: Record<
  StaffStatus,
  { label: string; variant: BadgeVariant }
> = {
  ACTIVE: { label: "Đang làm việc", variant: "success" },
  INACTIVE: { label: "Ngừng làm việc", variant: "warning" },
  SUSPENDED: { label: "Tạm khóa", variant: "destructive" },
};

export const STAFF_ROLE_MAP: Record<StaffRole, { label: string; variant: BadgeVariant }> =
  {
    BRANCH_MANAGER: { label: "Quản lý chi nhánh", variant: "info" },
    WAREHOUSE_MANAGER: { label: "Quản lý kho", variant: "secondary" },
    STAFF: { label: "Nhân viên bán hàng", variant: "outline" },
  };

export function getStaffStatusDisplay(status: StaffStatus) {
  return (
    STAFF_STATUS_MAP[status] ?? {
      label: status,
      variant: "outline" as BadgeVariant,
    }
  );
}
