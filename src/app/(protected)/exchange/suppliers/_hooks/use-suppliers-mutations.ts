// [Mutations – Supplier]
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Supplier, SupplierTransaction } from '@/types/supplier'
import type { SupplierFormValues } from '../_types/supplier.types'
import initialData from '../data/suppliers.json'

const MOCK_HISTORY: Record<string, SupplierTransaction[]> = {
  '1': [
    { id: 't1-1', supplierId: '1', type: 'PURCHASE', reference: 'PO-2024-0312', amount: 15000000, balance: 15000000, description: 'Nhập hàng rau củ quả tháng 3', date: '2024-03-12' },
    { id: 't1-2', supplierId: '1', type: 'PAYMENT', reference: 'PM-2024-0318', amount: 8000000, balance: 7000000, description: 'Thanh toán đợt 1', date: '2024-03-18' },
    { id: 't1-3', supplierId: '1', type: 'PURCHASE', reference: 'PO-2024-0401', amount: 12000000, balance: 19000000, description: 'Nhập hàng thực phẩm tháng 4', date: '2024-04-01' },
    { id: 't1-4', supplierId: '1', type: 'RETURN', reference: 'RT-2024-0405', amount: 1500000, balance: 17500000, description: 'Trả hàng lỗi', date: '2024-04-05' },
    { id: 't1-5', supplierId: '1', type: 'PAYMENT', reference: 'PM-2024-0415', amount: 5000000, balance: 12500000, description: 'Thanh toán đợt 2', date: '2024-04-15' },
  ],
  '2': [
    { id: 't2-1', supplierId: '2', type: 'PURCHASE', reference: 'PO-2024-0210', amount: 40000000, balance: 40000000, description: 'Nhập nông sản tháng 2', date: '2024-02-10' },
    { id: 't2-2', supplierId: '2', type: 'PAYMENT', reference: 'PM-2024-0220', amount: 20000000, balance: 20000000, description: 'Thanh toán đợt 1', date: '2024-02-20' },
    { id: 't2-3', supplierId: '2', type: 'PURCHASE', reference: 'PO-2024-0301', amount: 35000000, balance: 55000000, description: 'Nhập nông sản tháng 3', date: '2024-03-01' },
    { id: 't2-4', supplierId: '2', type: 'PAYMENT', reference: 'PM-2024-0315', amount: 20000000, balance: 35000000, description: 'Thanh toán đợt 2', date: '2024-03-15' },
  ],
  '3': [
    { id: 't3-1', supplierId: '3', type: 'PURCHASE', reference: 'PO-2024-0105', amount: 22000000, balance: 22000000, description: 'Nhập rau củ Đà Lạt đợt 1', date: '2024-01-05' },
    { id: 't3-2', supplierId: '3', type: 'PAYMENT', reference: 'PM-2024-0115', amount: 22000000, balance: 0, description: 'Thanh toán toàn bộ', date: '2024-01-15' },
  ],
  '4': [
    { id: 't4-1', supplierId: '4', type: 'PURCHASE', reference: 'PO-2024-0301', amount: 35000000, balance: 35000000, description: 'Nhập hải sản tươi tháng 3', date: '2024-03-01' },
    { id: 't4-2', supplierId: '4', type: 'PAYMENT', reference: 'PM-2024-0310', amount: 10000000, balance: 25000000, description: 'Thanh toán đợt 1', date: '2024-03-10' },
    { id: 't4-3', supplierId: '4', type: 'PURCHASE', reference: 'PO-2024-0401', amount: 15000000, balance: 40000000, description: 'Nhập hải sản tháng 4', date: '2024-04-01' },
    { id: 't4-4', supplierId: '4', type: 'PAYMENT', reference: 'PM-2024-0412', amount: 12000000, balance: 28000000, description: 'Thanh toán đợt 2', date: '2024-04-12' },
  ],
  '5': [
    { id: 't5-1', supplierId: '5', type: 'PURCHASE', reference: 'PO-2024-0215', amount: 60000000, balance: 60000000, description: 'Nhập thực phẩm đông lạnh tháng 2', date: '2024-02-15' },
    { id: 't5-2', supplierId: '5', type: 'PAYMENT', reference: 'PM-2024-0228', amount: 30000000, balance: 30000000, description: 'Thanh toán đợt 1', date: '2024-02-28' },
    { id: 't5-3', supplierId: '5', type: 'PURCHASE', reference: 'PO-2024-0310', amount: 40000000, balance: 70000000, description: 'Nhập thực phẩm đông lạnh tháng 3', date: '2024-03-10' },
    { id: 't5-4', supplierId: '5', type: 'PAYMENT', reference: 'PM-2024-0325', amount: 22500000, balance: 47500000, description: 'Thanh toán đợt 2', date: '2024-03-25' },
  ],
  '6': [
    { id: 't6-1', supplierId: '6', type: 'PURCHASE', reference: 'PO-2024-0310', amount: 12000000, balance: 12000000, description: 'Nhập rau hữu cơ tháng 3', date: '2024-03-10' },
    { id: 't6-2', supplierId: '6', type: 'PAYMENT', reference: 'PM-2024-0318', amount: 7000000, balance: 5000000, description: 'Thanh toán đợt 1', date: '2024-03-18' },
  ],
  '7': [],
  '8': [
    { id: 't8-1', supplierId: '8', type: 'PURCHASE', reference: 'PO-2024-0401', amount: 18000000, balance: 18000000, description: 'Nhập gia vị và nguyên liệu', date: '2024-04-01' },
    { id: 't8-2', supplierId: '8', type: 'PAYMENT', reference: 'PM-2024-0410', amount: 8200000, balance: 9800000, description: 'Thanh toán đợt 1', date: '2024-04-10' },
  ],
}

