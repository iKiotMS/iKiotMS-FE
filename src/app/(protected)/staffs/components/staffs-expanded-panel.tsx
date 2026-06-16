"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Building2,
  CalendarDays,
  KeyRound,
  Lock,
  Mail,
  Pencil,
  Phone,
  Trash2,
  User,
  UserCheck,
  Warehouse,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  STAFF_ROLE_MAP,
  getStaffStatusDisplay,
} from "@/app/(protected)/staffs/shared/staff-status";
import type { Staff } from "@/types/staff";
import { useStaffs } from "./staffs-provider";

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function StaffsExpandedPanel({
  staff,
  isExpanded,
}: {
  staff: Staff;
  isExpanded: boolean;
}) {
  const { setOpen, setCurrentRow } = useStaffs();

  if (!isExpanded) return null;

  const status = getStaffStatusDisplay(staff.status);
  const role = STAFF_ROLE_MAP[staff.role];
  const canActivate = staff.status !== "ACTIVE";
  const canDeactivate = staff.status === "ACTIVE";
  const canChangePassword = staff.status === "ACTIVE";

  return (
    <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={status.variant}>{status.label}</Badge>
        <Badge variant={role.variant}>{role.label}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mb-4">
        <InfoItem
          icon={<User className="size-4" />}
          label="Họ và tên"
          value={staff.fullName}
        />
        <InfoItem
          icon={<Phone className="size-4" />}
          label="Số điện thoại"
          value={staff.phoneNumber}
        />
        <InfoItem
          icon={<Mail className="size-4" />}
          label="Email"
          value={staff.email || "Chưa có email"}
        />
        <InfoItem
          icon={<Building2 className="size-4" />}
          label="Chi nhánh"
          value={staff.branchName}
        />
        {staff.warehouseId && (
          <InfoItem
            icon={<Warehouse className="size-4" />}
            label="Kho"
            value={
              staff.warehouseName && staff.warehouseName !== "—"
                ? staff.warehouseName
                : "Kho hàng"
            }
          />
        )}
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Ngày vào làm"
          value={format(new Date(staff.joinedAt), "dd/MM/yyyy", { locale: vi })}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Ngày tạo"
          value={format(new Date(staff.createdAt), "dd/MM/yyyy HH:mm", {
            locale: vi,
          })}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Cập nhật lần cuối"
          value={format(new Date(staff.updatedAt), "dd/MM/yyyy HH:mm", {
            locale: vi,
          })}
        />
        <InfoItem
          icon={<User className="size-4" />}
          label="Mã nhân viên"
          value={`#${staff._id.slice(-6).toUpperCase()}`}
        />
      </div>

      <Separator className="mt-4" />
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        <Button
          variant="destructive"
          size="sm"
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentRow(staff);
            setOpen("delete");
          }}
        >
          <Trash2 className="mr-2 size-4" />
          Xóa nhân viên
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {canActivate && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentRow(staff);
                setOpen("activate");
              }}
            >
              <UserCheck className="mr-2 size-4" />
              Kích hoạt tài khoản
            </Button>
          )}
          {canDeactivate && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentRow(staff);
                setOpen("deactivate");
              }}
            >
              <Lock className="mr-2 size-4" />
              Khóa tài khoản
            </Button>
          )}
          {canChangePassword && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentRow(staff);
                setOpen("password");
              }}
            >
              <KeyRound className="mr-2 size-4" />
              Đổi mật khẩu
            </Button>
          )}
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentRow(staff);
              setOpen("edit");
            }}
          >
            <Pencil className="mr-2 size-4" />
            Chỉnh sửa
          </Button>
        </div>
      </div>
    </div>
  );
}
