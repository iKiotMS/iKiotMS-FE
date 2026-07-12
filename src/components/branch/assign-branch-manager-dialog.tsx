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
import { branchApi } from "@/lib/api/branch";
import { logout } from "@/lib/api/auth";
import { staffApi } from "@/lib/api/staff";
import { getApiErrorMessage } from "@/lib/api/staff-mapper";
import { getSessionRole } from "@/lib/auth";
import type { Branch } from "@/types/branch";
import type { Staff } from "@/types/staff";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  branchId: z.string().min(1, "Vui lòng chọn chi nhánh"),
  staffId: z.string().min(1, "Vui lòng chọn nhân viên"),
});

type FormValues = z.infer<typeof formSchema>;

type AssignBranchManagerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBranchId?: string;
  initialBranchName?: string;
  onSuccess?: () => void;
};

function getStaffBranchId(staff: Staff): string {
  return staff.branchId ?? "";
}

function getStaffOptionLabel(staff: Staff): string {
  return `${staff.fullName}${staff.phoneNumber ? ` · ${staff.phoneNumber}` : ""}`;
}

export function AssignBranchManagerDialog({
  open,
  onOpenChange,
  initialBranchId,
  initialBranchName,
  onSuccess,
}: AssignBranchManagerDialogProps) {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branchId: "",
      staffId: "",
    },
  });

  const selectedBranchId = form.watch("branchId");
  const branchIsLocked = Boolean(initialBranchId);

  const selectedBranchName = useMemo(() => {
    if (initialBranchName) return initialBranchName;
    return branches.find((branch) => branch._id === selectedBranchId)?.name;
  }, [branches, initialBranchName, selectedBranchId]);

  const currentManager = useMemo(() => {
    if (!selectedBranchId) return null;
    return (
      allStaff.find(
        (staff) =>
          staff.status === "ACTIVE" &&
          staff.role === "BRANCH_MANAGER" &&
          getStaffBranchId(staff) === selectedBranchId,
      ) ?? null
    );
  }, [allStaff, selectedBranchId]);

  const staffCandidates = useMemo(() => {
    if (!selectedBranchId) return [];
    return allStaff.filter(
      (staff) =>
        staff.status === "ACTIVE" &&
        staff.role === "STAFF" &&
        getStaffBranchId(staff) === selectedBranchId,
    );
  }, [allStaff, selectedBranchId]);

  useEffect(() => {
    if (!open) return;

    form.reset({
      branchId: initialBranchId ?? "",
      staffId: "",
    });
    setBranches([]);
    setAllStaff([]);

    setLoadingBranches(true);
    void branchApi
      .getList({ status: "ACTIVE", limit: 100 })
      .then((response) => {
        setBranches(response.data ?? []);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error));
        setBranches([]);
      })
      .finally(() => setLoadingBranches(false));

    setLoadingStaff(true);
    void staffApi
      .getAllForOptions()
      .then(setAllStaff)
      .catch(() => setAllStaff([]))
      .finally(() => setLoadingStaff(false));
  }, [open, form, initialBranchId]);

  useEffect(() => {
    form.setValue("staffId", "");
  }, [form, selectedBranchId]);

  async function onSubmit(values: FormValues) {
    const isSelfTransfer = getSessionRole() === "BRANCH_MANAGER";

    try {
      await branchApi.assignManager(values.branchId, values.staffId);

      if (isSelfTransfer) {
        toast.success("Đã chuyển nhượng. Vui lòng đăng nhập lại.");
        onOpenChange(false);
        await logout();
        router.replace("/sign-in");
        return;
      }

      toast.success("Đã chuyển nhượng quản lý chi nhánh");
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
          <DialogTitle>
            {initialBranchId ? "Chuyển nhượng quản lý chi nhánh" : "Đổi quản lý chi nhánh"}
          </DialogTitle>
          <DialogDescription>
            Chọn nhân viên STAFF đang hoạt động trong chi nhánh. Người này sẽ
            thành quản lý chi nhánh; quản lý hiện tại về STAFF.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi nhánh</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={branchIsLocked || loadingBranches}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue
                          placeholder={
                            loadingBranches
                              ? "Đang tải chi nhánh..."
                              : "Chọn chi nhánh"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {branchIsLocked && selectedBranchName && (
                    <p className="text-xs text-muted-foreground">
                      Đang đổi quản lý cho chi nhánh {selectedBranchName}.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedBranchId && (
              <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <p className="text-xs text-muted-foreground">
                  Quản lý hiện tại
                </p>
                <p className="font-medium">
                  {currentManager
                    ? getStaffOptionLabel(currentManager)
                    : "Chưa tìm thấy quản lý đang active"}
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
                    disabled={!selectedBranchId || loadingStaff}
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
                  {selectedBranchId &&
                    !loadingStaff &&
                    staffCandidates.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Không có nhân viên STAFF active trong chi nhánh này.
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
                  !selectedBranchId ||
                  staffCandidates.length === 0
                }
              >
                <UserCog className="mr-2 size-4" />
                Xác nhận chuyển nhượng
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
