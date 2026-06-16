"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { staffApi } from "@/lib/api/staff";
import type {
  CreateStaffPayload,
  Staff,
  StaffRole,
  StaffStatus,
  UpdateStaffPayload,
} from "@/types/staff";

type StaffsDialogType = "add" | "edit" | "delete";

type StaffsContextType = {
  staffs: Staff[];
  isLoading: boolean;
  open: StaffsDialogType | null;
  setOpen: (value: StaffsDialogType | null) => void;
  currentRow: Staff | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Staff | null>>;
  fetchStaffs: () => Promise<void>;
  handleAdd: (payload: CreateStaffPayload) => Promise<void>;
  handleEdit: (id: string, payload: UpdateStaffPayload) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
};

const StaffsContext = React.createContext<StaffsContextType | null>(null);

export function StaffsProvider({ children }: { children: React.ReactNode }) {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState<StaffsDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<Staff | null>(null);

  const mockData = useMemo(() => MOCK_STAFFS, []);

  const fetchStaffs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await staffApi.getList({ page: 1, limit: 50 });
      setStaffs(response?.data ?? []);
    } catch {
      setStaffs(mockData);
    } finally {
      setIsLoading(false);
    }
  }, [mockData]);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  async function handleAdd(payload: CreateStaffPayload) {
    try {
      await staffApi.create(payload);
      toast.success("Đã thêm nhân viên");
      await fetchStaffs();
    } catch {
      const branchName = BRANCH_MAP[payload.branchId] ?? "Không xác định";
      const fullName = `${payload.lastName} ${payload.firstName}`.trim();
      const now = new Date().toISOString();
      const fallbackStaff: Staff = {
        _id: Date.now().toString(),
        tenantId: "tenant-1",
        branchId: payload.branchId,
        branchName,
        firstName: payload.firstName,
        lastName: payload.lastName,
        fullName,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        role: payload.role,
        status: payload.status ?? "ACTIVE",
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      setStaffs((prev) => [fallbackStaff, ...prev]);
      toast.success("Đã thêm nhân viên (mock mode)");
    }
  }

  async function handleEdit(id: string, payload: UpdateStaffPayload) {
    try {
      await staffApi.update(id, payload);
      toast.success("Đã cập nhật nhân viên");
      await fetchStaffs();
    } catch {
      setStaffs((prev) =>
        prev.map((staff) => {
          if (staff._id !== id) return staff;
          const firstName = payload.firstName ?? staff.firstName;
          const lastName = payload.lastName ?? staff.lastName;
          const branchId = payload.branchId ?? staff.branchId;
          return {
            ...staff,
            ...payload,
            firstName,
            lastName,
            branchId,
            branchName: BRANCH_MAP[branchId] ?? staff.branchName,
            fullName: `${lastName} ${firstName}`.trim(),
            updatedAt: new Date().toISOString(),
          };
        }),
      );
      toast.success("Đã cập nhật nhân viên (mock mode)");
    }
  }

  async function handleDelete(id: string) {
    try {
      await staffApi.remove(id);
      toast.success("Đã xóa nhân viên");
      await fetchStaffs();
    } catch {
      setStaffs((prev) => prev.filter((staff) => staff._id !== id));
      toast.success("Đã xóa nhân viên (mock mode)");
    }
  }

  return (
    <StaffsContext.Provider
      value={{
        staffs,
        isLoading,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        fetchStaffs,
        handleAdd,
        handleEdit,
        handleDelete,
      }}
    >
      {children}
    </StaffsContext.Provider>
  );
}

export function useStaffs() {
  const ctx = React.useContext(StaffsContext);
  if (!ctx) throw new Error("useStaffs must be used within <StaffsProvider>");
  return ctx;
}

const BRANCH_MAP: Record<string, string> = {
  "branch-1": "Chi nhánh Quận 1",
  "branch-2": "Chi nhánh Quận 3",
  "branch-3": "Chi nhánh Gò Vấp",
};

const MOCK_STAFFS: Staff[] = [
  createMockStaff(
    "staff-001",
    "Nguyễn",
    "An",
    "0901234567",
    "an.nguyen@ikiot.vn",
    "SALE_STAFF",
    "ACTIVE",
    "branch-1",
    "2025-10-10T08:00:00Z",
  ),
  createMockStaff(
    "staff-002",
    "Trần",
    "Bình",
    "0902345678",
    "binh.tran@ikiot.vn",
    "WAREHOUSE_MANAGER",
    "ACTIVE",
    "branch-2",
    "2025-07-20T08:00:00Z",
  ),
  createMockStaff(
    "staff-003",
    "Lê",
    "Chi",
    "0903456789",
    "chi.le@ikiot.vn",
    "BRANCH_MANAGER",
    "INACTIVE",
    "branch-3",
    "2024-12-01T08:00:00Z",
  ),
];

function createMockStaff(
  id: string,
  lastName: string,
  firstName: string,
  phoneNumber: string,
  email: string,
  role: StaffRole,
  status: StaffStatus,
  branchId: string,
  joinedAt: string,
): Staff {
  return {
    _id: id,
    tenantId: "tenant-1",
    branchId,
    branchName: BRANCH_MAP[branchId] ?? "Không xác định",
    firstName,
    lastName,
    fullName: `${lastName} ${firstName}`.trim(),
    phoneNumber,
    email,
    role,
    status,
    joinedAt,
    createdAt: joinedAt,
    updatedAt: joinedAt,
  };
}
