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
import type { Staff, StaffGender, StaffSalaryType } from "@/types/staff";
import {
  formatVndAmount,
  parseVndAmount,
} from "@/app/(protected)/staffs/shared/salary-format";
import {
  isValidIdentificationId,
  parseIdentificationId,
} from "@/app/(protected)/staffs/shared/identification-format";
import { CccdInput } from "./cccd-input";
import { useStaffs } from "./staffs-provider";

const GENDER_OPTIONS: { value: StaffGender; label: string }[] = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const SALARY_TYPE_OPTIONS: { value: StaffSalaryType; label: string }[] = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
];

const profileFieldsSchema = {
  identificationId: z
    .string()
    .optional()
    .refine((value) => isValidIdentificationId(value), {
      message: "CCCD phải có đúng 12 số",
    }),
  address: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", ""]).optional(),
  dob: z.string().optional(),
  baseSalary: z.string().optional(),
  salaryType: z.enum(["FULL_TIME", "PART_TIME", ""]).optional(),
};

function buildProfilePayload(data: {
  identificationId?: string;
  address?: string;
  gender?: string;
  dob?: string;
}) {
  const profile = {
    identificationId: data.identificationId || undefined,
    address: data.address?.trim() || undefined,
    gender: (data.gender as StaffGender) || undefined,
    dob: data.dob || undefined,
  };

  if (
    !profile.identificationId &&
    !profile.address &&
    !profile.gender &&
    !profile.dob
  ) {
    return undefined;
  }

  return profile;
}

function buildSalaryPayload(baseSalary?: string, salaryType?: string) {
  return {
    baseSalary: parseVndAmount(baseSalary),
    salaryType: (salaryType as StaffSalaryType) || undefined,
  };
}

const createFormSchema = z
  .object({
    firstName: z.string().min(1, "Tên là bắt buộc"),
    lastName: z.string().min(1, "Họ là bắt buộc"),
    phoneNumber: z
      .string()
      .regex(/^(0|\+84)(\d{9})$/, "Số điện thoại không hợp lệ"),
    email: z.string().email("Email không hợp lệ").or(z.literal("")),
    role: z.enum(["STAFF", "WAREHOUSE_MANAGER", "BRANCH_MANAGER"]),
    branchId: z.string().optional(),
    warehouseId: z.string().optional(),
    hireDate: z.string().optional(),
    newPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    reEnterPassword: z.string().min(6, "Xác nhận mật khẩu tối thiểu 6 ký tự"),
    ...profileFieldsSchema,
  })
  .refine((data) => data.newPassword === data.reEnterPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["reEnterPassword"],
  })
  .superRefine((data, ctx) => {
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
  });

const editFormSchema = z
  .object({
    firstName: z.string().min(1, "Tên là bắt buộc"),
    lastName: z.string().min(1, "Họ là bắt buộc"),
    email: z.string().email("Email không hợp lệ").or(z.literal("")),
    role: z.enum(["STAFF", "WAREHOUSE_MANAGER", "BRANCH_MANAGER"]),
    branchId: z.string().optional(),
    warehouseId: z.string().optional(),
    hireDate: z.string().optional(),
    ...profileFieldsSchema,
  })
  .superRefine((data, ctx) => {
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
  });

type CreateFormValues = z.infer<typeof createFormSchema>;
type EditFormValues = z.infer<typeof editFormSchema>;

