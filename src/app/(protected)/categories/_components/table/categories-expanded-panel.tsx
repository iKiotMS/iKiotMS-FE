// [Table – Expanded Panel Category]
'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category } from '@/types/category'
import { useCategories } from '../../_context/categories-provider'
import { getCachedUser } from '@/lib/auth'
import { canUpdateCategory, canDeleteCategory } from '../../shared/category-permissions'

type CategoriesExpandedPanelProps = {
  category: Category
  isExpanded: boolean
}

export function CategoriesExpandedPanel({ category, isExpanded }: CategoriesExpandedPanelProps) {
  const { setOpen, setCurrentRow } = useCategories()
  const role = getCachedUser()?.role
  const canEdit = canUpdateCategory(role)
  const canDelete = canDeleteCategory(role)
  const [loading, setLoading] = useState(false)
  const wasExpandedRef = useRef(false)

  useLayoutEffect(() => {
    if (isExpanded && !wasExpandedRef.current) {
      wasExpandedRef.current = true
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 350)
      return () => clearTimeout(t)
    }
    if (!isExpanded) {
      wasExpandedRef.current = false
    }
  }, [isExpanded])

  if (loading) {
    return (
      <div className="bg-background border-b px-6 py-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Tên danh mục</span>
          <span className="font-medium">{category.name}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Ngày tạo</span>
          <span>{category.createdAt}</span>
        </div>
        {category.description && (
          <div className="flex flex-col gap-0.5 col-span-2 md:col-span-4">
            <span className="text-xs text-muted-foreground">Mô tả</span>
            <span className="text-muted-foreground">{category.description}</span>
          </div>
        )}
      </div>
      <Separator className="mt-4" />
      <div className="flex items-center justify-between mt-3">
        {canDelete ? (
          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              setCurrentRow(category)
              setOpen('delete')
            }}
          >
            <Trash2 className="mr-2 size-4" />
            Xóa
          </Button>
        ) : <span />}
        {canEdit && (
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              setCurrentRow(category)
              setOpen('edit')
            }}
          >
            <Pencil className="mr-2 size-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>
    </div>
  )
}
