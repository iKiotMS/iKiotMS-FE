export type ScheduleStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface ShiftTemplate {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  status?: string;
}

export interface ShiftTemplateOption {
  value: string;
  label: string;
  startTime: string;
  endTime: string;
}

/** Raw response shape từ BE (populate userId + shiftTemplateId). */
export interface ApiWorkingSchedule {
  _id: string;
  tenantId: string;
  userId:
    | {
        _id: string;
        phoneNumber: string;
        profile?: { firstName?: string; lastName?: string };
        role: string;
      }
    | string;
  shiftTemplateId: ShiftTemplate | string;
  workDate: string;
  startAt: string;
  endAt: string;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

/** Flat shape cho UI/table. */
export interface WorkingSchedule {
  _id: string;
  tenantId: string;
  userId: string;
  staffName: string;
  staffPhone: string;
  shiftTemplateId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  workDate: string;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingScheduleQueryParams {
  page?: number;
  recordPerPage?: number;
  userId?: string;
  startDate?: string;
  endDate?: string;
  status?: ScheduleStatus;
}

export interface WorkingScheduleListApiResponse {
  data: ApiWorkingSchedule[];
  pagination: {
    total: number;
    page: number;
    recordPerPage: number;
    totalPages: number;
  };
}

export interface CreateWorkingSchedulePayload {
  userId: string;
  shiftTemplateId: string;
  workDate: string;
}

export interface UpdateShiftTemplatePayload {
  name: string;
  startTime: string;
  endTime: string;
}

export interface UpdateWorkingSchedulePayload {
  userId?: string;
  shiftTemplateId?: string;
  workDate?: string;
  status?: ScheduleStatus;
}

export interface WorkingScheduleListResponse {
  data: WorkingSchedule[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ScheduleListQuery {
  page: number;
  recordPerPage: number;
  userId: string;
  status: ScheduleStatus | "all";
  startDate: string;
  endDate: string;
}
