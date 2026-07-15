"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { leaveRequestApi } from "@/lib/api/leave-request";
import { staffApi } from "@/lib/api/staff";
import { workingScheduleApi } from "@/lib/api/schedule";
import { getApiErrorMessage } from "@/lib/api/staff-mapper";
import {
  canCreateEmergencyLeave,
  canCreatePersonalLeave,
} from "@/components/sidebar/constants/role-permissions";
import { useAuth } from "@/hooks/use-auth";
import { getSessionUserId } from "@/lib/auth";
import { useParams } from "next/navigation";
import type {
  ApproveLeavePayload,
  CreateEmergencyLeavePayload,
  CreatePersonalLeavePayload,
  LeaveBalance,
  LeaveListQuery,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveStaffOption,
} from "@/types/leave-request";

export type LeaveRequestsDialogType = "personal" | "emergency";

const DEFAULT_LIST_QUERY: LeaveListQuery = {
  page: 1,
  recordPerPage: 10,
  status: "all",
  keyword: "",
};

type LeaveRequestsContextType = {
  leaveRequests: LeaveRequest[];
  isInitialLoading: boolean;
  isFetching: boolean;
  total: number;
  totalPages: number;
  listQuery: LeaveListQuery;
  balance: LeaveBalance | null;
  staffOptions: LeaveStaffOption[];
  handoverOptions: LeaveStaffOption[];
  currentUserId?: string;
  open: LeaveRequestsDialogType | null;
  setOpen: (value: LeaveRequestsDialogType | null) => void;
  handleCreatePersonal: (payload: CreatePersonalLeavePayload) => Promise<void>;
  handleCreateEmergency: (
    payload: CreateEmergencyLeavePayload,
    options?: { approveImmediately?: ApproveLeavePayload },
  ) => Promise<void>;
  handleApprove: (id: string, payload: ApproveLeavePayload) => Promise<void>;
  handleReject: (id: string, reviewNote: string) => Promise<void>;
  handleCancel: (id: string) => Promise<void>;
  updateStatusFilter: (status: LeaveRequestStatus | "all") => void;
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
  const currentUserId = getSessionUserId() ?? user?.id;

  const params = useParams();
  const targetId = params.id as string | undefined;

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [listQuery, setListQuery] = useState<LeaveListQuery>(DEFAULT_LIST_QUERY);
  const [open, setOpen] = useState<LeaveRequestsDialogType | null>(null);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [staffOptions, setStaffOptions] = useState<LeaveStaffOption[]>([]);
  const [handoverOptions, setHandoverOptions] = useState<LeaveStaffOption[]>(
    [],
  );

  const contextReady = isUserContextReady(role, branchId, warehouseId);

  useEffect(() => {
    if (!role) return;

    let cancelled = false;

    async function loadOptions() {
      const emergencyAllowed = canCreateEmergencyLeave(role);
      const personalAllowed = canCreatePersonalLeave(role);
      const needsBranchStaff =
        (emergencyAllowed || personalAllowed) &&
        role === "BRANCH_MANAGER" &&
        !!branchId;
      const needsToStaff = emergencyAllowed && role === "TENANT_OWNER";
      const needsWhHandover =
        personalAllowed && role === "WAREHOUSE_MANAGER";

      let activeStaff: Awaited<ReturnType<typeof staffApi.getAllForOptions>> =
        [];

      if (needsBranchStaff || needsToStaff) {
        try {
          const list = await staffApi.getAllForOptions();
          if (cancelled) return;
          activeStaff = list.filter((s) => s.status === "ACTIVE");
        } catch {
          if (!cancelled) {
            setStaffOptions([]);
            setHandoverOptions([]);
          }
          return;
        }
      }

      if (emergencyAllowed) {
        const filtered = needsBranchStaff
          ? activeStaff.filter(
              (s) => s.role === "STAFF" && s.branchId === branchId,
            )
          : activeStaff.filter((s) =>
              ["STAFF", "BRANCH_MANAGER", "WAREHOUSE_MANAGER"].includes(s.role),
            );
        if (!cancelled) {
          setStaffOptions(
            filtered.map((s) => ({
              value: s._id,
              label: s.fullName,
              role: s.role,
            })),
          );
        }
      } else if (!cancelled) {
        setStaffOptions([]);
      }

      if (needsBranchStaff) {
        if (!cancelled) {
          setHandoverOptions(
            activeStaff
              .filter(
                (s) =>
                  s.role === "STAFF" &&
                  s.branchId === branchId &&
                  s._id !== currentUserId,
              )
              .map((s) => ({
                value: s._id,
                label: s.fullName,
                role: s.role,
              })),
          );
        }
      } else if (needsWhHandover) {
        try {
          const schedules = await workingScheduleApi.getList({
            page: 1,
            recordPerPage: 100,
          });
          if (cancelled) return;
          const unique = new Map<string, LeaveStaffOption>();
          for (const schedule of schedules.data) {
            for (const assignee of schedule.assignees) {
              if (
                !assignee.userId ||
                assignee.userId === currentUserId ||
                unique.has(assignee.userId)
              ) {
                continue;
              }
              unique.set(assignee.userId, {
                value: assignee.userId,
                label: assignee.staffName || assignee.userId,
                role: assignee.role,
              });
            }
          }
          setHandoverOptions(Array.from(unique.values()));
        } catch {
          if (!cancelled) setHandoverOptions([]);
        }
      } else if (!cancelled) {
        setHandoverOptions([]);
      }
    }

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [role, branchId, currentUserId]);

  const fetchBalance = useCallback(async () => {
    if (!canCreatePersonalLeave(role)) {
      setBalance(null);
      return;
    }
    try {
      setBalance(await leaveRequestApi.getBalance());
    } catch {
      setBalance(null);
    }
  }, [role]);

  const fetchLeaveRequests = useCallback(async () => {
    if (!contextReady || !role) {
      setIsInitialLoading(false);
      return;
    }

    setIsFetching(true);
    try {
      const response = await leaveRequestApi.getListForUser(
        { role },
        {
          page: listQuery.page,
          recordPerPage: listQuery.recordPerPage,
          status: listQuery.status === "all" ? undefined : listQuery.status,
          keyword: listQuery.keyword || undefined,
        },
      );

      let data = response.data;
      if (targetId && !data.some((r) => r._id === targetId)) {
        try {
          const targetReq = await leaveRequestApi.getById(targetId);
          if (targetReq) {
            data = [targetReq, ...data];
          }
        } catch (err) {
          console.error("Failed to fetch target leave request:", err);
        }
      }

      setLeaveRequests(data);
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
    listQuery.page,
    listQuery.recordPerPage,
    listQuery.status,
    listQuery.keyword,
    targetId,
  ]);

  useEffect(() => {
    void fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  useEffect(() => {
    void fetchBalance();
  }, [fetchBalance]);

  const refreshAfterMutation = useCallback(async () => {
    await Promise.all([fetchLeaveRequests(), fetchBalance()]);
  }, [fetchLeaveRequests, fetchBalance]);

  const handleCreatePersonal = useCallback(
    async (payload: CreatePersonalLeavePayload) => {
      try {
        await leaveRequestApi.createPersonal(payload);
        toast.success("Đã gửi đơn nghỉ phép");
        await refreshAfterMutation();
      } catch (error) {
        toast.error(getApiErrorMessage(error));
        throw error;
      }
    },
    [refreshAfterMutation],
  );

  const handleCreateEmergency = useCallback(
    async (
      payload: CreateEmergencyLeavePayload,
      options?: { approveImmediately?: ApproveLeavePayload },
    ) => {
      try {
        const created = await leaveRequestApi.createEmergency(payload);
        if (options?.approveImmediately) {
          await leaveRequestApi.approve(
            created._id,
            options.approveImmediately,
          );
          toast.success("Đã tạo và duyệt đơn nghỉ phép khẩn");
        } else {
          toast.success("Đã tạo đơn nghỉ phép khẩn (chờ duyệt)");
        }
        await refreshAfterMutation();
      } catch (error) {
        toast.error(getApiErrorMessage(error));
        throw error;
      }
    },
    [refreshAfterMutation],
  );

  const handleApprove = useCallback(
    async (id: string, payload: ApproveLeavePayload) => {
      try {
        await leaveRequestApi.approve(id, payload);
        toast.success("Đã duyệt đơn nghỉ phép");
        await refreshAfterMutation();
      } catch (error) {
        toast.error(getApiErrorMessage(error));
        throw error;
      }
    },
    [refreshAfterMutation],
  );

  const handleReject = useCallback(
    async (id: string, reviewNote: string) => {
      try {
        await leaveRequestApi.reject(id, reviewNote);
        toast.success("Đã từ chối đơn nghỉ phép");
        await fetchLeaveRequests();
      } catch (error) {
        toast.error(getApiErrorMessage(error));
        throw error;
      }
    },
    [fetchLeaveRequests],
  );

  const handleCancel = useCallback(
    async (id: string) => {
      try {
        await leaveRequestApi.cancel(id);
        toast.success("Đã hủy đơn nghỉ phép");
        await refreshAfterMutation();
      } catch (error) {
        toast.error(getApiErrorMessage(error));
        throw error;
      }
    },
    [refreshAfterMutation],
  );

  const updateStatusFilter = useCallback(
    (status: LeaveRequestStatus | "all") => {
      setListQuery((prev) => ({ ...prev, status, page: 1 }));
    },
    [],
  );

  const updateKeywordFilter = useCallback((keyword: string) => {
    setListQuery((prev) => ({ ...prev, keyword, page: 1 }));
  }, []);

  const updatePage = useCallback((page: number) => {
    setListQuery((prev) => ({ ...prev, page }));
  }, []);

  const updatePageSize = useCallback((recordPerPage: number) => {
    setListQuery((prev) => ({ ...prev, recordPerPage, page: 1 }));
  }, []);

  const value = useMemo(
    () => ({
      leaveRequests,
      isInitialLoading,
      isFetching,
      total,
      totalPages,
      listQuery,
      balance,
      staffOptions,
      handoverOptions,
      currentUserId,
      open,
      setOpen,
      handleCreatePersonal,
      handleCreateEmergency,
      handleApprove,
      handleReject,
      handleCancel,
      updateStatusFilter,
      updateKeywordFilter,
      updatePage,
      updatePageSize,
    }),
    [
      leaveRequests,
      isInitialLoading,
      isFetching,
      total,
      totalPages,
      listQuery,
      balance,
      staffOptions,
      handoverOptions,
      currentUserId,
      open,
      handleCreatePersonal,
      handleCreateEmergency,
      handleApprove,
      handleReject,
      handleCancel,
      updateStatusFilter,
      updateKeywordFilter,
      updatePage,
      updatePageSize,
    ],
  );

  return (
    <LeaveRequestsContext.Provider value={value}>
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
