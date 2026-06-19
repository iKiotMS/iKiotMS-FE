// [Mutations – Product]
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Product } from '@/types/product'
import type { ProductFormValues } from '../_types/product.types'
import initialData from '../data/products.json'

export function useProductsMutations() {
  const [products, setProducts] = useState<Product[]>(initialData as Product[])
  const [isLoading, setIsLoading] = useState(false)

  async function handleAdd(data: ProductFormValues): Promise<boolean> {
    setIsLoading(true)
    try {
      const newProduct: Product = {
        id: Date.now().toString(),
        productCode: data.productCode,
        sku: data.sku,
        barcode: data.barcode ?? '',
        name: data.name,
        categoryName: data.categoryName,
        brandName: data.brandName ?? '',
        retailPrice: data.retailPrice,
        costPrice: data.costPrice,
        VAT: data.VAT ?? 0,
        stock: 0,
        status: data.status,
        warrantyPeriod: data.warrantyPeriod ?? '',
        description: data.description ?? '',
        createdAt: new Date().toISOString().split('T')[0],
        imageUrl: '',
      }
      setProducts((prev) => [newProduct, ...prev])
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
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                name: data.name,
                productCode: data.productCode,
                sku: data.sku,
                barcode: data.barcode ?? p.barcode,
                categoryName: data.categoryName,
                brandName: data.brandName ?? p.brandName,
                retailPrice: data.retailPrice,
                costPrice: data.costPrice,
                VAT: data.VAT ?? p.VAT,
                warrantyPeriod: data.warrantyPeriod ?? p.warrantyPeriod,
                description: data.description ?? p.description,
                status: data.status,
              }
            : p,
        ),
      )
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
