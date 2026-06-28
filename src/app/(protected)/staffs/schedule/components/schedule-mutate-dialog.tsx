"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
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
import type { WorkingSchedule } from "@/types/working-schedule";
import { isScheduleLocked } from "@/app/(protected)/staffs/shared/schedule-utils";
import { useSchedule } from "./schedule-provider";

const scheduleFormSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn nhân viên"),
  shiftTemplateId: z.string().min(1, "Vui lòng chọn ca làm"),
  workDate: z.string().min(1, "Vui lòng chọn ngày"),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export function ScheduleMutateDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  currentRow?: WorkingSchedule;
}) {
  const isEdit = !!currentRow;
  const isLocked = isEdit && currentRow ? isScheduleLocked(currentRow.status) : false;
  const { handleAdd, handleEdit, shiftTemplateOptions, staffOptions, setOpen } =
    useSchedule();

  const staffSelectOptions =
    isEdit && currentRow
      ? staffOptions.some((o) => o.value === currentRow.userId)
        ? staffOptions
        : [
            {
              value: currentRow.userId,
              label: `${currentRow.staffName} (hiện tại)`,
            },
            ...staffOptions,
          ]
      : staffOptions;

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      userId: "",
      shiftTemplateId: "",
      workDate: new Date().toISOString().split("T")[0],
      status: "SCHEDULED",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && currentRow) {
      form.reset({
        userId: currentRow.userId,
        shiftTemplateId: currentRow.shiftTemplateId,
        workDate: currentRow.workDate,
        status: currentRow.status,
      });
    } else {
      form.reset({
        userId: "",
        shiftTemplateId: "",
        workDate: new Date().toISOString().split("T")[0],
        status: "SCHEDULED",
      });
    }
  }, [open, isEdit, currentRow, form]);

  async function onSubmit(values: ScheduleFormValues) {
    if (isLocked) return;
    try {
      if (isEdit && currentRow) {
        await handleEdit(currentRow._id, {
          userId: values.userId,
          shiftTemplateId: values.shiftTemplateId,
          workDate: values.workDate,
          status: values.status,
        });
      } else {
        await handleAdd({
          userId: values.userId,
          shiftTemplateId: values.shiftTemplateId,
          workDate: values.workDate,
        });
      }
      onOpenChange(false);
    } catch {
      // Toast handled in provider
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa lịch làm" : "Phân ca làm việc"}
          </DialogTitle>
          <DialogDescription>
            {isLocked
              ? "Lịch đã hoàn thành — không thể chỉnh sửa theo quy tắc hệ thống."
              : isEdit
                ? "Cập nhật ca làm và trạng thái của nhân viên."
                : "Tạo lịch làm mới theo ca cho nhân viên đang hoạt động."}
          </DialogDescription>
        </DialogHeader>

        {isLocked ? (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>Nhân viên</FormLabel>
                  {staffSelectOptions.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full min-w-0 overflow-hidden">
                          <SelectValue placeholder="Chọn nhân viên" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffSelectOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl>
                      <Input placeholder="Nhập ID nhân viên" {...field} />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workDate"
              render={({ field }) => (
                <FormItem className="min-w-0 sm:max-w-[240px]">
                  <FormLabel>Ngày làm</FormLabel>
                  <FormControl>
                    <Input type="date" className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shiftTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ca làm</FormLabel>
                  {shiftTemplateOptions.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Chọn ca làm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shiftTemplateOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-2">
                      Chưa có ca mẫu.{" "}
                      <button
                        type="button"
                        className="text-primary underline cursor-pointer"
                        onClick={() => {
                          onOpenChange(false);
                          setOpen("shiftTemplate");
                        }}
                      >
                        Tạo ca mẫu
                      </button>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "SCHEDULED"}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SCHEDULED">Đã phân ca</SelectItem>
                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
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
                  form.formState.isSubmitting ||
                  (!isEdit && shiftTemplateOptions.length === 0)
                }
              >
                {isEdit ? (
                  <>
                    <Pencil className="mr-2 size-4" />
                    Lưu thay đổi
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 size-4" />
                    Phân ca
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
