export type ScheduleStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type ScheduleType = "NORMAL" | "OVERTIME";

export type ScheduleDayType =
  | "NORMAL"
  | "SUNDAY"
  | "HOLIDAY"
  | "SUNDAY_HOLIDAY";

export type AttendanceStatus =
  | "NOT_CHECKED_IN"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "LATE"
  | "ABSENT"
  | string;

export interface AttendanceLocation {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  distance?: number;
  verificationStatus?: string;
}

export interface AttendanceSummary {
  _id?: string;
  status: AttendanceStatus;
  actualCheckinAt?: string | null;
  actualCheckoutAt?: string | null;
}

export interface AttendanceDetail extends AttendanceSummary {
  checkInLocation?: AttendanceLocation | null;
  checkOutLocation?: AttendanceLocation | null;
  workedMinutes?: number | null;
  overtimeMinute?: number | null;
  lateMinutes?: number | null;
}

export interface ScheduleDayInfo {
  dayType: ScheduleDayType | string;
  isSunday: boolean;
  isHoliday: boolean;
  holidayName?: string | null;
  holidayType?: string | null;
}

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

export interface ApiScheduleUser {
  _id: string;
  phoneNumber?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  role?: string;
  branchId?: string | { _id: string };
  warehouseId?: string | { _id: string };
  attendance?: AttendanceSummary | AttendanceDetail;
}

/** Raw response shape từ BE (userId là mảng nhân viên trong cùng ca). */
export interface ApiWorkingSchedule {
  _id: string;
  tenantId: string;
  userId: ApiScheduleUser[] | ApiScheduleUser | string | string[];
  managedBy?:
    | string
    | {
        _id: string;
        phoneNumber?: string;
        profile?: { firstName?: string; lastName?: string };
      };
  shiftTemplateId: ShiftTemplate | string;
  workDate: string;
  startAt: string;
  endAt: string;
  scheduleType?: ScheduleType | string;
  dayInfo?: ScheduleDayInfo;
  status: ScheduleStatus | "DELETED";
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleAssignee {
  userId: string;
  staffName: string;
  staffAvatarUrl?: string | null;
  staffPhone: string;
  role: string;
  branchId?: string;
  warehouseId?: string;
  attendance: AttendanceDetail;
}

/** Một ca làm (có thể nhiều nhân viên). */
export interface WorkingSchedule {
  _id: string;
  tenantId: string;
  assignees: ScheduleAssignee[];
  managedById?: string;
  managedByName?: string;
  /** Nhãn gộp cho calendar / list. */
  staffName: string;
  staffAvatarUrl?: string | null;
  staffPhone: string;
  shiftTemplateId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  workDate: string;
  scheduleType: ScheduleType;
  dayInfo?: ScheduleDayInfo;
  status: ScheduleStatus;
  /** Attendance tổng hợp (assignee đầu hoặc tổng quan). */
  attendance: AttendanceDetail;
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
  scheduleType?: ScheduleType;
}

export interface WorkingScheduleListApiResponse {
  data: ApiWorkingSchedule[];
  pagination?: {
    total: number;
    page: number;
    recordPerPage: number;
    totalPages?: number;
    totalPage?: number;
  };
}

export interface CreateWorkingSchedulePayload {
  userId: string | string[];
  shiftTemplateId: string;
  workDate: string;
  scheduleType?: ScheduleType;
}

export interface UpdateShiftTemplatePayload {
  name: string;
  startTime: string;
  endTime: string;
}

export interface WorkingScheduleListResponse {
  data: WorkingSchedule[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ScheduleCalendarFilters {
  userId: string;
  status: ScheduleStatus | "all";
  startDate: string;
  endDate: string;
}

export interface CurrentWorkingScheduleResponse {
  data: ApiWorkingSchedule | null;
  message?: string;
  serverTime?: string;
}
