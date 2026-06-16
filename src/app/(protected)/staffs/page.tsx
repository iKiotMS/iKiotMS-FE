"use client";

import { StaffsButtonGroup } from "./components/staffs-button-group";
import { StaffsDialogs } from "./components/staffs-dialogs";
import { StaffsProvider } from "./components/staffs-provider";
import { StaffsTable } from "./components/staffs-table";

export default function StaffsPage() {
  return (
    <StaffsProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
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
      </div>
      <StaffsDialogs />
    </StaffsProvider>
  );
}
