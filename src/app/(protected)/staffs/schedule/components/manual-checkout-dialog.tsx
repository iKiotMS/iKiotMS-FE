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
  actualCheckoutAt: z.string().min(1, "Vui lòng chọn giờ check-out"),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do điều chỉnh")
    .max(500, "Lý do không được vượt quá 500 ký tự"),
});

type FormValues = z.infer<typeof formSchema>;

type ManualCheckoutDialogProps = {
  attendanceId: string;
  checkinAt?: string | null;
  onSaved: () => Promise<void> | void;
};

export function ManualCheckoutDialog({
  attendanceId,
  checkinAt,
  onSaved,
}: ManualCheckoutDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { actualCheckoutAt: "", reason: "" },
  });

  async function onSubmit(values: FormValues) {
    const checkout = new Date(values.actualCheckoutAt);
    if (checkinAt && checkout <= new Date(checkinAt)) {
      form.setError("actualCheckoutAt", {
        message: "Giờ check-out phải sau giờ check-in",
      });
      return;
    }
    if (checkout > new Date()) {
      form.setError("actualCheckoutAt", {
        message: "Giờ check-out không thể ở tương lai",
      });
      return;
    }

    try {
      await attendanceApi.manualCheckout(attendanceId, {
        actualCheckoutAt: checkout.toISOString(),
        reason: values.reason.trim(),
      });
      toast.success("Đã bổ sung giờ check-out");
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
        <Button type="button" size="sm" variant="outline">
          Bổ sung checkout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bổ sung giờ check-out</DialogTitle>
          <DialogDescription>
            Thao tác này được lưu tên người sửa, thời gian sửa và lý do.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="actualCheckoutAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giờ check-out</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do điều chỉnh</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ví dụ: Nhân viên quên check-out cuối ca"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
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
