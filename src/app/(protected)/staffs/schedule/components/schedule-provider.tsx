"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { workingScheduleApi } from "@/lib/api/working-schedule";
import type {
  CreateWorkingSchedulePayload,
  ShiftType,
  UpdateWorkingSchedulePayload,
  WorkingSchedule,
} from "@/types/working-schedule";

type ScheduleDialogType = "add" | "edit" | "delete";

type ScheduleContextType = {
  schedules: WorkingSchedule[];
  isLoading: boolean;
  open: ScheduleDialogType | null;
  setOpen: (value: ScheduleDialogType | null) => void;
  currentRow: WorkingSchedule | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<WorkingSchedule | null>>;
  fetchSchedules: () => Promise<void>;
  handleAdd: (payload: CreateWorkingSchedulePayload) => Promise<void>;
  handleEdit: (
    id: string,
    payload: UpdateWorkingSchedulePayload,
  ) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
};

const ScheduleContext = React.createContext<ScheduleContextType | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [schedules, setSchedules] = useState<WorkingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState<ScheduleDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<WorkingSchedule | null>(null);
  const mockData = useMemo(() => MOCK_SCHEDULES, []);

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await workingScheduleApi.getList({ page: 1, limit: 100 });
      setSchedules(response?.data ?? []);
    } catch {
      setSchedules(mockData);
    } finally {
      setIsLoading(false);
    }
  }, [mockData]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  async function handleAdd(payload: CreateWorkingSchedulePayload) {
    try {
      await workingScheduleApi.create(payload);
      toast.success("Đã thêm lịch làm việc");
      await fetchSchedules();
    } catch {
      const now = new Date().toISOString();
      const shift = SHIFT_MAP[payload.shiftType];
      const staff = STAFF_OPTIONS.find((item) => item.value === payload.userId);
      const branch = BRANCH_OPTIONS.find(
        (item) => item.value === payload.branchId,
      );
      const fallback: WorkingSchedule = {
        _id: Date.now().toString(),
        tenantId: "tenant-1",
        branchId: payload.branchId,
        branchName: branch?.label ?? "Không xác định",
        userId: payload.userId,
        staffName: staff?.label ?? "Nhân viên",
        shiftType: payload.shiftType,
        shiftName: shift.name,
        startTime: shift.start,
        endTime: shift.end,
        date: payload.date,
        note: payload.note,
        status: "ASSIGNED",
        createdAt: now,
        updatedAt: now,
      };
      setSchedules((prev) => [fallback, ...prev]);
      toast.success("Đã thêm lịch làm việc (mock mode)");
    }
  }

  async function handleEdit(id: string, payload: UpdateWorkingSchedulePayload) {
    try {
      await workingScheduleApi.update(id, payload);
      toast.success("Đã cập nhật lịch làm việc");
      await fetchSchedules();
    } catch {
      setSchedules((prev) =>
        prev.map((item) => {
          if (item._id !== id) return item;
          const shiftType = payload.shiftType ?? item.shiftType;
          const shift = SHIFT_MAP[shiftType];
          const staff = payload.userId
            ? STAFF_OPTIONS.find((entry) => entry.value === payload.userId)
            : null;
          const branch = payload.branchId
            ? BRANCH_OPTIONS.find((entry) => entry.value === payload.branchId)
            : null;
          return {
            ...item,
            ...payload,
            shiftType,
            shiftName: shift.name,
            startTime: shift.start,
            endTime: shift.end,
            staffName: staff?.label ?? item.staffName,
            branchName: branch?.label ?? item.branchName,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
      toast.success("Đã cập nhật lịch làm việc (mock mode)");
    }
  }

  async function handleDelete(id: string) {
    try {
      await workingScheduleApi.remove(id);
      toast.success("Đã xóa lịch làm việc");
      await fetchSchedules();
    } catch {
      setSchedules((prev) => prev.filter((item) => item._id !== id));
      toast.success("Đã xóa lịch làm việc (mock mode)");
    }
  }

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        isLoading,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        fetchSchedules,
        handleAdd,
        handleEdit,
        handleDelete,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = React.useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within <ScheduleProvider>");
  return ctx;
}

export const STAFF_OPTIONS = [
  { value: "staff-001", label: "Nguyễn An" },
  { value: "staff-002", label: "Trần Bình" },
  { value: "staff-003", label: "Lê Chi" },
] as const;

export const BRANCH_OPTIONS = [
  { value: "branch-1", label: "Chi nhánh Quận 1" },
  { value: "branch-2", label: "Chi nhánh Quận 3" },
  { value: "branch-3", label: "Chi nhánh Gò Vấp" },
] as const;

const SHIFT_MAP: Record<ShiftType, { name: string; start: string; end: string }> = {
  MORNING: { name: "Ca sáng", start: "08:00", end: "12:00" },
  AFTERNOON: { name: "Ca chiều", start: "13:00", end: "17:00" },
  EVENING: { name: "Ca tối", start: "18:00", end: "22:00" },
};

const MOCK_SCHEDULES: WorkingSchedule[] = [
  {
    _id: "sch-001",
    tenantId: "tenant-1",
    branchId: "branch-1",
    branchName: "Chi nhánh Quận 1",
    userId: "staff-001",
    staffName: "Nguyễn An",
    shiftType: "MORNING",
    shiftName: SHIFT_MAP.MORNING.name,
    startTime: SHIFT_MAP.MORNING.start,
    endTime: SHIFT_MAP.MORNING.end,
    date: new Date().toISOString().split("T")[0],
    note: "Hỗ trợ khu vực quầy thu ngân",
    status: "ASSIGNED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "sch-002",
    tenantId: "tenant-1",
    branchId: "branch-2",
    branchName: "Chi nhánh Quận 3",
    userId: "staff-002",
    staffName: "Trần Bình",
    shiftType: "AFTERNOON",
    shiftName: SHIFT_MAP.AFTERNOON.name,
    startTime: SHIFT_MAP.AFTERNOON.start,
    endTime: SHIFT_MAP.AFTERNOON.end,
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    note: "Kiểm kê kho cuối ca",
    status: "ASSIGNED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
