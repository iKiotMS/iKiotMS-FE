"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Payslip } from "@/types/payslip";
import { BRANCH_OPTIONS, STAFF_OPTIONS, usePayroll } from "./payroll-provider";

const payrollFormSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn nhân viên"),
  branchId: z.string().min(1, "Vui lòng chọn chi nhánh"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  baseSalary: z.number().min(0),
  totalHours: z.number().min(0),
  bonus: z.number().min(0),
  earnings: z.array(
    z.object({
      label: z.string().min(1, "Nhập tên khoản cộng"),
      amount: z.number().min(0),
    }),
  ),
  deductions: z.array(
    z.object({
      label: z.string().min(1, "Nhập tên khoản trừ"),
      amount: z.number().min(0),
    }),
  ),
  status: z.enum(["DRAFT", "PENDING", "PAID", "CANCELLED"]),
  note: z.string().optional(),
});

type PayrollFormValues = z.infer<typeof payrollFormSchema>;

const now = new Date();
const EMPTY_VALUES: PayrollFormValues = {
  userId: "staff-001",
  branchId: "branch-1",
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  baseSalary: 9000000,
  totalHours: 176,
  bonus: 0,
  earnings: [{ label: "Phụ cấp", amount: 0 }],
  deductions: [{ label: "Bảo hiểm", amount: 0 }],
  status: "DRAFT",
  note: "",
};

export function PayrollMutateDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  currentRow?: Payslip;
}) {
  const isEdit = !!currentRow;
  const { handleAdd, handleEdit } = usePayroll();

  const form = useForm<PayrollFormValues>({
    resolver: zodResolver(payrollFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const earningsArray = useFieldArray({
    control: form.control,
    name: "earnings",
  });
  const deductionsArray = useFieldArray({
    control: form.control,
    name: "deductions",
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && currentRow) {
      form.reset({
        userId: currentRow.userId,
        branchId: currentRow.branchId,
        month: currentRow.month,
        year: currentRow.year,
        baseSalary: currentRow.baseSalary,
        totalHours: currentRow.totalHours,
        bonus: currentRow.bonus,
        earnings: currentRow.earnings.length
          ? currentRow.earnings
          : [{ label: "Phụ cấp", amount: 0 }],
        deductions: currentRow.deductions.length
          ? currentRow.deductions
          : [{ label: "Bảo hiểm", amount: 0 }],
        status: currentRow.status,
        note: currentRow.note ?? "",
      });
    } else {
      form.reset(EMPTY_VALUES);
    }
  }, [open, isEdit, currentRow, form]);

  async function onSubmit(values: PayrollFormValues) {
    if (isEdit && currentRow) {
      await handleEdit(currentRow._id, values);
    } else {
      await handleAdd(values);
    }
    onOpenChange(false);
  }

  const values = form.watch();
  const netPay =
    (values.baseSalary || 0) +
    (values.bonus || 0) +
    values.earnings.reduce((sum, item) => sum + (item.amount || 0), 0) -
    values.deductions.reduce((sum, item) => sum + (item.amount || 0), 0);

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Điều chỉnh bảng lương" : "Tạo bảng lương"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Điều chỉnh thủ công khoản cộng/trừ và trạng thái bảng lương."
              : "Tạo mới bảng lương cho nhân viên theo kỳ lương."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhân viên</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Chọn nhân viên" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAFF_OPTIONS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chi nhánh</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Chọn chi nhánh" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BRANCH_OPTIONS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tháng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2020}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ công</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Nháp</SelectItem>
                        <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                        <SelectItem value="PAID">Đã thanh toán</SelectItem>
                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="baseSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lương cơ bản</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bonus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thưởng thêm</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Khoản cộng</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => earningsArray.append({ label: "", amount: 0 })}
                >
                  <Plus className="mr-2 size-4" />
                  Thêm khoản cộng
                </Button>
              </div>
              {earningsArray.fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="grid grid-cols-12 gap-2">
                  <FormField
                    control={form.control}
                    name={`earnings.${index}.label`}
                    render={({ field }) => (
                      <FormItem className="col-span-7">
                        <FormControl>
                          <Input placeholder="Tên khoản cộng" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`earnings.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className="col-span-4">
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="col-span-1 cursor-pointer text-destructive"
                    onClick={() => earningsArray.remove(index)}
                    disabled={earningsArray.fields.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Khoản trừ</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => deductionsArray.append({ label: "", amount: 0 })}
                >
                  <Plus className="mr-2 size-4" />
                  Thêm khoản trừ
                </Button>
              </div>
              {deductionsArray.fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="grid grid-cols-12 gap-2">
                  <FormField
                    control={form.control}
                    name={`deductions.${index}.label`}
                    render={({ field }) => (
                      <FormItem className="col-span-7">
                        <FormControl>
                          <Input placeholder="Tên khoản trừ" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`deductions.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className="col-span-4">
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="col-span-1 cursor-pointer text-destructive"
                    onClick={() => deductionsArray.remove(index)}
                    disabled={deductionsArray.fields.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ghi chú bảng lương..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lương thực nhận</span>
                <span className="font-semibold">{formatVND(netPay)}</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" className="cursor-pointer">
                {isEdit ? (
                  <>
                    <Pencil className="mr-2 size-4" />
                    Lưu điều chỉnh
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 size-4" />
                    Tạo bảng lương
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
