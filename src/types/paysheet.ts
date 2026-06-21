export type PaySheetPayType =
  | "PAY_BY_SHIFT"
  | "PAY_BY_HOUR"
  | "STANDARD_WORKING_DAY"
  | "FIXED";

export type PaySheetBonusType =
  | "EMPLOYEE_REVENUE"
  | "MINIMUM_AVENUE_INCOME"
  | "BRANCH_REVENUE";

export type PaySheetBonusCalculationType =
  | "GROSS_REVENUE"
  | "NET_REVENUE"
  | "COLLECTED_REVENUE";

export type PaySheetAmountType = "FIXED_AMOUNT" | "PERCENTAGE";

export type PaySheetAllowanceType = "FIXED_DAILY" | "FIXED_MONTHLY";

export type PaySheetDeductionType = "LATE" | "EARLY_LEAVE" | "FIXED";

export type PaySheetDeductionConditionType =
  | "BY_OCCURRENCE"
  | "BY_BLOCK"
  | "BY_SALARY_COEFFICIENT";

export interface PaySheetBasicPayRates {
  holiday?: number;
  specialHoliday?: number;
}

export interface PaySheetBasicPay {
  payType: PaySheetPayType;
  amountPerShift?: number;
  amountPerHour?: number;
  salaryPerPeriod?: number;
  standardWorkingDays?: number;
  rates?: PaySheetBasicPayRates;
}

export interface PaySheetOvertime {
  normalDay?: number;
  holiday?: number;
  specialHoliday?: number;
}

export interface PaySheetBonusTier {
  name?: string;
  fromValue?: number;
  rewardType?: PaySheetAmountType;
  rewardValue?: number;
}

export interface PaySheetBonus {
  bonusType: PaySheetBonusType;
  calculationType: PaySheetBonusCalculationType;
  enable?: boolean;
  tiers: PaySheetBonusTier[];
}

export interface PaySheetAllowance {
  name: string;
  enable?: boolean;
  allowancesType: PaySheetAllowanceType;
  amountType: PaySheetAmountType;
  amountValue: number;
}

export interface PaySheetDeduction {
  name: string;
  enable?: boolean;
  deductionType: PaySheetDeductionType;
  conditionType?: PaySheetDeductionConditionType;
  blockMinutes?: number;
  amountType: PaySheetAmountType;
  deductionValue: number;
}

export interface PaySheet {
  _id: string;
  tenantId: string;
  createdBy?: string;
  name: string;
  basicPay: PaySheetBasicPay;
  overtime?: PaySheetOvertime;
  bonuses?: PaySheetBonus[];
  allowances?: PaySheetAllowance[];
  deductions?: PaySheetDeduction[];
  createdAt: string;
  updatedAt: string;
}

export interface PaySheetQueryParams {
  page?: number;
  recordPerPage?: number;
  name?: string;
}

export interface PaySheetListResponse {
  data: PaySheet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaySheetPayload {
  name: string;
  basicPay: PaySheetBasicPay;
  overtime?: PaySheetOvertime;
  bonuses?: PaySheetBonus[];
  allowances?: PaySheetAllowance[];
  deductions?: PaySheetDeduction[];
}
