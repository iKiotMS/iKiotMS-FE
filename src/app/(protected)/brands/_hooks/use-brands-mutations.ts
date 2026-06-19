// [Mutations – Brand]
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Brand } from '@/types/brand'
import type { BrandFormValues } from '../_types/brand.types'
import initialData from '../data/brands.json'

export function useBrandsMutations() {
  const [brands, setBrands] = useState<Brand[]>(initialData as Brand[])
  const [isLoading, setIsLoading] = useState(false)

  async function handleAdd(data: BrandFormValues): Promise<boolean> {
    setIsLoading(true)
    try {
      const newBrand: Brand = {
        id: Date.now().toString(),
        brandCode: data.brandCode,
        name: data.name,
        country: data.country ?? '',
        description: data.description ?? '',
        productCount: 0,
        status: data.status,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setBrands((prev) => [newBrand, ...prev])
      toast.success('Thêm thương hiệu thành công')
      return true
    } catch {
      toast.error('Thêm thương hiệu thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEdit(id: string, data: BrandFormValues): Promise<boolean> {
    setIsLoading(true)
    try {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                brandCode: data.brandCode,
                name: data.name,
                country: data.country ?? b.country,
                description: data.description ?? b.description,
                status: data.status,
              }
            : b,
        ),
      )
      toast.success('Cập nhật thương hiệu thành công')
      return true
    } catch {
      toast.error('Cập nhật thương hiệu thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string): Promise<boolean> {
    setIsLoading(true)
    try {
      setBrands((prev) => prev.filter((b) => b.id !== id))
      toast.success('Xóa thương hiệu thành công')
      return true
    } catch {
      toast.error('Xóa thương hiệu thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteMany(ids: string[]): Promise<boolean> {
    setIsLoading(true)
    try {
      setBrands((prev) => prev.filter((b) => !ids.includes(b.id)))
      toast.success(`Xóa ${ids.length} thương hiệu thành công`)
      return true
    } catch {
      toast.error('Xóa thương hiệu thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { brands, isLoading, handleAdd, handleEdit, handleDelete, handleDeleteMany }
}
