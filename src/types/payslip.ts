export type PayslipStatus = "DRAFT" | "PENDING" | "PAID" | "CANCELLED";

export interface PayslipEarning {
  label: string;
  amount: number;
}

export interface PayslipDeduction {
  label: string;
  amount: number;
}

export interface Payslip {
  _id: string;
  tenantId: string;
  userId: string;
  staffName: string;
  branchId: string;
  branchName: string;
  month: number;
  year: number;
  baseSalary: number;
  totalHours: number;
  earnings: PayslipEarning[];
  deductions: PayslipDeduction[];
  bonus: number;
  netPay: number;
  status: PayslipStatus;
  note?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayslipQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  branchId?: string;
  month?: number;
  year?: number;
  status?: PayslipStatus;
}

export interface PayslipListResponse {
  data: Payslip[];
  total: number;
  page: number;
  limit: number;
}

export interface GeneratePayrollPayload {
  month: number;
  year: number;
  branchId?: string;
}

export interface CreatePayslipPayload {
  userId: string;
  branchId: string;
  month: number;
  year: number;
  baseSalary: number;
  totalHours: number;
  bonus?: number;
  earnings?: PayslipEarning[];
  deductions?: PayslipDeduction[];
  note?: string;
}

export interface UpdatePayslipPayload {
  baseSalary?: number;
  totalHours?: number;
  bonus?: number;
  earnings?: PayslipEarning[];
  deductions?: PayslipDeduction[];
  status?: PayslipStatus;
  note?: string;
}
