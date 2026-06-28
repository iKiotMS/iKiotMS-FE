// [UI Types – Category]
import { z } from 'zod'

export type CategoriesDialogType = 'add' | 'edit' | 'delete' | 'deleteMany'

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  categoryCode: z.string().min(1, 'Mã danh mục là bắt buộc'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>
