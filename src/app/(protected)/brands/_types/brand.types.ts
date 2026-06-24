// [UI Types – Brand]
import { z } from 'zod'

export type BrandsDialogType = 'add' | 'edit' | 'delete' | 'deleteMany'

export const brandFormSchema = z.object({
  name: z.string().min(1, 'Tên thương hiệu là bắt buộc'),
  brandCode: z.string().min(1, 'Mã thương hiệu là bắt buộc'),
  country: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export type BrandFormValues = z.infer<typeof brandFormSchema>
