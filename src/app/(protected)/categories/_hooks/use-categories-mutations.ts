// [Mutations – Category]
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Category } from '@/types/category'
import type { CategoryFormValues } from '../_types/category.types'
import initialData from '../data/categories.json'

export function useCategoriesMutations() {
  const [categories, setCategories] = useState<Category[]>(initialData as Category[])
  const [isLoading, setIsLoading] = useState(false)

  async function handleAdd(data: CategoryFormValues): Promise<boolean> {
    setIsLoading(true)
    try {
      const newCategory: Category = {
        id: Date.now().toString(),
        categoryCode: data.categoryCode,
        name: data.name,
        description: data.description ?? '',
        productCount: 0,
        status: data.status,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setCategories((prev) => [newCategory, ...prev])
      toast.success('Thêm danh mục thành công')
      return true
    } catch {
      toast.error('Thêm danh mục thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEdit(id: string, data: CategoryFormValues): Promise<boolean> {
    setIsLoading(true)
    try {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                categoryCode: data.categoryCode,
                name: data.name,
                description: data.description ?? c.description,
                status: data.status,
              }
            : c,
        ),
      )
      toast.success('Cập nhật danh mục thành công')
      return true
    } catch {
      toast.error('Cập nhật danh mục thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string): Promise<boolean> {
    setIsLoading(true)
    try {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success('Xóa danh mục thành công')
      return true
    } catch {
      toast.error('Xóa danh mục thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteMany(ids: string[]): Promise<boolean> {
    setIsLoading(true)
    try {
      setCategories((prev) => prev.filter((c) => !ids.includes(c.id)))
      toast.success(`Xóa ${ids.length} danh mục thành công`)
      return true
    } catch {
      toast.error('Xóa danh mục thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { categories, isLoading, handleAdd, handleEdit, handleDelete, handleDeleteMany }
}
