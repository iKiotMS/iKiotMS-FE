"use client";

import {
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  User,
  UserCheck,
  UserCog,
  Warehouse,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  formatStaffDate,
  formatStaffDateTime,
  getStaffInitials,
} from "@/app/(protected)/staffs/shared/staff-format";
import {
  STAFF_ROLE_MAP,
  getStaffStatusDisplay,
} from "@/app/(protected)/staffs/shared/staff-status";
import { getSessionBranchId, getSessionRole } from "@/lib/auth";
import {
  canAssignBranchManager,
  canAssignWarehouseManager,
  canDeleteStaff,
  canManageStaffAccount,
  canUpdateStaff,
} from "@/app/(protected)/staffs/shared/staff-permissions";
import {
  canDeactivateStaffRow,
  canDeleteStaffRow,
  requiresManagerReplacement,
} from "@/app/(protected)/staffs/shared/staff-manager-utils";
import {
  getStaffGenderLabel,
} from "@/lib/api/staff-mapper";
import { formatIdentificationId } from "@/app/(protected)/staffs/shared/identification-format";
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
  const { setOpen, setCurrentRow, openAssignBranchManager, openAssignWarehouseManager } =
    useStaffs();
  const userRole = getSessionRole();
  const requesterBranchId = getSessionBranchId();
  const showDelete =
    canDeleteStaff(userRole) &&
    canDeleteStaffRow(userRole, staff, requesterBranchId);
  const showEdit = canUpdateStaff(userRole);
  const showAccountActions = canManageStaffAccount(userRole);
  const showAssignBranchManager =
    canAssignBranchManager(userRole) &&
    staff.role === "BRANCH_MANAGER" &&
    Boolean(staff.branchId) &&
    (userRole === "TENANT_OWNER" ||
      staff.branchId === requesterBranchId);
  const showAssignWarehouseManager =
    canAssignWarehouseManager(userRole) &&
    staff.role === "WAREHOUSE_MANAGER" &&
    Boolean(staff.warehouseId);

  if (!isExpanded) return null;

  const status = getStaffStatusDisplay(staff.status);
  const role = STAFF_ROLE_MAP[staff.role] ?? {
    label: staff.role,
    variant: "outline" as const,
  };
  const canActivate = showAccountActions && staff.status !== "ACTIVE";
  const canDeactivate =
    showAccountActions &&
    staff.status === "ACTIVE" &&
    canDeactivateStaffRow(userRole, staff, requesterBranchId);
  const canChangePassword =
    showAccountActions && staff.status === "ACTIVE";

  return (
    <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={status.variant}>{status.label}</Badge>
        <Badge variant={role.variant}>{role.label}</Badge>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Avatar className="size-14">
          {staff.profile?.avatarUrl ? (
            <AvatarImage src={staff.profile.avatarUrl} alt={staff.fullName} />
          ) : null}
          <AvatarFallback>{getStaffInitials(staff.fullName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs text-muted-foreground">Ảnh đại diện</p>
          <p className="text-sm font-medium">{staff.fullName}</p>
        </div>
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
          value={formatStaffDate(staff.joinedAt)}
        />
        {staff.leaveBalance && (
          <InfoItem
            icon={<CalendarDays className="size-4" />}
            label="Phép năm"
            value={`${staff.leaveBalance.remainingDays}/${staff.leaveBalance.annualLeaveDays} ngày`}
          />
        )}
        {staff.profile?.identificationId && (
          <InfoItem
            icon={<CreditCard className="size-4" />}
            label="CCCD"
            value={formatIdentificationId(staff.profile.identificationId)}
          />
        )}
        {staff.profile?.gender && (
          <InfoItem
            icon={<User className="size-4" />}
            label="Giới tính"
            value={getStaffGenderLabel(staff.profile.gender)}
          />
        )}
        {staff.profile?.dob && (
          <InfoItem
            icon={<CalendarDays className="size-4" />}
            label="Ngày sinh"
            value={formatStaffDate(staff.profile.dob)}
          />
        )}
        {staff.profile?.address && (
          <InfoItem
            icon={<MapPin className="size-4" />}
            label="Địa chỉ"
            value={staff.profile.address}
          />
        )}
        {staff.profile?.taxNumber && (
          <InfoItem
            icon={<CreditCard className="size-4" />}
            label="Mã số thuế"
            value={staff.profile.taxNumber}
          />
        )}
        {staff.accountNote && (
          <InfoItem
            icon={<FileText className="size-4" />}
            label="Ghi chú tài khoản"
            value={staff.accountNote}
          />
        )}
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Ngày tạo"
          value={formatStaffDateTime(staff.createdAt)}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Cập nhật lần cuối"
          value={formatStaffDateTime(staff.updatedAt)}
        />
        <InfoItem
          icon={<User className="size-4" />}
          label="Mã nhân viên"
          value={`#${staff._id.slice(-6).toUpperCase()}`}
        />
      </div>

      <Separator className="mt-4" />
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        {showDelete ? (
          <div className="space-y-1">
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
            {requiresManagerReplacement(staff) && (
              <p className="text-xs text-muted-foreground max-w-xs">
                Quản lý cần chọn nhân viên thay thế trước khi xóa.
              </p>
            )}
          </div>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center gap-2">
          {showAssignBranchManager && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openAssignBranchManager(staff.branchId, staff.branchName);
              }}
            >
              <UserCog className="mr-2 size-4" />
              {userRole === "BRANCH_MANAGER"
                ? "Chuyển nhượng chi nhánh"
                : "Thay quản lý chi nhánh"}
            </Button>
          )}
          {showAssignWarehouseManager && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openAssignWarehouseManager(
                  staff.warehouseId,
                  staff.warehouseName,
                );
              }}
            >
              <Warehouse className="mr-2 size-4" />
              Thay quản lý kho
            </Button>
          )}
          {showAccountActions && canActivate && (
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
          {showAccountActions && canDeactivate && (
            <div className="space-y-1">
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
              {requiresManagerReplacement(staff) && (
                <p className="text-xs text-muted-foreground max-w-xs">
                  Quản lý cần chọn nhân viên thay thế trước khi khóa.
                </p>
              )}
            </div>
          )}
          {showAccountActions && canChangePassword && (
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
          {showEdit && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentRow(staff);
                setOpen("leaveBalance");
              }}
            >
              <CalendarDays className="mr-2 size-4" />
              {staff.leaveBalance ? "Sửa ngày phép" : "Tạo ngày phép"}
            </Button>
          )}
          {showEdit && (
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
          )}
        </div>
      </div>
    </div>
  );
}
