"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Staff, StaffGender, StaffProfilePayload, StaffRole } from "@/types/staff";
import type { PaySheetOption } from "@/types/paysheet";
import { paySheetApi } from "@/lib/api/paysheet";
import {
  isValidIdentificationId,
  parseIdentificationId,
} from "@/app/(protected)/staffs/shared/identification-format";
import {
  getDobInputBounds,
  getHireDateInputBounds,
  isValidTaxNumber,
  normalizeDateInput,
  parseTaxNumber,
  validateOptionalDob,
  validateOptionalHireDate,
} from "@/app/(protected)/staffs/shared/staff-date-validation";
import { toDateInputValue } from "@/app/(protected)/staffs/shared/staff-format";
import { CccdInput } from "./cccd-input";
import { StaffAvatarField } from "./staff-avatar-field";
import { uploadImage } from "@/lib/api/upload";
import { branchApi } from "@/lib/api/branch";
import { staffApi } from "@/lib/api/staff";
import { warehouseApi } from "@/lib/api/warehouse";
import { getApiErrorMessage } from "@/lib/api/staff-mapper";
import { getSessionBranchId, getSessionRole } from "@/lib/auth";
import {
  canAssignWarehouseOnStaffForm,
  canEditStaffRoleAndWorkplace,
  canPromoteStaffToManager,
  shouldLockBranchOnCreate,
} from "@/components/sidebar/constants/role-permissions";
import { isManagerRole } from "@/app/(protected)/staffs/shared/staff-manager-utils";
import {
  resolveBranchIdForRole,
  resolveWarehouseIdForRole,
  validateStaffWorkplace,
} from "@/app/(protected)/staffs/shared/staff-workplace";
import { useStaffs } from "./staffs-provider";

const GENDER_OPTIONS: { value: StaffGender; label: string }[] = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const dobInputBounds = getDobInputBounds();
const hireDateInputBounds = getHireDateInputBounds();

function applyStaffProfileValidation(
  data: { dob?: string; hireDate?: string; taxNumber?: string },
  ctx: z.RefinementCtx,
) {
  const dobResult = validateOptionalDob(data.dob);
  if (!dobResult.ok) {
    ctx.addIssue({
      code: "custom",
      message: dobResult.message ?? "Ngày sinh không hợp lệ",
      path: ["dob"],
    });
  }

  const hireDateResult = validateOptionalHireDate(data.hireDate, data.dob);
  if (!hireDateResult.ok) {
    ctx.addIssue({
      code: "custom",
      message: hireDateResult.message ?? "Ngày vào làm không hợp lệ",
      path: ["hireDate"],
    });
  }

  if (data.taxNumber?.trim() && !isValidTaxNumber(data.taxNumber)) {
    ctx.addIssue({
      code: "custom",
      message: "Mã số thuế phải có 10–14 chữ số",
      path: ["taxNumber"],
    });
  }
}

const profileFieldsSchema = {
  identificationId: z
    .string()
    .optional()
    .refine((value) => isValidIdentificationId(value), {
      message: "CCCD phải có đúng 12 số",
    }),
  address: z.string().max(255, "Địa chỉ tối đa 255 ký tự").optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", ""]).optional(),
  dob: z.string().optional(),
  taxNumber: z.string().optional(),
};

function buildProfilePayload(data: {
  identificationId?: string;
  address?: string;
  gender?: string;
  dob?: string;
  avatarUrl?: string | null;
  taxNumber?: string;
}): StaffProfilePayload | undefined {
  const profile: StaffProfilePayload = {
    identificationId: parseIdentificationId(data.identificationId) || undefined,
    address: data.address?.trim() || undefined,
    gender: (data.gender as StaffGender) || undefined,
    dob: normalizeDateInput(data.dob),
    avatarUrl:
      data.avatarUrl === null
        ? ""
        : data.avatarUrl?.trim() || undefined,
    taxNumber: parseTaxNumber(data.taxNumber) || undefined,
  };

  const hasExplicitAvatar =
    data.avatarUrl === null || Boolean(data.avatarUrl?.trim());
  const hasOtherValue = Object.entries(profile)
    .filter(([key]) => key !== "avatarUrl")
    .some(([, value]) => Boolean(value));

  return hasExplicitAvatar || hasOtherValue ? profile : undefined;
}

const PAYSHEET_NONE = "__none__";

const createFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "Tên là bắt buộc").max(50, "Tên tối đa 50 ký tự"),
    lastName: z.string().trim().min(1, "Họ là bắt buộc").max(50, "Họ tối đa 50 ký tự"),
    phoneNumber: z
      .string()
      .regex(/^(0|\+84)(\d{9})$/, "Số điện thoại không hợp lệ"),
    email: z.string().email("Email không hợp lệ").or(z.literal("")),
    role: z.enum(["STAFF", "WAREHOUSE_MANAGER", "BRANCH_MANAGER"]),
    branchId: z.string().optional(),
    warehouseId: z.string().optional(),
    hireDate: z.string().optional(),
    paySheetId: z.string().optional(),
    newPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    reEnterPassword: z.string().min(6, "Xác nhận mật khẩu tối thiểu 6 ký tự"),
    ...profileFieldsSchema,
  })
  .refine((data) => data.newPassword === data.reEnterPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["reEnterPassword"],
  })
  .superRefine((data, ctx) => {
    applyStaffProfileValidation(data, ctx);

    if (data.role === "WAREHOUSE_MANAGER" && !data.warehouseId?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Quản lý kho cần chọn kho",
        path: ["warehouseId"],
      });
    }
    if (data.role === "BRANCH_MANAGER" && !data.branchId?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Quản lý chi nhánh cần chọn chi nhánh",
        path: ["branchId"],
      });
    }

    const workplaceError = validateStaffWorkplace(
      data.role,
      data.branchId,
      data.warehouseId,
    );
    if (workplaceError) {
      ctx.addIssue({
        code: "custom",
        message: workplaceError,
        path: ["branchId"],
      });
    }
  });

const editFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "Tên là bắt buộc").max(50, "Tên tối đa 50 ký tự"),
    lastName: z.string().trim().min(1, "Họ là bắt buộc").max(50, "Họ tối đa 50 ký tự"),
    email: z.string().email("Email không hợp lệ").or(z.literal("")),
    role: z.enum(["STAFF", "WAREHOUSE_MANAGER", "BRANCH_MANAGER"]),
    branchId: z.string().optional(),
    warehouseId: z.string().optional(),
    hireDate: z.string().optional(),
    paySheetId: z.string().optional(),
    accountNote: z.string().optional(),
    ...profileFieldsSchema,
  })
  .superRefine((data, ctx) => {
    applyStaffProfileValidation(data, ctx);

    if (data.role === "WAREHOUSE_MANAGER" && !data.warehouseId?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Quản lý kho cần chọn kho",
        path: ["warehouseId"],
      });
    }
    if (data.role === "BRANCH_MANAGER" && !data.branchId?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Quản lý chi nhánh cần chọn chi nhánh",
        path: ["branchId"],
      });
    }

    const workplaceError = validateStaffWorkplace(
      data.role,
      data.branchId,
      data.warehouseId,
    );
    if (workplaceError) {
      ctx.addIssue({
        code: "custom",
        message: workplaceError,
        path: ["branchId"],
      });
    }
  });

type CreateFormValues = z.infer<typeof createFormSchema>;
type EditFormValues = z.infer<typeof editFormSchema>;

function getEditDefaults(staff: Staff): EditFormValues {
  return {
    firstName: staff.firstName ?? "",
    lastName: staff.lastName ?? "",
    email: staff.email ?? "",
    role: staff.role,
    branchId: staff.branchId ?? "",
    warehouseId: staff.warehouseId ?? "",
    hireDate: toDateInputValue(staff.joinedAt),
    paySheetId: staff.paySheetId || PAYSHEET_NONE,
    identificationId:
      parseIdentificationId(staff.profile?.identificationId) ?? "",
    address: staff.profile?.address ?? "",
    gender: staff.profile?.gender ?? "",
    dob: toDateInputValue(staff.profile?.dob),
    taxNumber: staff.profile?.taxNumber ?? "",
    accountNote: staff.accountNote ?? "",
  };
}

const EMPTY_CREATE_VALUES: CreateFormValues = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  role: "STAFF",
  branchId: "",
  warehouseId: "",
  hireDate: "",
  paySheetId: PAYSHEET_NONE,
  identificationId: "",
  address: "",
  gender: "",
  dob: "",
  taxNumber: "",
  newPassword: "",
  reEnterPassword: "",
};

