export type ShiftType = "MORNING" | "AFTERNOON" | "EVENING";

export type ScheduleStatus =
  | "ASSIGNED"
  | "COMPLETED"
  | "ABSENT"
  | "CANCELLED";

export interface WorkingSchedule {
  _id: string;
  tenantId: string;
  branchId: string;
  branchName: string;
  userId: string;
  staffName: string;
  shiftType: ShiftType;
  shiftName: string;
  startTime: string;
  endTime: string;
  date: string;
  note?: string;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingScheduleQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  branchId?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  shiftType?: ShiftType;
  status?: ScheduleStatus;
}

export interface WorkingScheduleListResponse {
  data: WorkingSchedule[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateWorkingSchedulePayload {
  userId: string;
  branchId: string;
  shiftType: ShiftType;
  date: string;
  note?: string;
}

export interface UpdateWorkingSchedulePayload {
  userId?: string;
  branchId?: string;
  shiftType?: ShiftType;
  date?: string;
  note?: string;
  status?: ScheduleStatus;
}
