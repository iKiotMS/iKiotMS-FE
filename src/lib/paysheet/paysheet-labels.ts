import type {
  PaySheetAllowanceType,
  PaySheetAmountType,
  PaySheetBonusCalculationType,
  PaySheetBonusType,
  PaySheetDeductionConditionType,
  PaySheetDeductionType,
  PaySheetPayType,
} from "@/types/paysheet";

export const PAY_TYPE_LABELS: Record<PaySheetPayType, string> = {
  PAY_BY_SHIFT: "Theo ca",
  PAY_BY_HOUR: "Theo giờ",
  STANDARD_WORKING_DAY: "Theo ngày công chuẩn",
  FIXED: "Lương cố định",
};

export const BONUS_TYPE_LABELS: Record<PaySheetBonusType, string> = {
  EMPLOYEE_REVENUE: "Doanh thu nhân viên",
  MINIMUM_AVENUE_INCOME: "Doanh thu tối thiểu",
  BRANCH_REVENUE: "Doanh thu chi nhánh",
};

export const BONUS_CALCULATION_LABELS: Record<
  PaySheetBonusCalculationType,
  string
> = {
  GROSS_REVENUE: "Doanh thu gộp",
  NET_REVENUE: "Doanh thu thuần",
  COLLECTED_REVENUE: "Doanh thu thu thực",
};

export const AMOUNT_TYPE_LABELS: Record<PaySheetAmountType, string> = {
  FIXED_AMOUNT: "VND",
  PERCENTAGE: "%",
};

export const ALLOWANCE_TYPE_LABELS: Record<PaySheetAllowanceType, string> = {
  FIXED_DAILY: "Cố định theo ngày",
  FIXED_MONTHLY: "Cố định theo tháng",
};

export const DEDUCTION_TYPE_LABELS: Record<PaySheetDeductionType, string> = {
  LATE: "Đi muộn",
  EARLY_LEAVE: "Về sớm",
  FIXED: "Cố định",
};

export const DEDUCTION_CONDITION_LABELS: Record<
  PaySheetDeductionConditionType,
  string
> = {
  BY_OCCURRENCE: "Theo số lần",
  BY_BLOCK: "Theo block thời gian",
  BY_SALARY_COEFFICIENT: "Theo hệ số lương",
};
