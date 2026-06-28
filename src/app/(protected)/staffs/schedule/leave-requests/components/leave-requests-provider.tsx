"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { leaveRequestApi } from "@/lib/api/leave-request";
import { staffApi } from "@/lib/api/staff";
import { getApiErrorMessage } from "@/lib/api/staff-mapper";
import { useAuth } from "@/hooks/use-auth";
import type {
  CreateEmergencyLeavePayload,
  LeaveListQuery,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveRequestType,
} from "@/types/leave-request";

export type LeaveRequestsDialogType = "create";

const DEFAULT_LIST_QUERY: LeaveListQuery = {
  page: 1,
  recordPerPage: 10,
  status: "all",
  leaveType: "all",
  keyword: "",
};

type LeaveRequestsContextType = {
  leaveRequests: LeaveRequest[];
  isInitialLoading: boolean;
  isFetching: boolean;
  total: number;
  totalPages: number;
  listQuery: LeaveListQuery;
  staffOptions: { value: string; label: string }[];
  open: LeaveRequestsDialogType | null;
  setOpen: (value: LeaveRequestsDialogType | null) => void;
  handleCreate: (payload: CreateEmergencyLeavePayload) => Promise<void>;
  handleApprove: (id: string, reviewNote?: string) => Promise<void>;
  handleReject: (id: string, reviewNote: string) => Promise<void>;
  updateStatusFilter: (status: LeaveRequestStatus | "all") => void;
  updateLeaveTypeFilter: (leaveType: LeaveRequestType | "all") => void;
  updateKeywordFilter: (keyword: string) => void;
  updatePage: (page: number) => void;
  updatePageSize: (recordPerPage: number) => void;
};

const LeaveRequestsContext =
  React.createContext<LeaveRequestsContextType | null>(null);

function isUserContextReady(
  role?: string | null,
  branchId?: string | null,
  warehouseId?: string | null,
): boolean {
  if (!role) return false;
  if (role === "BRANCH_MANAGER") return !!branchId;
  if (role === "WAREHOUSE_MANAGER") return !!warehouseId;
  return true;
}

export function LeaveRequestsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const role = user?.role;
  const branchId = user?.branchId;
  const warehouseId = user?.warehouseId;

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [listQuery, setListQuery] = useState<LeaveListQuery>(DEFAULT_LIST_QUERY);
  const [open, setOpen] = useState<LeaveRequestsDialogType | null>(null);
  const [staffOptions, setStaffOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const contextReady = isUserContextReady(role, branchId, warehouseId);

  useEffect(() => {
    void staffApi
      .getAllForOptions()
      .then((staffList) => {
        setStaffOptions(
          staffList
            .filter((staff) => staff.role === "STAFF" && staff.status === "ACTIVE")
            .map((staff) => ({
              value: staff._id,
              label: staff.fullName,
            })),
        );
      })
      .catch(() => {
        setStaffOptions([]);
      });
  }, []);

  const fetchLeaveRequests = useCallback(async () => {
    if (!contextReady || !role) {
      setIsInitialLoading(false);
      return;
    }

    setIsFetching(true);
    try {
      const response = await leaveRequestApi.getListForUser(
        { role, branchId, warehouseId },
        {
          page: listQuery.page,
          recordPerPage: listQuery.recordPerPage,
          status: listQuery.status === "all" ? undefined : listQuery.status,
          leaveType:
            listQuery.leaveType === "all" ? undefined : listQuery.leaveType,
          keyword: listQuery.keyword || undefined,
        },
      );
      setLeaveRequests(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setLeaveRequests([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsFetching(false);
      setIsInitialLoading(false);
    }
  }, [
    contextReady,
    role,
    branchId,
    warehouseId,
    listQuery.page,
    listQuery.recordPerPage,
    listQuery.status,
    listQuery.leaveType,
    listQuery.keyword,
  ]);

  useEffect(() => {
    void fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  async function handleCreate(payload: CreateEmergencyLeavePayload) {
    try {
      await leaveRequestApi.createEmergency(payload);
      toast.success("Đã tạo đơn nghỉ phép");
      await fetchLeaveRequests();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleApprove(id: string, reviewNote?: string) {
    try {
      await leaveRequestApi.approve(id, reviewNote);
      toast.success("Đã duyệt đơn nghỉ phép");
      await fetchLeaveRequests();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleReject(id: string, reviewNote: string) {
    try {
      await leaveRequestApi.reject(id, reviewNote);
      toast.success("Đã từ chối đơn nghỉ phép");
      await fetchLeaveRequests();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  function updateStatusFilter(status: LeaveRequestStatus | "all") {
    setListQuery((prev) => ({ ...prev, status, page: 1 }));
  }

  function updateLeaveTypeFilter(leaveType: LeaveRequestType | "all") {
    setListQuery((prev) => ({ ...prev, leaveType, page: 1 }));
  }

  function updateKeywordFilter(keyword: string) {
    setListQuery((prev) => ({ ...prev, keyword, page: 1 }));
  }

  function updatePage(page: number) {
    setListQuery((prev) => ({ ...prev, page }));
  }

  function updatePageSize(recordPerPage: number) {
    setListQuery((prev) => ({ ...prev, recordPerPage, page: 1 }));
  }

  return (
    <LeaveRequestsContext.Provider
      value={{
        leaveRequests,
        isInitialLoading,
        isFetching,
        total,
        totalPages,
        listQuery,
        staffOptions,
        open,
        setOpen,
        handleCreate,
        handleApprove,
        handleReject,
        updateStatusFilter,
        updateLeaveTypeFilter,
        updateKeywordFilter,
        updatePage,
        updatePageSize,
      }}
    >
      {children}
    </LeaveRequestsContext.Provider>
  );
}

export function useLeaveRequests() {
  const ctx = React.useContext(LeaveRequestsContext);
  if (!ctx) {
    throw new Error(
      "useLeaveRequests must be used within <LeaveRequestsProvider>",
    );
  }
  return ctx;
}
