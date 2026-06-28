import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type {
  ApiLeaveRequest,
  LeaveRequest,
} from "@/types/leave-request";

function resolveId(ref: { _id?: string } | string | undefined | null): string {
  if (!ref) return "";
  return typeof ref === "string" ? ref : (ref._id ?? "");
}

function resolveStaffName(userId: ApiLeaveRequest["userId"]): string {
  if (!userId || typeof userId === "string") return "—";
  const first = userId.profile?.firstName ?? "";
  const last = userId.profile?.lastName ?? "";
  const name = `${last} ${first}`.trim();
  return name || userId.email || userId.phoneNumber || "—";
}

function resolveWorkplace(userId: ApiLeaveRequest["userId"]): {
  branchId?: string;
  branchName: string;
} {
  if (!userId || typeof userId === "string") {
    return { branchName: "—" };
  }

  if (userId.branchId && typeof userId.branchId === "object") {
    return {
      branchId: userId.branchId._id,
      branchName: userId.branchId.name ?? "Chi nhánh",
    };
  }

  if (userId.warehouseId && typeof userId.warehouseId === "object") {
    return {
      branchId: userId.warehouseId._id,
      branchName: userId.warehouseId.name ?? "Kho hàng",
    };
  }

  if (typeof userId.branchId === "string") {
    return { branchId: userId.branchId, branchName: "Chi nhánh" };
  }

  if (typeof userId.warehouseId === "string") {
    return { branchId: userId.warehouseId, branchName: "Kho hàng" };
  }

  return { branchName: "—" };
}

export function calculateLeaveDays(startDate: string, endDate: string): number {
  const from = parseISO(startDate.slice(0, 10));
  const to = parseISO(endDate.slice(0, 10));
  if (!isValid(from) || !isValid(to)) return 1;
  const diffMs = to.getTime() - from.getTime();
  return Math.max(Math.floor(diffMs / 86400000) + 1, 1);
}

export function toApiDate(date: string): string {
  if (!date) return date;
  if (date.includes("T")) return date;
  return `${date}T00:00:00.000Z`;
}

export function formatLeaveDate(
  value?: string,
  withTime = false,
): string {
  if (!value) return "—";
  const parsed = parseISO(value);
  if (!isValid(parsed)) return "—";
  return format(parsed, withTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy", {
    locale: vi,
  });
}

export function mapLeaveRequestFromApi(item: ApiLeaveRequest): LeaveRequest {
  const workplace = resolveWorkplace(item.userId);

  return {
    _id: item._id,
    tenantId: item.tenantId,
    branchId: workplace.branchId,
    branchName: workplace.branchName,
    userId: resolveId(item.userId),
    staffName: resolveStaffName(item.userId),
    type: item.leaveType,
    reason: item.reason,
    fromDate: item.startDate,
    toDate: item.endDate,
    totalDays: calculateLeaveDays(item.startDate, item.endDate),
    status: item.status,
    reviewNote: item.reviewNote,
    reviewedAt:
      item.status !== "PENDING" ? (item.updatedAt ?? undefined) : undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function extractCreatedLeaveRequest(
  payload: unknown,
): ApiLeaveRequest | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  if (data.leaveRequest && typeof data.leaveRequest === "object") {
    return data.leaveRequest as ApiLeaveRequest;
  }
  if (typeof data._id === "string") {
    return data as unknown as ApiLeaveRequest;
  }
  return null;
}
