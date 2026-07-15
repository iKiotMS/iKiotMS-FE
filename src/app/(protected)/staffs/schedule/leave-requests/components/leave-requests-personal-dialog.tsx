"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { leaveRequestApi } from "@/lib/api/leave-request";
import {
  combineLeaveDateTime,
  todayIsoDate,
} from "@/lib/api/leave-request-mapper";
import { useAuth } from "@/hooks/use-auth";
import { useLeaveRequests } from "./leave-requests-provider";

const personalLeaveSchema = z
  .object({
    reason: z.string().min(3, "Lý do nghỉ tối thiểu 3 ký tự"),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    endTime: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
    handoverToUserId: z.string().optional(),
  })
  .refine(
    (values) =>
      new Date(combineLeaveDateTime(values.startDate, values.startTime)) <=
      new Date(combineLeaveDateTime(values.endDate, values.endTime)),
    {
      message: "Thời điểm bắt đầu phải trước hoặc bằng thời điểm kết thúc",
      path: ["endTime"],
    },
  );

type PersonalLeaveFormValues = z.infer<typeof personalLeaveSchema>;

const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "17:00";

export function LeaveRequestsPersonalDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { user } = useAuth();
  const { handleCreatePersonal, handoverOptions, balance } = useLeaveRequests();
  const role = user?.role;
  /** BR luôn bắt buộc gán staff thay thế tạm. WH vẫn theo preview lịch. */
  const isBranchManager = role === "BRANCH_MANAGER";
  const isWarehouseManager = role === "WAREHOUSE_MANAGER";
  const needsHandoverPicker = isBranchManager || isWarehouseManager;

  const [scheduleHandoverRequired, setScheduleHandoverRequired] = useState(false);
  const [handoverCount, setHandoverCount] = useState(0);
  const [checkingHandover, setCheckingHandover] = useState(false);

  const requiresHandover = isBranchManager || scheduleHandoverRequired;
  const staffHandoverOptions = handoverOptions;

  const form = useForm<PersonalLeaveFormValues>({
    resolver: zodResolver(personalLeaveSchema),
    defaultValues: {
      reason: "",
      startDate: todayIsoDate(),
      startTime: DEFAULT_START_TIME,
      endDate: todayIsoDate(),
      endTime: DEFAULT_END_TIME,
      handoverToUserId: "",
    },
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  useEffect(() => {
    if (open) {
      form.reset({
        reason: "",
        startDate: todayIsoDate(),
        startTime: DEFAULT_START_TIME,
        endDate: todayIsoDate(),
        endTime: DEFAULT_END_TIME,
        handoverToUserId: "",
      });
      setScheduleHandoverRequired(false);
      setHandoverCount(0);
    }
  }, [open, form]);

  useEffect(() => {
    if (!open || !needsHandoverPicker || !startDate || !endDate) return;
    const startIso = combineLeaveDateTime(
      startDate,
      startTime || DEFAULT_START_TIME,
    );
    const endIso = combineLeaveDateTime(endDate, endTime || DEFAULT_END_TIME);
    if (new Date(startIso) > new Date(endIso)) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setCheckingHandover(true);
      try {
        const preview = await leaveRequestApi.previewHandover(startIso, endIso);
        if (cancelled) return;
        setScheduleHandoverRequired(preview.requiresHandover);
        setHandoverCount(preview.count);
        // BR luôn giữ lựa chọn staff; WH mới clear khi không cần bàn giao lịch.
        if (!isBranchManager && !preview.requiresHandover) {
          form.setValue("handoverToUserId", "");
        }
      } catch {
        if (!cancelled) {
          setScheduleHandoverRequired(false);
          setHandoverCount(0);
        }
      } finally {
        if (!cancelled) setCheckingHandover(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    open,
    needsHandoverPicker,
    isBranchManager,
    startDate,
    endDate,
    startTime,
    endTime,
    form,
  ]);

  async function onSubmit(values: PersonalLeaveFormValues) {
    if (requiresHandover && !values.handoverToUserId) {
      form.setError("handoverToUserId", {
        message: isBranchManager
          ? "Vui lòng chọn nhân viên thay thế tạm trong thời gian nghỉ"
          : "Vui lòng chọn nhân viên nhận bàn giao lịch",
      });
      return;
    }

    try {
      await handleCreatePersonal({
        startDate: combineLeaveDateTime(values.startDate, values.startTime),
        endDate: combineLeaveDateTime(values.endDate, values.endTime),
        reason: values.reason,
        handoverToUserId: values.handoverToUserId || undefined,
      });
      onOpenChange(false);
    } catch {
      // toast handled in provider
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Xin nghỉ phép</DialogTitle>
        </DialogHeader>

        {balance && (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
            Phép năm còn lại:{" "}
            <span className="font-semibold">
              {balance.remainingDays}/{balance.annualLeaveDays}
            </span>{" "}
            ngày (đã dùng {balance.usedDays})
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {needsHandoverPicker && (
              <FormField
                control={form.control}
                name="handoverToUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isBranchManager
                        ? "Nhân viên thay thế tạm *"
                        : `Nhân viên nhận bàn giao${requiresHandover ? " *" : ""}`}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={
                        checkingHandover ||
                        (!isBranchManager && !requiresHandover)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue
                            placeholder={
                              checkingHandover
                                ? "Đang kiểm tra lịch..."
                                : isBranchManager
                                  ? "Chọn Staff cùng chi nhánh thay thế tạm"
                                  : requiresHandover
                                    ? "Chọn nhân viên bàn giao"
                                    : "Không cần bàn giao"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffHandoverOptions.length === 0 ? (
                          <SelectItem value="__empty" disabled>
                            Không có nhân viên phù hợp
                          </SelectItem>
                        ) : (
                          staffHandoverOptions.map((item) => (
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
                disabled={
                  isBranchManager && staffHandoverOptions.length === 0
                }
              >
                <Plus className="mr-2 size-4" />
                Gửi đơn
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
