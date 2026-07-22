"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { attendanceApi } from "@/lib/api/attendance";
import { getApiErrorMessage } from "@/lib/api/staff-mapper";

const formSchema = z.object({
  actualCheckinAt: z.string(),
  actualCheckoutAt: z.string(),
  reason: z.string().trim().min(1, "Vui lòng nhập lý do").max(500),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  scheduleId: string;
  userId: string;
  mode: "attendance" | "absent";
  onSaved: () => Promise<void> | void;
};

export function CreateManualAttendanceDialog({
  scheduleId,
  userId,
  mode,
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const isAbsent = mode === "absent";
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { actualCheckinAt: "", actualCheckoutAt: "", reason: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!isAbsent && !values.actualCheckinAt) {
      form.setError("actualCheckinAt", {
        message: "Vui lòng chọn giờ check-in",
      });
      return;
    }
    const checkin = isAbsent ? null : new Date(values.actualCheckinAt);
    const checkout = values.actualCheckoutAt
      ? new Date(values.actualCheckoutAt)
      : null;

    if (!isAbsent && checkin && checkin > new Date()) {
      form.setError("actualCheckinAt", { message: "Giờ không thể ở tương lai" });
      return;
    }
    if (checkout && checkin && checkout <= checkin) {
      form.setError("actualCheckoutAt", {
        message: "Checkout phải sau check-in",
      });
      return;
    }
    if (checkout && checkout > new Date()) {
      form.setError("actualCheckoutAt", { message: "Giờ không thể ở tương lai" });
      return;
    }

    try {
      await attendanceApi.createManual({
        scheduleId,
        userId,
        status: isAbsent ? "ABSENT" : checkout ? "CHECKED_OUT" : "CHECKED_IN",
        actualCheckinAt: checkin?.toISOString(),
        actualCheckoutAt: checkout?.toISOString(),
        reason: values.reason.trim(),
      });
      toast.success(isAbsent ? "Đã đánh dấu vắng" : "Đã tạo chấm công");
      setOpen(false);
      form.reset();
      await onSaved();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={isAbsent ? "destructive" : "outline"}
        >
          {isAbsent ? "Đánh dấu vắng" : "Tạo chấm công thủ công"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAbsent ? "Đánh dấu nhân viên vắng" : "Tạo chấm công thủ công"}
          </DialogTitle>
          <DialogDescription>
            Thao tác sẽ được lưu đầy đủ người thực hiện và lý do.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {!isAbsent && (
              <>
                <FormField
                  control={form.control}
                  name="actualCheckinAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ check-in</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actualCheckoutAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ check-out (không bắt buộc)</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập lý do xử lý thủ công" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Đang lưu..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
