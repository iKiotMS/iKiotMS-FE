"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTiersContext } from "./tiers-provider";

const featureSchema = z.object({
  name: z.string().min(1, "Nhập tên tính năng"),
  included: z.boolean(),
  limit: z.coerce.number().optional(),
});

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên gói"),
  description: z.string().min(1, "Vui lòng nhập mô tả"),
  priceMonthly: z.coerce.number().min(0, "Giá không hợp lệ"),
  priceYearly: z.coerce.number().min(0, "Giá không hợp lệ"),
  maxBranches: z.coerce.number().min(1, "Tối thiểu 1 chi nhánh"),
  maxStaff: z.coerce.number().min(1, "Tối thiểu 1 nhân viên"),
  isActive: z.boolean(),
  features: z.array(featureSchema),
});

type FormValues = z.infer<typeof schema>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function TiersMutateDialog() {
  const { open, setOpen, currentRow, reload } = useTiersContext();
  const isEdit = open === "edit";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      priceMonthly: 0,
      priceYearly: 0,
      maxBranches: 1,
      maxStaff: 10,
      isActive: true,
      features: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  useEffect(() => {
    if (isEdit && currentRow) {
      form.reset({
        name: currentRow.name,
        description: currentRow.description,
        priceMonthly: currentRow.priceMonthly,
        priceYearly: currentRow.priceYearly,
        maxBranches: currentRow.maxBranches,
        maxStaff: currentRow.maxStaff,
        isActive: currentRow.isActive,
        features: currentRow.features,
      });
    } else if (open === "create") {
      form.reset({
        name: "",
        description: "",
        priceMonthly: 0,
        priceYearly: 0,
        maxBranches: 1,
        maxStaff: 10,
        isActive: true,
        features: [],
      });
    }
  }, [open, currentRow, isEdit, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && currentRow) {
        await adminApi.updateTier(currentRow._id, values);
        toast.success("Cập nhật gói dịch vụ thành công!");
      } else {
        await adminApi.createTier(values);
        toast.success("Tạo gói dịch vụ thành công!");
      }
      setOpen(null);
      reload();
    } catch {
      toast.error("Thao tác thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog open={open === "create" || open === "edit"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa gói dịch vụ" : "Tạo gói dịch vụ mới"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Tên gói</FormLabel>
                    <FormControl><Input placeholder="Starter / Pro / Enterprise" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl><Textarea placeholder="Mô tả ngắn về gói..." rows={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceMonthly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá / tháng (VNĐ)</FormLabel>
                    <FormControl><Input type="number" placeholder="199000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceYearly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá / năm (VNĐ)</FormLabel>
                    <FormControl><Input type="number" placeholder="1990000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxBranches"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số chi nhánh tối đa</FormLabel>
                    <FormControl><Input type="number" min={1} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxStaff"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số nhân viên tối đa</FormLabel>
                    <FormControl><Input type="number" min={1} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <Label>Kích hoạt gói này</Label>
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Tính năng</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", included: true })}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Thêm
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Switch
                    checked={form.watch(`features.${index}.included`)}
                    onCheckedChange={(v) =>
                      form.setValue(`features.${index}.included`, v)
                    }
                  />
                  <Input
                    placeholder="Tên tính năng"
                    {...form.register(`features.${index}.name`)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(null)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Đang lưu..."
                  : isEdit
                    ? "Lưu thay đổi"
                    : "Tạo gói"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
