"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { StaffSearchSelect } from "@/app/(protected)/staffs/shared/staff-search-select";
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
      <Label>Nhân viên thay thế {managerLabel[manager.role]}</Label>
      <StaffSearchSelect
        staff={candidates}
        value={value}
        onChange={onChange}
        disabled={disabled || isLoading || candidates.length === 0}
        loading={isLoading}
        placeholder="Chọn nhân viên thay thế"
      />
    </div>
  );
}