const EMPTY_CREATE_VALUES: CreateFormValues = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  role: "STAFF",
  branchId: "",
  warehouseId: "",
  hireDate: "",
  identificationId: "",
  address: "",
  gender: "",
  dob: "",
  baseSalary: "",
  salaryType: "",
  newPassword: "",
  reEnterPassword: "",
};

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
  const { handleAdd, handleEdit, roleOptions, branchOptions, warehouseOptions } =
    useStaffs();

  const form = useForm<CreateFormValues | EditFormValues>({
    resolver: zodResolver(isEdit ? editFormSchema : createFormSchema),
    defaultValues: EMPTY_CREATE_VALUES,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const selectedRole = form.watch("role");

  useEffect(() => {
    if (selectedRole === "WAREHOUSE_MANAGER") {
      form.setValue("branchId", "");
    }
    if (selectedRole === "BRANCH_MANAGER") {
      form.setValue("warehouseId", "");
    }
  }, [selectedRole, form]);

  useEffect(() => {
    if (!open) return;
    if (isEdit && currentRow) {
      form.reset({
        firstName: currentRow.firstName,
        lastName: currentRow.lastName,
        email: currentRow.email ?? "",
        role: currentRow.role,
        branchId: currentRow.branchId,
        warehouseId: currentRow.warehouseId ?? "",
        hireDate: currentRow.joinedAt
          ? currentRow.joinedAt.slice(0, 10)
          : "",
        identificationId:
          parseIdentificationId(currentRow.profile?.identificationId) ?? "",
        address: currentRow.profile?.address ?? "",
        gender: currentRow.profile?.gender ?? "",
        dob: currentRow.profile?.dob
          ? currentRow.profile.dob.slice(0, 10)
          : "",
        baseSalary:
          currentRow.baseSalary !== undefined
            ? formatVndAmount(currentRow.baseSalary)
            : "",
        salaryType: currentRow.salaryType ?? "",
      });
    } else {
      form.reset(EMPTY_CREATE_VALUES);
    }
  }, [open, isEdit, currentRow, form]);

  async function onSubmit(data: CreateFormValues | EditFormValues) {
    try {
      if (isEdit && currentRow) {
        const editData = data as EditFormValues;
        const salary = buildSalaryPayload(editData.baseSalary, editData.salaryType);
        await handleEdit(currentRow._id, {
          firstName: editData.firstName,
          lastName: editData.lastName,
          email: editData.email || undefined,
          role: editData.role,
          branchId:
            editData.role === "WAREHOUSE_MANAGER"
              ? undefined
              : editData.branchId || undefined,
          warehouseId:
            editData.role === "BRANCH_MANAGER"
              ? undefined
              : editData.warehouseId || undefined,
          hireDate: editData.hireDate || undefined,
          baseSalary: salary.baseSalary,
          salaryType: salary.salaryType,
          profile: buildProfilePayload(editData),
        });
      } else {
        const createData = data as CreateFormValues;
        const salary = buildSalaryPayload(
          createData.baseSalary,
          createData.salaryType,
        );
        await handleAdd({
          firstName: createData.firstName,
          lastName: createData.lastName,
          phoneNumber: createData.phoneNumber,
          email: createData.email || undefined,
          role: createData.role,
          branchId:
            createData.role === "WAREHOUSE_MANAGER"
              ? undefined
              : createData.branchId || undefined,
          warehouseId:
            createData.role === "BRANCH_MANAGER"
              ? undefined
              : createData.warehouseId || undefined,
          hireDate: createData.hireDate || undefined,
          baseSalary: salary.baseSalary,
          salaryType: salary.salaryType,
          profile: buildProfilePayload(createData),
          newPassword: createData.newPassword,
          reEnterPassword: createData.reEnterPassword,
        });
      }
      onOpenChange(false);
    } catch {
      // Error toast handled in provider
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật thông tin nhân viên. Số điện thoại không thể đổi qua form này."
              : "Tạo hồ sơ nhân viên và tài khoản đăng nhập trên hệ thống."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {!isEdit && (
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại (dùng để đăng nhập)</FormLabel>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      <FormLabel>
                        Chi nhánh
                        {selectedRole !== "BRANCH_MANAGER" && (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            (tuỳ chọn)
                          </span>
                        )}
                      </FormLabel>
                      {branchOptions.length > 0 ? (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
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

            {selectedRole === "WAREHOUSE_MANAGER" && (
              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kho hàng</FormLabel>
                    {warehouseOptions.length > 0 ? (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
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
                        Hiện chưa có kho hàng nào trong hệ thống.
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
                    <Input type="date" {...field} />
                  </FormControl>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salaryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại lương</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Chọn loại lương" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SALARY_TYPE_OPTIONS.map((option) => (
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
              name="baseSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lương cơ bản (VND)</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="8.000.000"
                      className="tabular-nums"
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, "");
                        field.onChange(digits ? formatVndAmount(digits) : "");
                      }}
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
