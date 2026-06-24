// [Mutations – Customer]
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Customer } from '@/types/customer'
import type { CustomerFormValues } from '../_types/customer.types'
import initialData from '../data/customers.json'

export function useCustomersMutations() {
  const [customers, setCustomers] = useState<Customer[]>(initialData as Customer[])
  const [isLoading, setIsLoading] = useState(false)

  async function handleAdd(data: CustomerFormValues): Promise<boolean> {
    setIsLoading(true)
    try {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        customerCode: data.customerCode,
        name: data.name,
        phone: data.phone ?? '',
        gender: data.gender,
        address: data.address ?? '',
        dob: data.dob ?? '',
        createdAt: new Date().toISOString().split('T')[0],
        orders: [],
      }
      setCustomers((prev) => [newCustomer, ...prev])
      toast.success('Thêm khách hàng thành công')
      return true
    } catch {
      toast.error('Thêm khách hàng thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEdit(id: string, data: CustomerFormValues): Promise<boolean> {
    setIsLoading(true)
    try {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                customerCode: data.customerCode,
                name: data.name,
                phone: data.phone ?? c.phone,
                gender: data.gender,
                address: data.address ?? c.address,
                dob: data.dob ?? c.dob,
              }
            : c,
        ),
      )
      toast.success('Cập nhật khách hàng thành công')
      return true
    } catch {
      toast.error('Cập nhật khách hàng thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string): Promise<boolean> {
    setIsLoading(true)
    try {
      setCustomers((prev) => prev.filter((c) => c.id !== id))
      toast.success('Xóa khách hàng thành công')
      return true
    } catch {
      toast.error('Xóa khách hàng thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteMany(ids: string[]): Promise<boolean> {
    setIsLoading(true)
    try {
      setCustomers((prev) => prev.filter((c) => !ids.includes(c.id)))
      toast.success(`Xóa ${ids.length} khách hàng thành công`)
      return true
    } catch {
      toast.error('Xóa khách hàng thất bại')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { customers, isLoading, handleAdd, handleEdit, handleDelete, handleDeleteMany }
}
