"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { staffApi } from "@/lib/api/staff";
import {
  extractBranchOptions,
  extractWarehouseOptions,
  getApiErrorMessage,
  getStaffRoleLabel,
} from "@/lib/api/staff-mapper";
import type {
  CreateStaffAccountPayload,
  CreateStaffPayload,
  Staff,
  StaffListQuery,
  StaffRole,
  StaffRoleOption,
  StaffStatus,
  UpdateStaffPayload,
} from "@/types/staff";

type StaffsDialogType =
  | "add"
  | "edit"
  | "delete"
  | "deactivate"
  | "activate"
  | "password";

const DEFAULT_LIST_QUERY: StaffListQuery = {
  page: 1,
  recordPerPage: 10,
  keyword: "",
  role: "all",
  status: "all",
  branchId: "all",
  warehouseId: "all",
};

type StaffsContextType = {
  staffs: Staff[];
  isInitialLoading: boolean;
  isFetching: boolean;
  total: number;
  totalPages: number;
  listQuery: StaffListQuery;
  keywordInput: string;
  setKeywordInput: (value: string) => void;
  setListQuery: React.Dispatch<React.SetStateAction<StaffListQuery>>;
  roleOptions: StaffRoleOption[];
  branchOptions: { value: string; label: string }[];
  warehouseOptions: { value: string; label: string }[];
  open: StaffsDialogType | null;
  setOpen: (value: StaffsDialogType | null) => void;
  currentRow: Staff | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Staff | null>>;
  fetchStaffs: () => Promise<void>;
  handleAdd: (payload: CreateStaffPayload) => Promise<void>;
  handleEdit: (id: string, payload: UpdateStaffPayload) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleDeactivate: (id: string) => Promise<void>;
  handleActivate: (id: string, payload: CreateStaffAccountPayload) => Promise<void>;
  handleUpdatePassword: (
    id: string,
    payload: CreateStaffAccountPayload,
  ) => Promise<void>;
  updateRoleFilter: (role: StaffRole | "all") => void;
  updateStatusFilter: (status: StaffStatus | "all") => void;
  updateBranchFilter: (branchId: string) => void;
  updateWarehouseFilter: (warehouseId: string) => void;
  updatePage: (page: number) => void;
  updatePageSize: (recordPerPage: number) => void;
};

const StaffsContext = React.createContext<StaffsContextType | null>(null);

const DEFAULT_ROLE_OPTIONS: StaffRoleOption[] = [
  { value: "STAFF", label: "Nhân viên bán hàng" },
  { value: "WAREHOUSE_MANAGER", label: "Quản lý kho" },
  { value: "BRANCH_MANAGER", label: "Quản lý chi nhánh" },
];

export function StaffsProvider({ children }: { children: React.ReactNode }) {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [listQuery, setListQuery] = useState<StaffListQuery>(DEFAULT_LIST_QUERY);
  const [keywordInput, setKeywordInput] = useState("");
  const [roleOptions, setRoleOptions] = useState<StaffRoleOption[]>(
    DEFAULT_ROLE_OPTIONS,
  );
  const [branchOptions, setBranchOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [warehouseOptions, setWarehouseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [open, setOpen] = useState<StaffsDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<Staff | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setListQuery((prev) => {
        if (prev.keyword === keywordInput) return prev;
        return { ...prev, keyword: keywordInput, page: 1 };
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [keywordInput]);

  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const allStaff = await staffApi.getAllForOptions();
        setBranchOptions(extractBranchOptions(allStaff));
        setWarehouseOptions(extractWarehouseOptions(allStaff));
      } catch {
        // Filter options are optional; list fetch handles errors.
      }
    }

    loadFilterOptions();
  }, []);

  const refreshBranchWarehouseOptions = useCallback(async () => {
    try {
      const allStaff = await staffApi.getAllForOptions();
      setBranchOptions(extractBranchOptions(allStaff));
      setWarehouseOptions(extractWarehouseOptions(allStaff));
    } catch {
      // Keep existing options on failure.
    }
  }, []);

  const fetchStaffs = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await staffApi.getList({
        page: listQuery.page,
        recordPerPage: listQuery.recordPerPage,
        keyword: listQuery.keyword || undefined,
        role: listQuery.role === "all" ? undefined : listQuery.role,
        status: listQuery.status === "all" ? undefined : listQuery.status,
        branchId: listQuery.branchId === "all" ? undefined : listQuery.branchId,
        warehouseId:
          listQuery.warehouseId === "all" ? undefined : listQuery.warehouseId,
      });
      setStaffs(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setStaffs([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsFetching(false);
      setIsInitialLoading(false);
    }
  }, [listQuery]);

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
  }, [fetchStaffs]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  function updateRoleFilter(role: StaffRole | "all") {
    setListQuery((prev) => ({ ...prev, role, page: 1 }));
  }

  function updateStatusFilter(status: StaffStatus | "all") {
    setListQuery((prev) => ({ ...prev, status, page: 1 }));
  }

  function updateBranchFilter(branchId: string) {
    setListQuery((prev) => ({ ...prev, branchId, page: 1 }));
  }

  function updateWarehouseFilter(warehouseId: string) {
    setListQuery((prev) => ({ ...prev, warehouseId, page: 1 }));
  }

  function updatePage(page: number) {
    setListQuery((prev) => ({ ...prev, page }));
  }

  function updatePageSize(recordPerPage: number) {
    setListQuery((prev) => ({ ...prev, recordPerPage, page: 1 }));
  }

  async function handleAdd(payload: CreateStaffPayload) {
    try {
      const created = await staffApi.create(payload);

      if (payload.newPassword && payload.reEnterPassword) {
        try {
          await staffApi.createAccount(created._id, {
            newPassword: payload.newPassword,
            reEnterPassword: payload.reEnterPassword,
          });
          toast.success("Đã thêm nhân viên");
        } catch {
          toast.warning(
            "Đã tạo nhân viên nhưng chưa kích hoạt tài khoản. Bạn có thể kích hoạt sau.",
          );
        }
      } else {
        toast.success("Đã thêm nhân viên");
      }

      await fetchStaffs();
      await refreshBranchWarehouseOptions();
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
      await refreshBranchWarehouseOptions();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleDelete(id: string) {
    try {
      await staffApi.remove(id);
      setStaffs((prev) => prev.filter((staff) => staff._id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success("Đã xóa nhân viên");
      await fetchStaffs();
      await refreshBranchWarehouseOptions();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await staffApi.deactivateAccount(id);
      toast.success("Đã khóa tài khoản nhân viên");
      await fetchStaffs();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleActivate(
    id: string,
    payload: CreateStaffAccountPayload,
  ) {
    try {
      await staffApi.createAccount(id, payload);
      toast.success("Đã kích hoạt tài khoản nhân viên");
      await fetchStaffs();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleUpdatePassword(
    id: string,
    payload: CreateStaffAccountPayload,
  ) {
    try {
      await staffApi.updatePassword(id, payload);
      toast.success("Đã đổi mật khẩu");
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
        isInitialLoading,
        isFetching,
        total,
        totalPages,
        listQuery,
        keywordInput,
        setKeywordInput,
        setListQuery,
        roleOptions,
        branchOptions,
        warehouseOptions,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        fetchStaffs,
        handleAdd,
        handleEdit,
        handleDelete,
        handleDeactivate,
        handleActivate,
        handleUpdatePassword,
        updateRoleFilter,
        updateStatusFilter,
        updateBranchFilter,
        updateWarehouseFilter,
        updatePage,
        updatePageSize,
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
