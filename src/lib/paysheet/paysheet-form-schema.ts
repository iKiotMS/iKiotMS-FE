import type { FieldErrors } from "react-hook-form";
import { z } from "zod";
import {
  normalizeCoefficient,
  normalizePercent,
  normalizeVnd,
} from "@/lib/paysheet/paysheet-format";
import type { PaySheet, PaySheetPayload } from "@/types/paysheet";

const PAY_SHEET_NAME_MAX = 200;
const ITEM_NAME_MAX = 100;

const payTypeSchema = z.enum([
  "PAY_BY_SHIFT",
  "PAY_BY_HOUR",
  "STANDARD_WORKING_DAY",
  "FIXED",
]);

const bonusTypeSchema = z.enum([
  "EMPLOYEE_REVENUE",
  "MINIMUM_AVENUE_INCOME",
  "BRANCH_REVENUE",
]);

const bonusCalculationSchema = z.enum([
  "GROSS_REVENUE",
  "NET_REVENUE",
  "COLLECTED_REVENUE",
]);

const amountTypeSchema = z.enum(["FIXED_AMOUNT", "PERCENTAGE"]);

const allowanceTypeSchema = z.enum(["FIXED_DAILY", "FIXED_MONTHLY"]);

const deductionTypeSchema = z.enum(["LATE", "EARLY_LEAVE", "FIXED"]);

const deductionConditionSchema = z.enum([
  "BY_OCCURRENCE",
  "BY_BLOCK",
  "BY_SALARY_COEFFICIENT",
]);

const finiteNumber = (label: string) =>
  z
    .number({
      error: `${label} phải là số`,
    })
    .finite(`${label} không hợp lệ`);

const nonNegativeMoney = (label: string) =>
  finiteNumber(label).min(0, `${label} không được âm`);

const positiveCoefficient = (label: string) =>
  finiteNumber(label).min(0.01, `${label} phải lớn hơn 0`);

const itemNameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} là bắt buộc`)
    .max(ITEM_NAME_MAX, `${label} tối đa ${ITEM_NAME_MAX} ký tự`);

const bonusTierSchema = z
  .object({
    name: z
      .string()
      .max(ITEM_NAME_MAX, `Tên mức tối đa ${ITEM_NAME_MAX} ký tự`)
      .optional(),
    fromValue: nonNegativeMoney("Giá trị bắt đầu"),
    rewardType: amountTypeSchema,
    rewardValue: nonNegativeMoney("Giá trị thưởng"),
  })
  .superRefine((tier, ctx) => {
    if (tier.rewardType === "PERCENTAGE") {
      if (tier.rewardValue < 0 || tier.rewardValue > 100) {
        ctx.addIssue({
          code: "custom",
          message: "Phần trăm thưởng phải từ 0 đến 100",
          path: ["rewardValue"],
        });
      }
    }
  });

const bonusSchema = z
  .object({
    bonusType: bonusTypeSchema,
    calculationType: bonusCalculationSchema,
    enable: z.boolean(),
    tiers: z.array(bonusTierSchema).min(1, "Cần ít nhất một mức thưởng"),
  })
  .superRefine((bonus, ctx) => {
    bonus.tiers.forEach((tier, tierIndex) => {
      if (tierIndex === 0) return;
      const previous = bonus.tiers[tierIndex - 1];
      if (tier.fromValue <= previous.fromValue) {
        ctx.addIssue({
          code: "custom",
          message: "Giá trị bắt đầu phải lớn dần theo từng mức",
          path: ["tiers", tierIndex, "fromValue"],
        });
      }
    });
  });

const allowanceSchema = z
  .object({
    name: itemNameSchema("Tên phụ cấp"),
    enable: z.boolean(),
    allowancesType: allowanceTypeSchema,
    amountType: amountTypeSchema,
    amountValue: nonNegativeMoney("Giá trị phụ cấp"),
  })
  .superRefine((item, ctx) => {
    if (item.amountType === "PERCENTAGE") {
      if (item.amountValue < 0 || item.amountValue > 100) {
        ctx.addIssue({
          code: "custom",
          message: "Phần trăm phụ cấp phải từ 0 đến 100",
          path: ["amountValue"],
        });
      }
    }
  });

const deductionSchema = z
  .object({
    name: itemNameSchema("Tên giảm trừ"),
    enable: z.boolean(),
    deductionType: deductionTypeSchema,
    conditionType: deductionConditionSchema.optional(),
    blockMinutes: z.number().optional(),
    amountType: amountTypeSchema,
    deductionValue: nonNegativeMoney("Giá trị giảm trừ"),
  })
  .superRefine((item, ctx) => {
    if (["LATE", "EARLY_LEAVE"].includes(item.deductionType)) {
      if (!item.conditionType) {
        ctx.addIssue({
          code: "custom",
          message: "Điều kiện giảm trừ là bắt buộc",
          path: ["conditionType"],
        });
      }
      if (
        item.conditionType === "BY_BLOCK" &&
        (item.blockMinutes === undefined ||
          !Number.isInteger(item.blockMinutes) ||
          item.blockMinutes <= 0)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Số phút mỗi block phải là số nguyên dương",
          path: ["blockMinutes"],
        });
      }
    }

    if (item.amountType === "PERCENTAGE") {
      if (item.deductionValue < 0 || item.deductionValue > 100) {
        ctx.addIssue({
          code: "custom",
          message: "Phần trăm giảm trừ phải từ 0 đến 100",
          path: ["deductionValue"],
        });
      }
    }
  });

export const paysheetFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Tên bảng lương là bắt buộc")
      .max(
        PAY_SHEET_NAME_MAX,
        `Tên bảng lương tối đa ${PAY_SHEET_NAME_MAX} ký tự`,
      ),
    payType: payTypeSchema,
    amountPerShift: z.number().optional(),
    amountPerHour: z.number().optional(),
    salaryPerPeriod: z.number().optional(),
    standardWorkingDays: z.number().optional(),
    rateHoliday: positiveCoefficient("Hệ số ngày nghỉ"),
    rateSpecialHoliday: positiveCoefficient("Hệ số ngày lễ"),
    overtimeNormalDay: positiveCoefficient("Hệ số OT ngày thường"),
    overtimeHoliday: positiveCoefficient("Hệ số OT ngày nghỉ"),
    overtimeSpecialHoliday: positiveCoefficient("Hệ số OT ngày lễ"),
    bonuses: z.array(bonusSchema),
    allowances: z.array(allowanceSchema),
    deductions: z.array(deductionSchema),
  })
  .superRefine((data, ctx) => {
    if (data.payType === "PAY_BY_SHIFT") {
      if (data.amountPerShift === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Lương mỗi ca là bắt buộc",
          path: ["amountPerShift"],
        });
      } else if (data.amountPerShift <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Lương mỗi ca phải lớn hơn 0",
          path: ["amountPerShift"],
        });
      }
    }

    if (data.payType === "PAY_BY_HOUR") {
      if (data.amountPerHour === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Lương mỗi giờ là bắt buộc",
          path: ["amountPerHour"],
        });
      } else if (data.amountPerHour <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Lương mỗi giờ phải lớn hơn 0",
          path: ["amountPerHour"],
        });
      }
    }

    if (
      data.payType === "STANDARD_WORKING_DAY" ||
      data.payType === "FIXED"
    ) {
      if (data.salaryPerPeriod === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Lương mỗi kỳ là bắt buộc",
          path: ["salaryPerPeriod"],
        });
      } else if (data.salaryPerPeriod <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Lương mỗi kỳ phải lớn hơn 0",
          path: ["salaryPerPeriod"],
        });
      }
    }

    if (data.payType === "STANDARD_WORKING_DAY") {
      if (data.standardWorkingDays === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Số ngày công chuẩn là bắt buộc",
          path: ["standardWorkingDays"],
        });
      } else if (
        !Number.isInteger(data.standardWorkingDays) ||
        data.standardWorkingDays <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Số ngày công chuẩn phải là số nguyên dương",
          path: ["standardWorkingDays"],
        });
      } else if (data.standardWorkingDays > 31) {
        ctx.addIssue({
          code: "custom",
          message: "Số ngày công chuẩn tối đa 31 ngày",
          path: ["standardWorkingDays"],
        });
      }
    }
  });

export type PaysheetFormValues = z.infer<typeof paysheetFormSchema>;

export const EMPTY_PAYSHEET_FORM_VALUES: PaysheetFormValues = {
  name: "",
  payType: "FIXED",
  amountPerShift: undefined,
  amountPerHour: undefined,
  salaryPerPeriod: undefined,
  standardWorkingDays: 26,
  rateHoliday: 1,
  rateSpecialHoliday: 1,
  overtimeNormalDay: 1.5,
  overtimeHoliday: 2,
  overtimeSpecialHoliday: 3,
  bonuses: [],
  allowances: [],
  deductions: [],
};

export function createDefaultBonusTier(
  index = 0,
): PaysheetFormValues["bonuses"][number]["tiers"][number] {
  return {
    name: `Mức ${index + 1}`,
    fromValue: 0,
    rewardType: "PERCENTAGE",
    rewardValue: 0,
  };
}

export function createDefaultBonus(): PaysheetFormValues["bonuses"][number] {
  return {
    bonusType: "EMPLOYEE_REVENUE",
    calculationType: "GROSS_REVENUE",
    enable: false,
    tiers: [createDefaultBonusTier()],
  };
}

export function createDefaultAllowance(): PaysheetFormValues["allowances"][number] {
  return {
    name: "",
    enable: false,
    allowancesType: "FIXED_DAILY",
    amountType: "FIXED_AMOUNT",
    amountValue: 0,
  };
}

export function createDefaultDeduction(
  type: "LATE" | "EARLY_LEAVE" | "FIXED" = "LATE",
): PaysheetFormValues["deductions"][number] {
  return {
    name: type === "LATE" ? "Đi muộn" : type === "EARLY_LEAVE" ? "Về sớm" : "",
    enable: false,
    deductionType: type,
    conditionType: type === "FIXED" ? undefined : "BY_OCCURRENCE",
    blockMinutes: type === "FIXED" ? undefined : 15,
    amountType: "FIXED_AMOUNT",
    deductionValue: 0,
  };
}

function normalizeAmountByType(
  amountType: "FIXED_AMOUNT" | "PERCENTAGE",
  value: number,
): number {
  return amountType === "PERCENTAGE"
    ? normalizePercent(value)
    : (normalizeVnd(value) ?? 0);
}

export function toFormValues(row: PaySheet): PaysheetFormValues {
  const { basicPay, overtime } = row;
  return {
    name: row.name,
    payType: basicPay.payType,
    amountPerShift: basicPay.amountPerShift,
    amountPerHour: basicPay.amountPerHour,
    salaryPerPeriod: basicPay.salaryPerPeriod,
    standardWorkingDays: basicPay.standardWorkingDays ?? 26,
    rateHoliday: basicPay.rates?.holiday ?? 1,
    rateSpecialHoliday: basicPay.rates?.specialHoliday ?? 1,
    overtimeNormalDay: overtime?.normalDay ?? 1.5,
    overtimeHoliday: overtime?.holiday ?? 2,
    overtimeSpecialHoliday: overtime?.specialHoliday ?? 3,
    bonuses: (row.bonuses ?? []).map((bonus) => ({
      bonusType: bonus.bonusType,
      calculationType: bonus.calculationType,
      enable: bonus.enable ?? false,
      tiers: (bonus.tiers ?? []).map((tier) => ({
        name: tier.name ?? "",
        fromValue: tier.fromValue ?? 0,
        rewardType: tier.rewardType ?? "PERCENTAGE",
        rewardValue: tier.rewardValue ?? 0,
      })),
    })),
    allowances: (row.allowances ?? []).map((item) => ({
      name: item.name,
      enable: item.enable ?? false,
      allowancesType: item.allowancesType,
      amountType: item.amountType,
      amountValue: item.amountValue ?? 0,
    })),
    deductions: (row.deductions ?? []).map((item) => ({
      name: item.name,
      enable: item.enable ?? false,
      deductionType: item.deductionType,
      conditionType: item.conditionType,
      blockMinutes: item.blockMinutes,
      amountType: item.amountType,
      deductionValue: item.deductionValue ?? 0,
    })),
  };
}

export function buildPaySheetPayload(
  values: PaysheetFormValues,
): PaySheetPayload {
  const basicPay: PaySheetPayload["basicPay"] = {
    payType: values.payType,
    rates: {
      holiday: normalizeCoefficient(values.rateHoliday),
      specialHoliday: normalizeCoefficient(values.rateSpecialHoliday),
    },
  };

  if (values.payType === "PAY_BY_SHIFT") {
    basicPay.amountPerShift = normalizeVnd(values.amountPerShift);
  }
  if (values.payType === "PAY_BY_HOUR") {
    basicPay.amountPerHour = normalizeVnd(values.amountPerHour);
  }
  if (
    values.payType === "STANDARD_WORKING_DAY" ||
    values.payType === "FIXED"
  ) {
    basicPay.salaryPerPeriod = normalizeVnd(values.salaryPerPeriod);
  }
  if (values.payType === "STANDARD_WORKING_DAY") {
    basicPay.standardWorkingDays = values.standardWorkingDays;
  }

  return {
    name: values.name.trim(),
    basicPay,
    overtime: {
      normalDay: normalizeCoefficient(values.overtimeNormalDay),
      holiday: normalizeCoefficient(values.overtimeHoliday),
      specialHoliday: normalizeCoefficient(values.overtimeSpecialHoliday),
    },
    bonuses: values.bonuses.map((bonus) => ({
      bonusType: bonus.bonusType,
      calculationType: bonus.calculationType,
      enable: bonus.enable,
      tiers: bonus.tiers.map((tier) => ({
        name: tier.name?.trim() || undefined,
        fromValue: normalizeVnd(tier.fromValue) ?? 0,
        rewardType: tier.rewardType,
        rewardValue: normalizeAmountByType(tier.rewardType, tier.rewardValue),
      })),
    })),
    allowances: values.allowances.map((item) => ({
      name: item.name.trim(),
      enable: item.enable,
      allowancesType: item.allowancesType,
      amountType: item.amountType,
      amountValue: normalizeAmountByType(item.amountType, item.amountValue),
    })),
    deductions: values.deductions.map((item) => ({
      name: item.name.trim(),
      enable: item.enable,
      deductionType: item.deductionType,
      conditionType:
        item.deductionType === "FIXED" ? undefined : item.conditionType,
      blockMinutes:
        item.conditionType === "BY_BLOCK" ? item.blockMinutes : undefined,
      amountType: item.amountType,
      deductionValue: normalizeAmountByType(
        item.amountType,
        item.deductionValue,
      ),
    })),
  };
}

function extractFirstErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (Array.isArray(error)) {
    for (const item of error) {
      const nested = extractFirstErrorMessage(item);
      if (nested) return nested;
    }
    return undefined;
  }
  if (typeof error === "object" && error !== null) {
    for (const value of Object.values(error)) {
      const nested = extractFirstErrorMessage(value);
      if (nested) return nested;
    }
  }
  return undefined;
}

export function getFirstPaysheetFormError(
  errors: FieldErrors<PaysheetFormValues>,
): string | undefined {
  return extractFirstErrorMessage(errors);
}

export function getInvalidPaysheetTab(
  errors: FieldErrors<PaysheetFormValues>,
): "salary" | "bonus" | "allowance" | "deduction" {
  if (
    errors.name ||
    errors.amountPerShift ||
    errors.amountPerHour ||
    errors.salaryPerPeriod ||
    errors.standardWorkingDays ||
    errors.payType ||
    errors.rateHoliday ||
    errors.rateSpecialHoliday ||
    errors.overtimeNormalDay ||
    errors.overtimeHoliday ||
    errors.overtimeSpecialHoliday
  ) {
    return "salary";
  }
  if (errors.bonuses) return "bonus";
  if (errors.allowances) return "allowance";
  if (errors.deductions) return "deduction";
  return "salary";
}
