// [Domain – Types]
export type PayrollCycle = 'MONTHLY' | 'WEEKLY' | string;
export type PeriodStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PAID';
export type AdjustmentType = 'BONUS' | 'DEDUCTION';

export interface PayrollSettings {
  _id?: string;
  cycle: PayrollCycle;
  periodStartDay: number;
  approveAfterPeriodEndDays: number;
  payAfterPeriodEndDays: number;
  autoGenerate: boolean;
  standardWorkingDays: number;
  standardWorkingHoursPerDay: number;
  weekendDays: number[];
  lateGraceMinutes: number;
}

export interface PaySheet {
  _id: string;
  tenantId?: string;
  createdBy?: string;
  name: string;
  status?: string;
  basicPay: {
    payType: 'PAY_BY_SHIFT' | 'STANDARD_WORKING_DAY' | 'FIXED';
    amountPerShift?: number;
    salaryPerPeriod?: number;
    standardWorkingDaySalary?: number;
    rates?: {
      weekend?: number;
      publicHoliday?: number;
    };
  };
  overtime?: {
    normalDay?: number;
    weekend?: number;
    publicHoliday?: number;
  };
  allowances?: {
    name: string;
    enable: boolean;
    amountType: 'FIXED_AMOUNT' | 'PERCENTAGE';
    amountValue: number;
  }[];
  deductions?: {
    name: string;
    enable: boolean;
    deductionType: 'LATE' | 'EARLY_LEAVE' | 'FIXED';
    conditionType?: 'BY_OCCURRENCE' | 'BY_BLOCK';
    blockMinutes?: number;
    deductionValue: number;
  }[];
  bonuses?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export type PaySheetCreatePayload = Omit<PaySheet, '_id' | 'createdAt' | 'updatedAt'>;
export type PaySheetUpdatePayload = Partial<PaySheetCreatePayload>;

export interface ManualAdjustment {
  _id?: string;
  category: 'SALARY_ADVANCE' | 'TET_BONUS' | 'OTHER';
  name: string;
  amount: number;
  note?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface Payslip {
  _id: string;
  userId: {
    _id: string;
    phoneNumber: string;
    role: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    };
  };
  baseSalary: number;
  standardWorkingDays: number;
  actualWorkingDays: number;
  standardWorkingHours: number;
  actualWorkingHours: number;
  lateMinutes: number;
  latePenalty: number;
  overtimeHours: number;
  overtimePay: number;
  allowance: number;
  bonus: number;
  deduction: number;
  netSalary: number;
  note?: string;
  manualAdjustments?: ManualAdjustment[];
}

export interface PayrollPeriod {
  _id: string;
  periodStart: string;
  periodEnd: string;
  status: PeriodStatus;
  payslips: Payslip[];
  totalCost?: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PeriodCreatePayload {
  payrollMonth: string;
  userIds?: string[];
}

export interface PreviewPayload {
  periodStartDate: string;
  periodEndDate: string;
  userIds?: string[];
  manualAdjustments?: { userId: string; type: string; amount: number; note?: string }[];
}

export interface PayrollPeriodQueryParams {
  page?: number;
  limit?: number;
  status?: PeriodStatus;
}
