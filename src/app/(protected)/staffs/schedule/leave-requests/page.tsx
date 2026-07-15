"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canViewLeaveRequests } from "@/components/sidebar/constants/role-permissions";
import { getCachedUser } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { LeaveRequestsButtonGroup } from "./components/leave-requests-button-group";
import { LeaveRequestsDialogs } from "./components/leave-requests-dialogs";
import { LeaveRequestsProvider } from "./components/leave-requests-provider";
import { LeaveRequestsTable } from "./components/leave-requests-table";

function getRoleDescription(role?: string | null): string {
  switch (role) {
    case "TENANT_OWNER":
      return "Duyệt đơn nghỉ của quản lý chi nhánh / kho / nhân viên. Có thể tạo đơn khẩn thay họ.";
    case "BRANCH_MANAGER":
      return "Xin nghỉ phép (Tenant duyệt, cần bàn giao staff nếu có lịch). Duyệt đơn staff; tạo đơn khẩn và duyệt ngay khi staff báo nghỉ.";
    case "WAREHOUSE_MANAGER":
      return "Xin nghỉ phép gửi Tenant duyệt. Nếu có lịch quản lý trong khoảng nghỉ, chọn nhân viên cùng kho nhận bàn giao.";
    case "STAFF":
      return "Tạo và theo dõi đơn nghỉ phép của bạn. Đơn được quản lý chi nhánh duyệt.";
    default:
      return "Tạo, theo dõi và duyệt yêu cầu nghỉ phép theo quyền của bạn.";
  }
}

export default function LeaveRequestsPage() {
  const { user } = useAuth();
  const role = user?.role ?? getCachedUser()?.role;

  if (!canViewLeaveRequests(role)) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <Button asChild variant="ghost" size="sm" className="w-fit px-2">
          <Link href="/staffs/schedule">
            <ArrowLeft className="mr-2 size-4" />
            Quay lại lịch làm
          </Link>
        </Button>
        <p className="text-muted-foreground text-sm">
          Bạn không có quyền truy cập trang đơn nghỉ phép.
        </p>
      </div>
    );
  }

  return (
    <LeaveRequestsProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Button asChild variant="ghost" size="sm" className="w-fit px-2">
              <Link href="/staffs/schedule">
                <ArrowLeft className="mr-2 size-4" />
                Quay lại lịch làm
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <CalendarClock className="size-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">
                Đơn nghỉ phép
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-2xl">
              {getRoleDescription(role)}
            </p>
          </div>
          <LeaveRequestsButtonGroup />
        </div>

        <LeaveRequestsTable />
      </div>
      <LeaveRequestsDialogs />
    </LeaveRequestsProvider>
  );
}