function resolvePaySheetIdForApi(value?: string): string | null {
  if (!value || value === PAYSHEET_NONE) return null;
  return value;
}

type StaffsMutateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Staff;
};

export function StaffsMutateDialog({
  open,
  onOpenChange,
  currentRow,
}: StaffsMutateDialogProps) {
  const isEdit = !!currentRow;
  const userRole = getSessionRole();
  const lockBranchOnCreate = shouldLockBranchOnCreate(userRole);
  const canAssignWarehouse = canAssignWarehouseOnStaffForm(userRole);
  const canPromoteRole =
    canPromoteStaffToManager(userRole) &&
    isEdit &&
    !!currentRow &&
    currentRow.role === "STAFF";
  const isEditingManager = isEdit && currentRow && isManagerRole(currentRow.role);
  const canEditRoleWorkplace =
    !isEdit ||
    (currentRow &&
      canEditStaffRoleAndWorkplace(userRole, currentRow.role));

  const { handleAdd, handleEdit, fetchStaffs, roleOptions, branchOptions, warehouseOptions, warehouseOptionsFailed } =
    useStaffs();

  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [paySheetOptions, setPaySheetOptions] = useState<PaySheetOption[]>([]);
  const [paySheetOptionsFailed, setPaySheetOptionsFailed] = useState(false);
  const avatarBlobUrlRef = useRef<string | null>(null);
  const roleAtOpenRef = useRef<StaffRole | null>(null);

  const form = useForm<CreateFormValues | EditFormValues>({
    resolver: zodResolver(isEdit ? editFormSchema : createFormSchema),
    defaultValues: EMPTY_CREATE_VALUES,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const selectedRole = form.watch("role");
  const watchedFirstName = form.watch("firstName");
  const watchedLastName = form.watch("lastName");
  const avatarFullName = `${watchedLastName} ${watchedFirstName}`.trim();

  function clearAvatarBlobUrl() {
    if (avatarBlobUrlRef.current) {
      URL.revokeObjectURL(avatarBlobUrlRef.current);
      avatarBlobUrlRef.current = null;
    }
  }

  function resetAvatarDraft(existingUrl?: string) {
    clearAvatarBlobUrl();
    setPendingAvatarFile(null);
    setAvatarRemoved(false);
    setAvatarPreviewUrl(existingUrl ?? null);
  }

  function handleSelectAvatarFile(file: File) {
    clearAvatarBlobUrl();
    const objectUrl = URL.createObjectURL(file);
    avatarBlobUrlRef.current = objectUrl;
    setPendingAvatarFile(file);
    setAvatarPreviewUrl(objectUrl);
    setAvatarRemoved(false);
  }

  function handleRemoveAvatar() {
    clearAvatarBlobUrl();
    setPendingAvatarFile(null);
    setAvatarPreviewUrl(null);
    setAvatarRemoved(true);
  }

  async function resolveAvatarUrl(existingUrl?: string): Promise<string | null | undefined> {
    if (pendingAvatarFile) {
      return uploadImage(pendingAvatarFile);
    }
    if (avatarRemoved) {
      return null;
    }
    return existingUrl?.trim() || undefined;
  }

  useEffect(() => {
    return () => clearAvatarBlobUrl();
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void paySheetApi
      .getAllForOptions()
      .then((options) => {
        if (cancelled) return;
        // Giữ option hiện tại nếu nhân viên đang gán bảng lương không còn trong list.
        if (
          isEdit &&
          currentRow?.paySheetId &&
          !options.some((item) => item.value === currentRow.paySheetId)
        ) {
          options = [
            {
              value: currentRow.paySheetId,
              label:
                currentRow.paySheetName ||
                `Bảng lương đã gán (#${currentRow.paySheetId.slice(-6)})`,
            },
            ...options,
          ];
        }
        setPaySheetOptions(options);
        setPaySheetOptionsFailed(false);
      })
      .catch(() => {
        if (cancelled) return;
        setPaySheetOptions([]);
        setPaySheetOptionsFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, isEdit, currentRow?.paySheetId, currentRow?.paySheetName]);

  useEffect(() => {
    if (!open) {
      roleAtOpenRef.current = null;
      return;
    }

    if (isEdit && currentRow) {
      roleAtOpenRef.current = currentRow.role;
      return;
    }

    roleAtOpenRef.current = null;
  }, [open, isEdit, currentRow]);

  useEffect(() => {
    if (!open) return;

    const isInitialRoleOnEdit =
      roleAtOpenRef.current !== null &&
      roleAtOpenRef.current === selectedRole;

    if (isInitialRoleOnEdit) return;

    if (selectedRole === "WAREHOUSE_MANAGER") {
      form.setValue("branchId", "");
    }
    if (selectedRole === "BRANCH_MANAGER") {
      form.setValue("warehouseId", "");
    }
    if (selectedRole === "STAFF") {
      // keep one workplace — user clears the other manually when switching
    }
  }, [selectedRole, open, form]);

  useEffect(() => {
    if (!open) return;
    if (isEdit && currentRow) {
      resetAvatarDraft(currentRow.profile?.avatarUrl);
      form.reset(getEditDefaults(currentRow));
    } else {
      resetAvatarDraft();
      const defaultBranchId =
        lockBranchOnCreate && getSessionBranchId()
          ? getSessionBranchId()!
          : "";
      form.reset({
        ...EMPTY_CREATE_VALUES,
        branchId: defaultBranchId,
        warehouseId: "",
      });
    }
  }, [open, isEdit, currentRow, form, lockBranchOnCreate]);

  useEffect(() => {
    if (!open || isEdit || canAssignWarehouse) return;
    form.setValue("warehouseId", "");
  }, [open, isEdit, canAssignWarehouse, form, selectedRole]);

  async function onSubmit(data: CreateFormValues | EditFormValues) {
    const existingAvatarUrl = isEdit ? currentRow?.profile?.avatarUrl : undefined;

    let avatarUrl: string | null | undefined;

    if (pendingAvatarFile) {
      try {
        avatarUrl = await uploadImage(pendingAvatarFile);
      } catch {
        toast.warning("Không tải được ảnh đại diện. Nhân viên vẫn được lưu.");
        avatarUrl = isEdit ? existingAvatarUrl : undefined;
      }
    } else {
      avatarUrl = await resolveAvatarUrl(existingAvatarUrl);
    }

    try {
      if (isEdit && currentRow) {
        const editData = data as EditFormValues;
        const profilePayload: Parameters<typeof handleEdit>[1] = {
          firstName: editData.firstName,
          lastName: editData.lastName,
          email: editData.email || undefined,
          hireDate: normalizeDateInput(editData.hireDate),
          paySheetId: resolvePaySheetIdForApi(editData.paySheetId),
          profile: buildProfilePayload({
            ...editData,
            avatarUrl,
          }),
          accountNote: editData.accountNote?.trim() || "",
        };

        const promotingToBranchManager =
          canPromoteRole &&
          currentRow.role === "STAFF" &&
          editData.role === "BRANCH_MANAGER";
        const promotingToWarehouseManager =
          canPromoteRole &&
          currentRow.role === "STAFF" &&
          editData.role === "WAREHOUSE_MANAGER";

        if (promotingToBranchManager) {
          const branchId = resolveBranchIdForRole(
            "BRANCH_MANAGER",
            editData.branchId,
          );
          if (!branchId) {
            toast.error("Quản lý chi nhánh cần chọn chi nhánh");
            return;
          }
          try {
            await staffApi.update(currentRow._id, {
              ...profilePayload,
              branchId,
              warehouseId: null,
            });
            await branchApi.assignManager(branchId, currentRow._id);
            toast.success("Đã thăng quản lý chi nhánh");
            await fetchStaffs();
          } catch (error) {
            toast.error(getApiErrorMessage(error));
            throw error;
          }
        } else if (promotingToWarehouseManager) {
          const warehouseId = resolveWarehouseIdForRole(
            "WAREHOUSE_MANAGER",
            editData.warehouseId,
          );
          if (!warehouseId) {
            toast.error("Quản lý kho cần chọn kho");
            return;
          }
          try {
            await staffApi.update(currentRow._id, {
              ...profilePayload,
              branchId: null,
            });
            await warehouseApi.assignManager(warehouseId, currentRow._id);
            toast.success("Đã thăng quản lý kho");
            await fetchStaffs();
          } catch (error) {
            toast.error(getApiErrorMessage(error));
            throw error;
          }
        } else {
          if (canEditRoleWorkplace && !isEditingManager) {
            profilePayload.branchId = resolveBranchIdForRole(
              editData.role,
              editData.branchId,
            );
            if (canAssignWarehouse) {
              profilePayload.warehouseId = resolveWarehouseIdForRole(
                editData.role,
                editData.warehouseId,
              );
            }
          }

          await handleEdit(currentRow._id, profilePayload);
        }
      } else {
        const createData = data as CreateFormValues;
        await handleAdd({
          firstName: createData.firstName,
          lastName: createData.lastName,
          phoneNumber: createData.phoneNumber,
          email: createData.email || undefined,
          role: createData.role,
          branchId: resolveBranchIdForRole(createData.role, createData.branchId),
          warehouseId: canAssignWarehouse
            ? resolveWarehouseIdForRole(createData.role, createData.warehouseId)
            : undefined,
          hireDate: normalizeDateInput(createData.hireDate),
          paySheetId: resolvePaySheetIdForApi(createData.paySheetId),
          profile: buildProfilePayload({
            ...createData,
            avatarUrl: avatarUrl ?? undefined,
          }),
          newPassword: createData.newPassword,
          reEnterPassword: createData.reEnterPassword,
        });
      }
      onOpenChange(false);
    } catch {
      // Error toast handled in provider / above
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>Ảnh đại diện</FormLabel>
              <StaffAvatarField
                previewUrl={avatarPreviewUrl ?? undefined}
                hasPendingFile={!!pendingAvatarFile}
                onSelectFile={handleSelectAvatarFile}
                onRemove={handleRemoveAvatar}
                fullName={avatarFullName}
              />
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input placeholder="An" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEdit && currentRow && (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <Input value={currentRow.phoneNumber} disabled readOnly />
              </FormItem>
            )}

            {!isEdit && (
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="0901234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@ikiot.vn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEdit && !canPromoteRole}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(selectedRole === "BRANCH_MANAGER" ||
                selectedRole === "STAFF") && (
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi nhánh</FormLabel>
                      {branchOptions.length > 0 ? (
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (selectedRole === "STAFF" && value) {
                              form.setValue("warehouseId", "");
                            }
                          }}
                          value={field.value || ""}
                          disabled={
                            Boolean(isEditingManager) ||
                            (lockBranchOnCreate && !isEdit)
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="cursor-pointer w-full">
                              <SelectValue placeholder="Chọn chi nhánh" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {branchOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-2">
                          Hiện chưa có chi nhánh nào trong hệ thống.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {canAssignWarehouse &&
              (selectedRole === "WAREHOUSE_MANAGER" ||
                selectedRole === "STAFF") && (
              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kho hàng</FormLabel>
                    {warehouseOptions.length > 0 ? (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (selectedRole === "STAFF" && value) {
                            form.setValue("branchId", "");
                          }
                        }}
                        value={field.value || ""}
                        disabled={Boolean(isEditingManager)}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer w-full">
                            <SelectValue placeholder="Chọn kho hàng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouseOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-2">
                        {warehouseOptionsFailed
                          ? "Không tải được danh sách kho."
                          : "Hiện chưa có kho hàng nào trong hệ thống."}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="hireDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày vào làm</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={hireDateInputBounds.min}
                      max={hireDateInputBounds.max}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paySheetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bảng lương</FormLabel>
                  {paySheetOptionsFailed ? (
                    <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-2">
                      Không tải được danh sách bảng lương (
                      <code className="text-xs">GET /payroll/paysheets</code>
                      ).
                    </p>
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || PAYSHEET_NONE}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Chọn bảng lương" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PAYSHEET_NONE}>
                          Chưa gán bảng lương
                        </SelectItem>
                        {paySheetOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="identificationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CCCD</FormLabel>
                    <FormControl>
                      <CccdInput
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input placeholder="Ho Chi Minh City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã số thuế</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0123456789"
                      inputMode="numeric"
                      {...field}
                      onChange={(event) =>
                        field.onChange(parseTaxNumber(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày sinh</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={dobInputBounds.min}
                      max={dobInputBounds.max}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEdit && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reEnterPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {isEdit && (
              <FormField
                control={form.control}
                name="accountNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú tài khoản</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ghi chú nội bộ về tài khoản nhân viên..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
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
                disabled={form.formState.isSubmitting}
              >
                {isEdit ? (
                  <>
                    <Pencil className="mr-2 size-4" />
                    Lưu thay đổi
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 size-4" />
                    Thêm nhân viên
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
