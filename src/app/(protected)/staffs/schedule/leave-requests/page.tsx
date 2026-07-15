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

import { PageHeader } from "@/components/page-header";

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
      <div className="flex flex-col gap-6 px-4 lg:px-6">
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
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <PageHeader
          breadcrumbs={[
            { label: "Trang chủ", href: "/dashboard" },
            { label: "Nhân viên", href: "/staffs" },
            { label: "Nghỉ phép" },
          ]}
          title="Đơn nghỉ phép"
          description={getRoleDescription(role)}
          actions={<LeaveRequestsButtonGroup />}
        />

        <LeaveRequestsTable />
      </div>
      <LeaveRequestsDialogs />
    </LeaveRequestsProvider>
  );
}