export function useSuppliersMutations() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialData as Supplier[])
  const [isLoading, setIsLoading] = useState(false)

  async function handleAdd(data: SupplierFormValues): Promise<boolean> {
    setIsLoading(true)
    try {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        supplierCode: data.supplierCode,
        supplierName: data.supplierName,
        contactName: data.contactName ?? '',
        phoneNumber: data.phoneNumber ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        creditLimit: data.creditLimit,
        outstandingDebt: 0,
        status: data.status,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setSuppliers((prev) => [newSupplier, ...prev])
      toast.success('Thêm nhà cung cấp thành công')
      return true
    } catch {
      toast.error('Thêm nhà cung cấp thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEdit(id: string, data: SupplierFormValues): Promise<boolean> {
    setIsLoading(true)
    try {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                supplierCode: data.supplierCode,
                supplierName: data.supplierName,
                contactName: data.contactName ?? s.contactName,
                phoneNumber: data.phoneNumber ?? s.phoneNumber,
                email: data.email ?? s.email,
                address: data.address ?? s.address,
                creditLimit: data.creditLimit,
                status: data.status,
              }
            : s,
        ),
      )
      toast.success('Cập nhật nhà cung cấp thành công')
      return true
    } catch {
      toast.error('Cập nhật nhà cung cấp thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string): Promise<boolean> {
    setIsLoading(true)
    try {
      setSuppliers((prev) => prev.filter((s) => s.id !== id))
      toast.success('Xóa nhà cung cấp thành công')
      return true
    } catch {
      toast.error('Xóa nhà cung cấp thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteMany(ids: string[]): Promise<boolean> {
    setIsLoading(true)
    try {
      setSuppliers((prev) => prev.filter((s) => !ids.includes(s.id)))
      toast.success(`Xóa ${ids.length} nhà cung cấp thành công`)
      return true
    } catch {
      toast.error('Xóa nhà cung cấp thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function getHistory(supplierId: string): Promise<SupplierTransaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return MOCK_HISTORY[supplierId] ?? []
  }

  return { suppliers, isLoading, handleAdd, handleEdit, handleDelete, handleDeleteMany, getHistory }
}
