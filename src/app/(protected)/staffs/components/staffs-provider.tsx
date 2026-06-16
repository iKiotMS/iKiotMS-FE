"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { staffApi } from "@/lib/api/staff";
import {
  extractBranchOptions,
  getApiErrorMessage,
  getStaffRoleLabel,
} from "@/lib/api/staff-mapper";
import type {
  CreateStaffPayload,
  Staff,
  StaffRoleOption,
  UpdateStaffPayload,
} from "@/types/staff";

type StaffsDialogType = "add" | "edit" | "delete";

type StaffsContextType = {
  staffs: Staff[];
  isLoading: boolean;
  roleOptions: StaffRoleOption[];
  branchOptions: { value: string; label: string }[];
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

const DEFAULT_ROLE_OPTIONS: StaffRoleOption[] = [
  { value: "STAFF", label: "Nhân viên bán hàng" },
  { value: "WAREHOUSE_MANAGER", label: "Quản lý kho" },
  { value: "BRANCH_MANAGER", label: "Quản lý chi nhánh" },
];

export function StaffsProvider({ children }: { children: React.ReactNode }) {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roleOptions, setRoleOptions] = useState<StaffRoleOption[]>(
    DEFAULT_ROLE_OPTIONS,
  );
  const [branchOptions, setBranchOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [open, setOpen] = useState<StaffsDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<Staff | null>(null);

  const fetchStaffs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await staffApi.getList({ page: 1, recordPerPage: 50 });
      setStaffs(response.data);
      setBranchOptions(extractBranchOptions(response.data));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setStaffs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const roles = await staffApi.getRoles();
      if (roles.length > 0) {
        setRoleOptions(
          roles.map((role) => ({
            value: role.value,
            label: getStaffRoleLabel(role.value),
          })),
        );
      }
    } catch {
      setRoleOptions(DEFAULT_ROLE_OPTIONS);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
    fetchRoles();
  }, [fetchStaffs, fetchRoles]);

  async function handleAdd(payload: CreateStaffPayload) {
    try {
      const created = await staffApi.create(payload);

      if (payload.newPassword && payload.reEnterPassword) {
        await staffApi.createAccount(created._id, {
          newPassword: payload.newPassword,
          reEnterPassword: payload.reEnterPassword,
        });
      }

      toast.success("Đã thêm nhân viên");
      await fetchStaffs();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleEdit(id: string, payload: UpdateStaffPayload) {
    try {
      await staffApi.update(id, payload);
      toast.success("Đã cập nhật nhân viên");
      await fetchStaffs();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleDelete(id: string) {
    try {
      await staffApi.remove(id);
      toast.success("Đã xóa nhân viên");
      await fetchStaffs();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  return (
    <StaffsContext.Provider
      value={{
        staffs,
        isLoading,
        roleOptions,
        branchOptions,
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
