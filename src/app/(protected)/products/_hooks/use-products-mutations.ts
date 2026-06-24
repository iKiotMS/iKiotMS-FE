// [Mutations – Product]
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { Product } from '@/types/product'
import type { ProductFormValues } from '../_types/product.types'
import { productApi } from '@/lib/api/product'

export function useProductsMutations() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    productApi
      .getList()
      .then((res) => setProducts(res.data))
      .catch(() => toast.error('Tải danh sách hàng hóa thất bại'))
  }, [])

  async function handleAdd(data: ProductFormValues): Promise<boolean> {
    setIsLoading(true)
    try {
      const product = await productApi.create({
        name: data.name,
        categoryName: data.categoryName,
        status: data.status,
        items: [
          {
            productCode: data.productCode ?? '',
            sku: data.sku ?? '',
            barcode: data.barcode,
            retailPrice: data.retailPrice ?? 0,
            costPrice: data.costPrice ?? 0,
            VAT: data.VAT,
            warrantyPeriod: data.warrantyPeriod,
            description: data.description,
          },
        ],
      })
      setProducts((prev) => [product, ...prev])
      toast.success('Thêm hàng hóa thành công')
      return true
    } catch {
      toast.error('Thêm hàng hóa thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEdit(id: string, data: ProductFormValues): Promise<boolean> {
    setIsLoading(true)
    try {
      const product = await productApi.update(id, {
        name: data.name,
        categoryName: data.categoryName,
        status: data.status,
      })
      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)))
      toast.success('Cập nhật hàng hóa thành công')
      return true
    } catch {
      toast.error('Cập nhật hàng hóa thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string): Promise<boolean> {
    setIsLoading(true)
    try {
      await productApi.remove(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Xóa hàng hóa thành công')
      return true
    } catch {
      toast.error('Xóa hàng hóa thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteMany(ids: string[]): Promise<boolean> {
    setIsLoading(true)
    try {
      await Promise.all(ids.map((id) => productApi.remove(id)))
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)))
      toast.success(`Xóa ${ids.length} hàng hóa thành công`)
      return true
    } catch {
      toast.error('Xóa hàng hóa thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { products, isLoading, handleAdd, handleEdit, handleDelete, handleDeleteMany }
}
