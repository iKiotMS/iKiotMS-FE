"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator } from "lucide-react";
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
import { BRANCH_OPTIONS, usePayroll } from "./payroll-provider";

const generateSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  branchId: z.string().optional(),
});

type GenerateValues = z.infer<typeof generateSchema>;

const now = new Date();
const DEFAULT_VALUES: GenerateValues = {
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  branchId: "all",
};

export function PayrollGenerateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { handleGenerate } = usePayroll();
  const form = useForm<GenerateValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: DEFAULT_VALUES,
  });

  async function onSubmit(values: GenerateValues) {
    await handleGenerate({
      month: values.month,
      year: values.year,
      branchId: values.branchId && values.branchId !== "all" ? values.branchId : undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate bảng lương</DialogTitle>
          <DialogDescription>
            Tạo bảng lương hàng loạt theo kỳ lương từ dữ liệu attendance/schedule.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi nhánh (tùy chọn)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Toàn bộ chi nhánh" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Toàn bộ chi nhánh</SelectItem>
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
                <Calculator className="mr-2 size-4" />
                Generate
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
