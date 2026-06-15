"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { payslipApi } from "@/lib/api/payslip";
import type {
  CreatePayslipPayload,
  GeneratePayrollPayload,
  Payslip,
  UpdatePayslipPayload,
} from "@/types/payslip";

type PayrollDialogType = "add" | "edit" | "delete" | "generate";

type PayrollContextType = {
  payslips: Payslip[];
  isLoading: boolean;
  open: PayrollDialogType | null;
  setOpen: (value: PayrollDialogType | null) => void;
  currentRow: Payslip | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Payslip | null>>;
  fetchPayslips: () => Promise<void>;
  handleAdd: (payload: CreatePayslipPayload) => Promise<void>;
  handleEdit: (id: string, payload: UpdatePayslipPayload) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleGenerate: (payload: GeneratePayrollPayload) => Promise<void>;
};

const PayrollContext = React.createContext<PayrollContextType | null>(null);

export function PayrollProvider({ children }: { children: React.ReactNode }) {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState<PayrollDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<Payslip | null>(null);
  const mockData = useMemo(() => MOCK_PAYSLIPS, []);

  const fetchPayslips = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await payslipApi.getList({ page: 1, limit: 100 });
      setPayslips(response?.data ?? []);
    } catch {
      setPayslips(mockData);
    } finally {
      setIsLoading(false);
    }
  }, [mockData]);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  async function handleAdd(payload: CreatePayslipPayload) {
    try {
      await payslipApi.create(payload);
      toast.success("Đã tạo bảng lương");
      await fetchPayslips();
    } catch {
      const branchName = BRANCH_MAP[payload.branchId] ?? "Không xác định";
      const staffName = STAFF_MAP[payload.userId] ?? "Nhân viên";
      const earnings = payload.earnings ?? [];
      const deductions = payload.deductions ?? [];
      const bonus = payload.bonus ?? 0;
      const totalEarnings =
        payload.baseSalary + bonus + earnings.reduce((sum, item) => sum + item.amount, 0);
      const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
      const now = new Date().toISOString();

      const fallback: Payslip = {
        _id: Date.now().toString(),
        tenantId: "tenant-1",
        userId: payload.userId,
        staffName,
        branchId: payload.branchId,
        branchName,
        month: payload.month,
        year: payload.year,
        baseSalary: payload.baseSalary,
        totalHours: payload.totalHours,
        earnings,
        deductions,
        bonus,
        netPay: totalEarnings - totalDeductions,
        status: "DRAFT",
        note: payload.note,
        createdAt: now,
        updatedAt: now,
      };
      setPayslips((prev) => [fallback, ...prev]);
      toast.success("Đã tạo bảng lương (mock mode)");
    }
  }

  async function handleEdit(id: string, payload: UpdatePayslipPayload) {
    try {
      await payslipApi.update(id, payload);
      toast.success("Đã cập nhật bảng lương");
      await fetchPayslips();
    } catch {
      setPayslips((prev) =>
        prev.map((item) => {
          if (item._id !== id) return item;
          const baseSalary = payload.baseSalary ?? item.baseSalary;
          const bonus = payload.bonus ?? item.bonus;
          const earnings = payload.earnings ?? item.earnings;
          const deductions = payload.deductions ?? item.deductions;
          const totalEarnings =
            baseSalary + bonus + earnings.reduce((sum, entry) => sum + entry.amount, 0);
          const totalDeductions = deductions.reduce(
            (sum, entry) => sum + entry.amount,
            0,
          );
          return {
            ...item,
            ...payload,
            baseSalary,
            bonus,
            earnings,
            deductions,
            netPay: totalEarnings - totalDeductions,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
      toast.success("Đã cập nhật bảng lương (mock mode)");
    }
  }

  async function handleDelete(id: string) {
    try {
      await payslipApi.remove(id);
      toast.success("Đã xóa bảng lương");
      await fetchPayslips();
    } catch {
      setPayslips((prev) => prev.filter((item) => item._id !== id));
      toast.success("Đã xóa bảng lương (mock mode)");
    }
  }

  async function handleGenerate(payload: GeneratePayrollPayload) {
    try {
      await payslipApi.generate(payload);
      toast.success("Đã tạo bảng lương tự động");
      await fetchPayslips();
    } catch {
      const now = new Date().toISOString();
      const generated: Payslip[] = STAFF_OPTIONS.filter(
        (staff) => !payload.branchId || staff.branchId === payload.branchId,
      ).map((staff, index) => {
        const baseSalary = 9000000 + index * 500000;
        const bonus = 500000;
        const deductions = [{ label: "Bảo hiểm", amount: 300000 }];
        const netPay = baseSalary + bonus - 300000;
        return {
          _id: `${Date.now()}-${index}`,
          tenantId: "tenant-1",
          userId: staff.value,
          staffName: staff.label,
          branchId: staff.branchId,
          branchName: BRANCH_MAP[staff.branchId] ?? "Không xác định",
          month: payload.month,
          year: payload.year,
          baseSalary,
          totalHours: 176,
          earnings: [{ label: "Phụ cấp", amount: bonus }],
          deductions,
          bonus,
          netPay,
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        };
      });
      setPayslips((prev) => [...generated, ...prev]);
      toast.success("Đã tạo bảng lương tự động (mock mode)");
    }
  }

  return (
    <PayrollContext.Provider
      value={{
        payslips,
        isLoading,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        fetchPayslips,
        handleAdd,
        handleEdit,
        handleDelete,
        handleGenerate,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
}

export function usePayroll() {
  const ctx = React.useContext(PayrollContext);
  if (!ctx) throw new Error("usePayroll must be used within <PayrollProvider>");
  return ctx;
}

export const STAFF_OPTIONS = [
  { value: "staff-001", label: "Nguyễn An", branchId: "branch-1" },
  { value: "staff-002", label: "Trần Bình", branchId: "branch-2" },
  { value: "staff-003", label: "Lê Chi", branchId: "branch-3" },
] as const;

export const BRANCH_OPTIONS = [
  { value: "branch-1", label: "Chi nhánh Quận 1" },
  { value: "branch-2", label: "Chi nhánh Quận 3" },
  { value: "branch-3", label: "Chi nhánh Gò Vấp" },
] as const;

const STAFF_MAP = Object.fromEntries(
  STAFF_OPTIONS.map((item) => [item.value, item.label]),
);
const BRANCH_MAP = Object.fromEntries(
  BRANCH_OPTIONS.map((item) => [item.value, item.label]),
);

const MOCK_PAYSLIPS: Payslip[] = [
  {
    _id: "pay-001",
    tenantId: "tenant-1",
    userId: "staff-001",
    staffName: "Nguyễn An",
    branchId: "branch-1",
    branchName: "Chi nhánh Quận 1",
    month: 6,
    year: 2026,
    baseSalary: 9000000,
    totalHours: 178,
    earnings: [{ label: "Thưởng doanh số", amount: 1200000 }],
    deductions: [{ label: "Bảo hiểm", amount: 350000 }],
    bonus: 500000,
    netPay: 10350000,
    status: "PENDING",
    note: "Đạt KPI tháng",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "pay-002",
    tenantId: "tenant-1",
    userId: "staff-002",
    staffName: "Trần Bình",
    branchId: "branch-2",
    branchName: "Chi nhánh Quận 3",
    month: 6,
    year: 2026,
    baseSalary: 9500000,
    totalHours: 176,
    earnings: [{ label: "Phụ cấp kho", amount: 800000 }],
    deductions: [{ label: "Bảo hiểm", amount: 350000 }],
    bonus: 300000,
    netPay: 10250000,
    status: "PAID",
    paidAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
