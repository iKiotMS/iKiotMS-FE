"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { staffApi } from "@/lib/api/staff";
import { branchApi } from "@/lib/api/branch";
import { warehouseApi } from "@/lib/api/warehouse";
import { getSessionRole } from "@/lib/auth";
import {
  getApiErrorMessage,
  getStaffRoleLabel,
} from "@/lib/api/staff-mapper";
import { canViewStaff } from "@/app/(protected)/staffs/shared/staff-permissions";
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
  | "password"
  | "leaveBalance";

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
  warehouseOptionsFailed: boolean;
  open: StaffsDialogType | null;
  setOpen: (value: StaffsDialogType | null) => void;
  currentRow: Staff | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Staff | null>>;
  fetchStaffs: () => Promise<void>;
  handleAdd: (payload: CreateStaffPayload) => Promise<void>;
  handleEdit: (id: string, payload: UpdateStaffPayload) => Promise<void>;
  handleDelete: (
    id: string,
    replacementManagerId?: string,
  ) => Promise<void>;
  handleDeactivate: (
    id: string,
    replacementManagerId?: string,
  ) => Promise<void>;
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
  assignManagerOpen: boolean;
  assignManagerBranchId?: string;
  assignManagerBranchName?: string;
  openAssignBranchManager: (branchId?: string, branchName?: string) => void;
  closeAssignBranchManager: () => void;
  assignWarehouseManagerOpen: boolean;
  assignManagerWarehouseId?: string;
  assignManagerWarehouseName?: string;
  openAssignWarehouseManager: (
    warehouseId?: string,
    warehouseName?: string,
  ) => void;
  closeAssignWarehouseManager: () => void;
};

const StaffsContext = React.createContext<StaffsContextType | null>(null);

const DEFAULT_ROLE_OPTIONS: StaffRoleOption[] = [
  { value: "STAFF", label: "Nhân viên bán hàng" },
  { value: "WAREHOUSE_MANAGER", label: "Quản lý kho" },
  { value: "BRANCH_MANAGER", label: "Quản lý chi nhánh" },
];

type StaffsProviderProps = {
  children: React.ReactNode;
  enabled?: boolean;
};

export function StaffsProvider({
  children,
  enabled = true,
}: StaffsProviderProps) {
  const canFetch = enabled && canViewStaff(getSessionRole());

  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(canFetch);
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
  const [warehouseOptionsFailed, setWarehouseOptionsFailed] = useState(false);
  const [open, setOpen] = useState<StaffsDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<Staff | null>(null);
  const [assignManagerOpen, setAssignManagerOpen] = useState(false);
  const [assignManagerBranchId, setAssignManagerBranchId] = useState<
    string | undefined
  >();
  const [assignManagerBranchName, setAssignManagerBranchName] = useState<
    string | undefined
  >();
  const [assignWarehouseManagerOpen, setAssignWarehouseManagerOpen] =
    useState(false);
  const [assignManagerWarehouseId, setAssignManagerWarehouseId] = useState<
    string | undefined
  >();
  const [assignManagerWarehouseName, setAssignManagerWarehouseName] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!canFetch) {
      setIsInitialLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setListQuery((prev) => {
        if (prev.keyword === keywordInput) return prev;
        return { ...prev, keyword: keywordInput, page: 1 };
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [keywordInput, canFetch]);

  useEffect(() => {
    if (!canFetch) return;

    async function loadFilterOptions() {
      try {
        const response = await branchApi.getList({ limit: 100 });
        setBranchOptions(
          (response.data ?? []).map((branch) => ({
            value: branch._id,
            label: branch.name,
          })),
        );
      } catch {
        setBranchOptions([]);
      }

      try {
        const response = await warehouseApi.getList({ limit: 100 });
        setWarehouseOptions(
          (response.data ?? []).map((warehouse) => ({
            value: warehouse._id,
            label: warehouse.name,
          })),
        );
        setWarehouseOptionsFailed(false);
      } catch {
        setWarehouseOptions([]);
        setWarehouseOptionsFailed(true);
      }
    }

    loadFilterOptions();
  }, [canFetch]);

  const fetchStaffs = useCallback(async () => {
    if (!canFetch) return;

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
  }, [listQuery, canFetch]);

  const fetchRoles = useCallback(async () => {
    if (!canFetch) return;

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
  }, [canFetch]);

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

  async function handleDelete(id: string, replacementManagerId?: string) {
    try {
      await staffApi.remove(id, { replacementManagerId });
      setStaffs((prev) => prev.filter((staff) => staff._id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success("Đã xóa nhân viên");
      await fetchStaffs();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleDeactivate(id: string, replacementManagerId?: string) {
    try {
      await staffApi.deactivateAccount(id, { replacementManagerId });
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

  function openAssignBranchManager(branchId?: string, branchName?: string) {
    setAssignManagerBranchId(branchId);
    setAssignManagerBranchName(branchName);
    setAssignManagerOpen(true);
  }

  function closeAssignBranchManager() {
    setAssignManagerOpen(false);
    setAssignManagerBranchId(undefined);
    setAssignManagerBranchName(undefined);
  }

  function openAssignWarehouseManager(
    warehouseId?: string,
    warehouseName?: string,
  ) {
    setAssignManagerWarehouseId(warehouseId);
    setAssignManagerWarehouseName(warehouseName);
    setAssignWarehouseManagerOpen(true);
  }

  function closeAssignWarehouseManager() {
    setAssignWarehouseManagerOpen(false);
    setAssignManagerWarehouseId(undefined);
    setAssignManagerWarehouseName(undefined);
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
        warehouseOptionsFailed,
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
        assignManagerOpen,
        assignManagerBranchId,
        assignManagerBranchName,
        openAssignBranchManager,
        closeAssignBranchManager,
        assignWarehouseManagerOpen,
        assignManagerWarehouseId,
        assignManagerWarehouseName,
        openAssignWarehouseManager,
        closeAssignWarehouseManager,
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
