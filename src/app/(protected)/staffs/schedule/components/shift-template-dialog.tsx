"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Pencil, Plus, Trash2, X } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import type { ShiftTemplate } from "@/types/working-schedule";
import { useSchedule } from "./schedule-provider";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const shiftTemplateSchema = z.object({
  name: z.string().trim().min(1, "Tên ca mẫu là bắt buộc"),
  startTime: z
    .string()
    .regex(TIME_PATTERN, "Giờ bắt đầu phải có định dạng HH:mm"),
  endTime: z
    .string()
    .regex(TIME_PATTERN, "Giờ kết thúc phải có định dạng HH:mm"),
});

type ShiftTemplateFormValues = z.infer<typeof shiftTemplateSchema>;

const EMPTY_FORM: ShiftTemplateFormValues = {
  name: "",
  startTime: "08:00",
  endTime: "17:00",
};

export function ShiftTemplateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const {
    shiftTemplates,
    handleCreateShiftTemplate,
    handleUpdateShiftTemplate,
    handleDeleteShiftTemplate,
  } = useSchedule();
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<ShiftTemplateFormValues>({
    resolver: zodResolver(shiftTemplateSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!open) {
      setEditingTemplate(null);
      form.reset(EMPTY_FORM);
    }
  }, [open, form]);

  function startEdit(template: ShiftTemplate) {
    setEditingTemplate(template);
    form.reset({
      name: template.name,
      startTime: template.startTime,
      endTime: template.endTime,
    });
  }

  function cancelEdit() {
    setEditingTemplate(null);
    form.reset(EMPTY_FORM);
  }

  async function onSubmit(values: ShiftTemplateFormValues) {
    if (editingTemplate) {
      await handleUpdateShiftTemplate(editingTemplate._id, values);
      cancelEdit();
    } else {
      await handleCreateShiftTemplate(values);
      form.reset(EMPTY_FORM);
    }
  }

  async function onDelete(id: string) {
    setDeletingId(id);
    try {
      await handleDeleteShiftTemplate(id);
      if (editingTemplate?._id === id) cancelEdit();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quản lý ca mẫu</DialogTitle>
          <DialogDescription>
            Tạo và chỉnh sửa ca mẫu trước khi phân lịch làm việc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {editingTemplate && (
              <p className="text-sm text-muted-foreground rounded-md bg-muted px-3 py-2">
                Đang sửa: <strong>{editingTemplate.name}</strong>
              </p>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên ca</FormLabel>
                  <FormControl>
                    <Input placeholder="Ca hành chính" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                className="cursor-pointer"
                disabled={form.formState.isSubmitting}
              >
                {editingTemplate ? (
                  <>
                    <Pencil className="mr-2 size-4" />
                    Lưu thay đổi
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 size-4" />
                    Thêm ca mẫu
                  </>
                )}
              </Button>
              {editingTemplate && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={cancelEdit}
                >
                  <X className="mr-2 size-4" />
                  Hủy sửa
                </Button>
              )}
            </div>
          </form>
        </Form>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Ca mẫu hiện có</p>
          {shiftTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-4 text-center">
              Chưa có ca mẫu nào.
            </p>
          ) : (
            <ul className="space-y-2">
              {shiftTemplates.map((template) => (
                <li
                  key={template._id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <Clock className="size-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium truncate">{template.name}</span>
                    <span className="text-muted-foreground font-mono text-xs shrink-0">
                      {template.startTime} - {template.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 cursor-pointer"
                      onClick={() => startEdit(template)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 cursor-pointer text-destructive hover:text-destructive"
                      disabled={deletingId === template._id}
                      onClick={() => onDelete(template._id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

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
      </DialogContent>
    </Dialog>
  );
}
