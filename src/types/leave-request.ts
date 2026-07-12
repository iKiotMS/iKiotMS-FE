export type LeaveRequestType = "ANNUAL" | "UNPAID" | "SICK" | "OTHER";

export type LeaveRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "DELETED";

export interface ApiLeaveRequest {
  _id: string;
  tenantId?: string;
  userId:
    | string
    | {
        _id?: string;
        email?: string;
        phoneNumber?: string;
        profile?: { firstName?: string; lastName?: string };
        branchId?: { _id?: string; name?: string } | string | null;
        warehouseId?: { _id?: string; name?: string } | string | null;
      };
  leaveType: LeaveRequestType;
  startDate: string;
  endDate: string;
  status: LeaveRequestStatus;
  reason: string;
  reviewNote?: string;
  approvedBy?: string | { _id?: string; profile?: { firstName?: string; lastName?: string } };
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveRequest {
  _id: string;
  tenantId?: string;
  branchId?: string;
  branchName: string;
  userId: string;
  staffName: string;
  type: LeaveRequestType;
  reason: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  status: LeaveRequestStatus;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveListQuery {
  page: number;
  recordPerPage: number;
  status: LeaveRequestStatus | "all";
  leaveType: LeaveRequestType | "all";
  keyword: string;
}

export interface LeaveRequestQueryParams {
  page?: number;
  recordPerPage?: number;
  status?: LeaveRequestStatus;
  leaveType?: LeaveRequestType;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface LeaveRequestListApiResponse {
  success?: boolean;
  message?: string;
  data: ApiLeaveRequest[];
  pagination?: {
    total: number;
    page: number;
    recordPerPage: number;
    totalPage: number;
  };
}

export interface LeaveRequestListResponse {
  data: LeaveRequest[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateEmergencyLeavePayload {
  userId: string;
  leaveType: LeaveRequestType;
  startDate: string;
  endDate: string;
  reason: string;
}

export type LeaveRequestUserContext = {
  role?: string | null;
  branchId?: string | null;
  warehouseId?: string | null;
};
