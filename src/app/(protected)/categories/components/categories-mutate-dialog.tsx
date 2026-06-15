'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories, type Category } from './categories-provider'

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  categoryCode: z.string().min(1, 'Mã danh mục là bắt buộc'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

const EMPTY_VALUES: CategoryFormValues = {
  name: '',
  categoryCode: '',
  description: '',
  status: 'ACTIVE',
}

type CategoriesMutateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Category
}

export function CategoriesMutateDialog({ open, onOpenChange, currentRow }: CategoriesMutateDialogProps) {
  const isEdit = !!currentRow
  const { handleAdd, handleEdit } = useCategories()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return
    if (isEdit && currentRow) {
      form.reset({
        name: currentRow.name,
        categoryCode: currentRow.categoryCode,
        description: currentRow.description,
        status: currentRow.status,
      })
    } else {
      form.reset(EMPTY_VALUES)
    }
  }, [open, isEdit, currentRow, form])

  function onSubmit(data: CategoryFormValues) {
    if (isEdit && currentRow) {
      handleEdit(currentRow.id, data)
    } else {
      handleAdd(data)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin danh mục. Nhấn Lưu khi hoàn tất.'
              : 'Điền thông tin danh mục mới. Nhấn Lưu khi hoàn tất.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên danh mục" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã danh mục <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="VD: DM-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Đang sử dụng</SelectItem>
                        <SelectItem value="INACTIVE">Ngừng sử dụng</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả danh mục"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Hủy
              </Button>
              <Button type="submit" className="cursor-pointer">
                {isEdit ? (
                  <><Pencil className="mr-2 h-4 w-4" />Lưu thay đổi</>
                ) : (
                  <><Plus className="mr-2 h-4 w-4" />Thêm danh mục</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
