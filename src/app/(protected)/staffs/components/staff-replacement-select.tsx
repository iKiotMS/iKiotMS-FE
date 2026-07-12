"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { staffApi } from "@/lib/api/staff";
import type { Staff, StaffRole } from "@/types/staff";

type StaffReplacementSelectProps = {
  manager: Staff;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function StaffReplacementSelect({
  manager,
  value,
  onChange,
  disabled,
}: StaffReplacementSelectProps) {
  const [candidates, setCandidates] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCandidates() {
      setIsLoading(true);
      try {
        const all = await staffApi.getAllForOptions();
        const filtered = all.filter((staff) => {
          if (staff._id === manager._id) return false;
          if (staff.status !== "ACTIVE") return false;
          if (staff.role !== "STAFF") return false;

          if (manager.role === "BRANCH_MANAGER") {
            return staff.branchId === manager.branchId;
          }

          if (manager.role === "WAREHOUSE_MANAGER") {
            return true;
          }

          return false;
        });

        if (!cancelled) {
          setCandidates(filtered);
        }
      } catch {
        if (!cancelled) setCandidates([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCandidates();
    return () => {
      cancelled = true;
    };
  }, [manager._id, manager.role, manager.branchId]);

  const managerLabel: Record<StaffRole, string> = {
    BRANCH_MANAGER: "quản lý chi nhánh",
    WAREHOUSE_MANAGER: "quản lý kho",
    STAFF: "nhân viên",
  };

  return (
    <div className="space-y-2">
      <Label>Chọn nhân viên thay thế {managerLabel[manager.role]}</Label>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải danh sách...</p>
      ) : candidates.length === 0 ? (
        <p className="text-sm text-destructive rounded-md border border-dashed px-3 py-2">
          Không có nhân viên ACTIVE phù hợp để thay thế. Vui lòng thêm hoặc kích
          hoạt nhân viên trước.
        </p>
      ) : (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="cursor-pointer w-full">
            <SelectValue placeholder="Chọn nhân viên thay thế" />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((staff) => (
              <SelectItem key={staff._id} value={staff._id}>
                {staff.fullName} — {staff.phoneNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <p className="text-xs text-muted-foreground">
        Nhân viên được chọn sẽ được thăng chức lên{" "}
        {managerLabel[manager.role]} trước khi thao tác tiếp tục.
      </p>
    </div>
  );
}
