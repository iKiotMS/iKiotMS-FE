export type LeaveRequestType = "SICK" | "PERSONAL" | "ANNUAL" | "OTHER";

export type LeaveRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface LeaveRequest {
  _id: string;
  tenantId: string;
  branchId: string;
  branchName: string;
  userId: string;
  staffName: string;
  type: LeaveRequestType;
  reason: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  status: LeaveRequestStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  status?: LeaveRequestStatus;
  type?: LeaveRequestType;
  fromDate?: string;
  toDate?: string;
}

export interface LeaveRequestListResponse {
  data: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateLeaveRequestPayload {
  userId: string;
  branchId: string;
  type: LeaveRequestType;
  reason: string;
  fromDate: string;
  toDate: string;
}

export interface ReviewLeaveRequestPayload {
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
}
