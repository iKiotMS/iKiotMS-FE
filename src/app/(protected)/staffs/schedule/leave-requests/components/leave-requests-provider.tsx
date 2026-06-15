"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { leaveRequestApi } from "@/lib/api/leave-request";
import type {
  CreateLeaveRequestPayload,
  LeaveRequest,
  LeaveRequestStatus,
  ReviewLeaveRequestPayload,
} from "@/types/leave-request";

export type LeaveRequestsDialogType = "create" | "review";

type LeaveRequestsContextType = {
  leaveRequests: LeaveRequest[];
  isLoading: boolean;
  open: LeaveRequestsDialogType | null;
  setOpen: (value: LeaveRequestsDialogType | null) => void;
  currentRow: LeaveRequest | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<LeaveRequest | null>>;
  fetchLeaveRequests: () => Promise<void>;
  handleCreate: (payload: CreateLeaveRequestPayload) => Promise<void>;
  handleReview: (
    id: string,
    payload: ReviewLeaveRequestPayload,
  ) => Promise<void>;
};

const LeaveRequestsContext = React.createContext<LeaveRequestsContextType | null>(
  null,
);

export function LeaveRequestsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState<LeaveRequestsDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<LeaveRequest | null>(null);
  const mockData = useMemo(() => MOCK_LEAVE_REQUESTS, []);

  const fetchLeaveRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await leaveRequestApi.getList({ page: 1, limit: 50 });
      setLeaveRequests(response?.data ?? []);
    } catch {
      setLeaveRequests(mockData);
    } finally {
      setIsLoading(false);
    }
  }, [mockData]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  async function handleCreate(payload: CreateLeaveRequestPayload) {
    try {
      await leaveRequestApi.create(payload);
      toast.success("Đã tạo đơn nghỉ phép");
      await fetchLeaveRequests();
    } catch {
      const staff = STAFF_MAP[payload.userId] ?? "Nhân viên";
      const branch = BRANCH_MAP[payload.branchId] ?? "Không xác định";
      const totalDays = calculateDays(payload.fromDate, payload.toDate);
      const now = new Date().toISOString();
      const fallback: LeaveRequest = {
        _id: Date.now().toString(),
        tenantId: "tenant-1",
        branchId: payload.branchId,
        branchName: branch,
        userId: payload.userId,
        staffName: staff,
        type: payload.type,
        reason: payload.reason,
        fromDate: payload.fromDate,
        toDate: payload.toDate,
        totalDays,
        status: "PENDING",
        createdAt: now,
        updatedAt: now,
      };
      setLeaveRequests((prev) => [fallback, ...prev]);
      toast.success("Đã tạo đơn nghỉ phép (mock mode)");
    }
  }

  async function handleReview(id: string, payload: ReviewLeaveRequestPayload) {
    try {
      await leaveRequestApi.review(id, payload);
      toast.success(
        payload.status === "APPROVED"
          ? "Đã duyệt đơn nghỉ phép"
          : "Đã từ chối đơn nghỉ phép",
      );
      await fetchLeaveRequests();
    } catch {
      setLeaveRequests((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                status: payload.status as LeaveRequestStatus,
                reviewNote: payload.reviewNote,
                reviewedByName: "Bạn",
                reviewedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      toast.success(
        payload.status === "APPROVED"
          ? "Đã duyệt đơn nghỉ phép (mock mode)"
          : "Đã từ chối đơn nghỉ phép (mock mode)",
      );
    }
  }

  return (
    <LeaveRequestsContext.Provider
      value={{
        leaveRequests,
        isLoading,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        fetchLeaveRequests,
        handleCreate,
        handleReview,
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

const STAFF_MAP = Object.fromEntries(
  STAFF_OPTIONS.map((item) => [item.value, item.label]),
);
const BRANCH_MAP = Object.fromEntries(
  BRANCH_OPTIONS.map((item) => [item.value, item.label]),
);

const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    _id: "lr-001",
    tenantId: "tenant-1",
    branchId: "branch-1",
    branchName: "Chi nhánh Quận 1",
    userId: "staff-001",
    staffName: "Nguyễn An",
    type: "SICK",
    reason: "Bị sốt, cần nghỉ để điều trị",
    fromDate: "2026-06-18",
    toDate: "2026-06-19",
    totalDays: 2,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "lr-002",
    tenantId: "tenant-1",
    branchId: "branch-2",
    branchName: "Chi nhánh Quận 3",
    userId: "staff-002",
    staffName: "Trần Bình",
    type: "ANNUAL",
    reason: "Nghỉ phép năm",
    fromDate: "2026-06-22",
    toDate: "2026-06-23",
    totalDays: 2,
    status: "APPROVED",
    reviewedByName: "Lê Quản Lý",
    reviewedAt: new Date().toISOString(),
    reviewNote: "Đã sắp xếp người thay ca",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function calculateDays(fromDate: string, toDate: string) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / 86400000) + 1;
}
