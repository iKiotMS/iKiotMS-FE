"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  calculateLeaveDays,
  combineLeaveDateTime,
  todayIsoDate,
} from "@/lib/api/leave-request-mapper";
import { useAuth } from "@/hooks/use-auth";
import { useLeaveRequests } from "./leave-requests-provider";

const emergencyLeaveSchema = z
  .object({
    userId: z.string().min(1, "Vui lòng chọn nhân viên"),
    reason: z.string().min(3, "Lý do nghỉ tối thiểu 3 ký tự"),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    endTime: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
    approveImmediately: z.boolean(),
    paidLeaveDays: z.number().min(0, "Không được âm"),
    unpaidLeaveDays: z.number().min(0, "Không được âm"),
    reviewNote: z.string().optional(),
  })
  .refine(
    (values) =>
      new Date(combineLeaveDateTime(values.startDate, values.startTime)) <=
      new Date(combineLeaveDateTime(values.endDate, values.endTime)),
    {
      message: "Thời điểm bắt đầu phải trước hoặc bằng thời điểm kết thúc",
      path: ["endTime"],
    },
  )
  .refine(
    (values) => {
      if (!values.approveImmediately) return true;
      return values.paidLeaveDays + values.unpaidLeaveDays > 0;
    },
    {
      message: "Tổng ngày có lương + không lương phải lớn hơn 0",
      path: ["paidLeaveDays"],
    },
  );

type EmergencyLeaveFormValues = z.infer<typeof emergencyLeaveSchema>;

const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "17:00";

function buildEmptyValues(
  staffOptions: { value: string; label: string }[],
): EmergencyLeaveFormValues {
  const today = todayIsoDate();
  return {
    userId: staffOptions[0]?.value ?? "",
    reason: "",
    startDate: today,
    startTime: DEFAULT_START_TIME,
    endDate: today,
    endTime: DEFAULT_END_TIME,
    approveImmediately: false,
    paidLeaveDays: 1,
    unpaidLeaveDays: 0,
    reviewNote: "",
  };
}

export function LeaveRequestsEmergencyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { user } = useAuth();
  const { handleCreateEmergency, staffOptions } = useLeaveRequests();
  const isBranchManager = user?.role === "BRANCH_MANAGER";

  const form = useForm<EmergencyLeaveFormValues>({
    resolver: zodResolver(emergencyLeaveSchema),
    defaultValues: buildEmptyValues(staffOptions),
  });

  const approveImmediately = form.watch("approveImmediately");
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const totalDays = calculateLeaveDays(startDate || todayIsoDate(), endDate || todayIsoDate());

  useEffect(() => {
    if (open) form.reset(buildEmptyValues(staffOptions));
  }, [open, form, staffOptions]);

  useEffect(() => {
    if (!approveImmediately) return;
    form.setValue("paidLeaveDays", totalDays);
    form.setValue("unpaidLeaveDays", 0);
  }, [approveImmediately, totalDays, form]);

  async function onSubmit(values: EmergencyLeaveFormValues) {
    if (
      values.approveImmediately &&
      values.paidLeaveDays + values.unpaidLeaveDays > totalDays
    ) {
      form.setError("paidLeaveDays", {
        message: `Tổng ngày duyệt không được vượt quá ${totalDays} ngày xin nghỉ`,
      });
      return;
    }

    try {
      await handleCreateEmergency(
        {
          userId: values.userId,
          startDate: combineLeaveDateTime(values.startDate, values.startTime),
          endDate: combineLeaveDateTime(values.endDate, values.endTime),
          reason: values.reason,
        },
        values.approveImmediately
          ? {
              approveImmediately: {
                paidLeaveDays: values.paidLeaveDays,
                unpaidLeaveDays: values.unpaidLeaveDays,
                reviewNote: values.reviewNote,
              },
            }
          : undefined,
      );
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
            {isBranchManager
              ? "Tạo đơn thay cho nhân viên (ví dụ gọi điện / nhắn tin báo nghỉ). Có thể duyệt ngay sau khi tạo."
              : "Tenant Owner tạo đơn nghỉ khẩn cho quản lý / nhân viên thuộc quyền quản lý."}
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
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ kết thúc</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
                    <Textarea
                      placeholder="Nhập lý do nghỉ phép"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isBranchManager && (
              <FormField
                control={form.control}
                name="approveImmediately"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="cursor-pointer">
                        Tạo và duyệt ngay
                      </FormLabel>
                      <FormDescription>
                        Dùng khi nhân viên gọi/nhắn báo nghỉ và bạn xác nhận
                        luôn.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {approveImmediately && (
              <div className="grid grid-cols-2 gap-4 rounded-md border p-3">
                <FormField
                  control={form.control}
                  name="paidLeaveDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày có lương</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value || 0))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unpaidLeaveDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày không lương</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value || 0))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reviewNote"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Ghi chú duyệt (tuỳ chọn)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ghi chú..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="col-span-2 text-xs text-muted-foreground">
                  Tổng ngày xin nghỉ: {totalDays} ngày. Tổng có lương + không
                  lương phải ≤ {totalDays}.
                </p>
              </div>
            )}

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
                {approveImmediately ? "Tạo & duyệt" : "Tạo đơn"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
