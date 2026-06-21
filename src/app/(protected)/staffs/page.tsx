"use client";

import { getCachedUser } from "@/lib/auth";
import { canViewStaff } from "@/app/(protected)/staffs/shared/staff-permissions";
import { StaffsButtonGroup } from "./components/staffs-button-group";
import { StaffsDialogs } from "./components/staffs-dialogs";
import { StaffsProvider } from "./components/staffs-provider";
import { StaffsTable } from "./components/staffs-table";

function StaffsPageContent() {
  const canView = canViewStaff(getCachedUser()?.role);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center">
        <h2 className="text-lg font-semibold">Không có quyền truy cập</h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Tài khoản của bạn không có quyền xem module nhân viên. Vui lòng liên hệ
          quản trị viên nếu bạn cần truy cập.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nhân viên</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý danh sách nhân viên, vai trò và trạng thái làm việc
          </p>
        </div>
        <StaffsButtonGroup />
      </div>
      <StaffsTable />
    </>
  );
}

export default function StaffsPage() {
  return (
    <StaffsProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <StaffsPageContent />
      </div>
      <StaffsDialogs />
    </StaffsProvider>
  );
}
