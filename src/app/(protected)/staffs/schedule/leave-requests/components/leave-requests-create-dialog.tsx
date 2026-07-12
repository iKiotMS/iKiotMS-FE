"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeaveRequests } from "./leave-requests-provider";

const leaveRequestFormSchema = z
  .object({
    userId: z.string().min(1, "Vui lòng chọn nhân viên"),
    leaveType: z.enum(["SICK", "UNPAID", "ANNUAL", "OTHER"]),
    reason: z.string().min(3, "Lý do nghỉ tối thiểu 3 ký tự"),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  })
  .refine((values) => new Date(values.startDate) <= new Date(values.endDate), {
    message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc",
    path: ["endDate"],
  });

type LeaveRequestFormValues = z.infer<typeof leaveRequestFormSchema>;

function buildEmptyValues(
  staffOptions: { value: string; label: string }[],
): LeaveRequestFormValues {
  const today = new Date().toISOString().split("T")[0];
  return {
    userId: staffOptions[0]?.value ?? "",
    leaveType: "UNPAID",
    reason: "",
    startDate: today,
    endDate: today,
  };
}

export function LeaveRequestsCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { handleCreate, staffOptions } = useLeaveRequests();
  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: buildEmptyValues(staffOptions),
  });

  useEffect(() => {
    if (open) form.reset(buildEmptyValues(staffOptions));
  }, [open, form, staffOptions]);

  async function onSubmit(values: LeaveRequestFormValues) {
    try {
      await handleCreate(values);
      onOpenChange(false);
    } catch {
      // toast handled in provider
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tạo đơn nghỉ phép khẩn</DialogTitle>
          <DialogDescription>
            Quản lý tạo đơn nghỉ phép thay cho nhân viên khi cần xử lý khẩn cấp.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      {staffOptions.length === 0 ? (
                        <SelectItem value="__empty" disabled>
                          Không có nhân viên
                        </SelectItem>
                      ) : (
                        staffOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại nghỉ</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Chọn loại nghỉ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SICK">Ốm đau</SelectItem>
                      <SelectItem value="UNPAID">Nghỉ không lương</SelectItem>
                      <SelectItem value="ANNUAL">Nghỉ phép năm</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Từ ngày</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đến ngày</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập lý do nghỉ phép" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={staffOptions.length === 0}
              >
                <Plus className="mr-2 size-4" />
                Tạo đơn
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
