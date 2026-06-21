// [UI Types – Supplier]
import { z } from 'zod'

export type SuppliersDialogType = 'add' | 'edit' | 'delete' | 'deleteMany'

export const supplierFormSchema = z.object({
  supplierCode: z.string().min(1, 'Mã nhà cung cấp là bắt buộc'),
  supplierName: z.string().min(1, 'Tên nhà cung cấp là bắt buộc'),
  contactName: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Email không hợp lệ',
    }),
  address: z.string().optional(),
  creditLimit: z.number().min(0, 'Hạn mức tín dụng không được âm'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export type SupplierFormValues = z.infer<typeof supplierFormSchema>
