"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCog } from "lucide-react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { staffApi } from "@/lib/api/staff";
import { getApiErrorMessage } from "@/lib/api/staff-mapper";
import { warehouseApi } from "@/lib/api/warehouse";
import type { Staff } from "@/types/staff";
import type { Warehouse } from "@/types/warehouse";

const formSchema = z.object({
  warehouseId: z.string().min(1, "Vui lòng chọn kho"),
  staffId: z.string().min(1, "Vui lòng chọn nhân viên"),
});

type FormValues = z.infer<typeof formSchema>;

type AssignWarehouseManagerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialWarehouseId?: string;
  initialWarehouseName?: string;
  onSuccess?: () => void;
};

function getStaffOptionLabel(staff: Staff): string {
  return `${staff.fullName}${staff.phoneNumber ? ` · ${staff.phoneNumber}` : ""}`;
}

export function AssignWarehouseManagerDialog({
  open,
  onOpenChange,
  initialWarehouseId,
  initialWarehouseName,
  onSuccess,
}: AssignWarehouseManagerDialogProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouseId: "",
      staffId: "",
    },
  });

  const selectedWarehouseId = form.watch("warehouseId");
  const warehouseIsLocked = Boolean(initialWarehouseId);

  const selectedWarehouseName = useMemo(() => {
    if (initialWarehouseName) return initialWarehouseName;
    return warehouses.find((w) => w._id === selectedWarehouseId)?.name;
  }, [warehouses, initialWarehouseName, selectedWarehouseId]);

  const currentManager = useMemo(() => {
    if (!selectedWarehouseId) return null;
    return (
      allStaff.find(
        (staff) =>
          staff.status === "ACTIVE" &&
          staff.role === "WAREHOUSE_MANAGER" &&
          staff.warehouseId === selectedWarehouseId,
      ) ?? null
    );
  }, [allStaff, selectedWarehouseId]);

  const staffCandidates = useMemo(() => {
    return allStaff.filter(
      (staff) => staff.status === "ACTIVE" && staff.role === "STAFF",
    );
  }, [allStaff]);

  useEffect(() => {
    if (!open) return;

    form.reset({
      warehouseId: initialWarehouseId ?? "",
      staffId: "",
    });
    setWarehouses([]);
    setAllStaff([]);

    setLoadingWarehouses(true);
    void warehouseApi
      .getList({ status: "ACTIVE", limit: 100 })
      .then((response) => {
        setWarehouses(response.data ?? []);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error));
        setWarehouses([]);
      })
      .finally(() => setLoadingWarehouses(false));

    setLoadingStaff(true);
    void staffApi
      .getAllForOptions()
      .then(setAllStaff)
      .catch(() => setAllStaff([]))
      .finally(() => setLoadingStaff(false));
  }, [open, form, initialWarehouseId]);

  useEffect(() => {
    form.setValue("staffId", "");
  }, [form, selectedWarehouseId]);

  async function onSubmit(values: FormValues) {
    try {
      await warehouseApi.assignManager(values.warehouseId, values.staffId);
      toast.success("Đã đổi quản lý kho");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi quản lý kho</DialogTitle>
          <DialogDescription>
            Chọn nhân viên STAFF đang hoạt động. Hệ thống sẽ thăng thành quản lý
            kho và hạ quản lý hiện tại về STAFF.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kho hàng</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={warehouseIsLocked || loadingWarehouses}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue
                          placeholder={
                            loadingWarehouses
                              ? "Đang tải kho..."
                              : "Chọn kho hàng"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse._id} value={warehouse._id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {warehouseIsLocked && selectedWarehouseName && (
                    <p className="text-xs text-muted-foreground">
                      Đang đổi quản lý cho kho {selectedWarehouseName}.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedWarehouseId && (
              <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <p className="text-xs text-muted-foreground">
                  Quản lý hiện tại
                </p>
                <p className="font-medium">
                  {currentManager
                    ? getStaffOptionLabel(currentManager)
                    : "Chưa có quản lý kho active"}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhân viên mới (STAFF)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedWarehouseId || loadingStaff}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue
                          placeholder={
                            loadingStaff
                              ? "Đang tải nhân viên..."
                              : "Chọn nhân viên"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staffCandidates.map((staff) => (
                        <SelectItem key={staff._id} value={staff._id}>
                          {getStaffOptionLabel(staff)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!loadingStaff && staffCandidates.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Không có nhân viên STAFF đang hoạt động trong hệ thống.
                    </p>
                  )}
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
                disabled={
                  form.formState.isSubmitting ||
                  !selectedWarehouseId ||
                  staffCandidates.length === 0
                }
              >
                <UserCog className="mr-2 size-4" />
                Xác nhận đổi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
