"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
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
import { useTenantsContext } from "./tenants-provider";

const schema = z.object({
  ownerName: z.string().min(1, "Vui lòng nhập tên chủ sở hữu"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  businessName: z.string().min(1, "Vui lòng nhập tên cửa hàng"),
});

type FormValues = z.infer<typeof schema>;

export function TenantsEditDialog() {
  const { open, setOpen, currentRow, reload } = useTenantsContext();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ownerName: "", email: "", phone: "", businessName: "" },
  });

  useEffect(() => {
    if (currentRow && open === "edit") {
      form.reset({
        ownerName: currentRow.ownerName,
        email: currentRow.email,
        phone: currentRow.phone,
        businessName: currentRow.businessName,
      });
    }
  }, [currentRow, open, form]);

  const onSubmit = async (values: FormValues) => {
    if (!currentRow) return;
    try {
      await adminApi.updateTenant(currentRow._id, values);
      toast.success("Cập nhật tenant thành công!");
      setOpen(null);
      reload();
    } catch {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog open={open === "edit"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Tenant</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên cửa hàng</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên cửa hàng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chủ sở hữu</FormLabel>
                  <FormControl>
                    <Input placeholder="Họ và tên" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="09xxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(null)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
