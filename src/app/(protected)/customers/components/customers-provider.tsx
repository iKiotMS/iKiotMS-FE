'use client'

import React, { useState } from 'react'
import initialData from '../data/customers.json'
import type { CustomerFormValues } from './customers-mutate-dialog'

export interface CustomerOrder {
  id: string
  branchName: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED'
  staffName: string
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY'
  grandTotal: number
  items: { productName: string; quantity: number; unitPrice: number }[]
  createdAt: string
}

export interface Customer {
  id: string
  customerCode: string
  name: string
  phone: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  address: string
  dob: string
  createdAt: string
  orders: CustomerOrder[]
}

type CustomersDialogType = 'add' | 'edit' | 'delete'

type CustomersContextType = {
  customers: Customer[]
  open: CustomersDialogType | null
  setOpen: (str: CustomersDialogType | null) => void
  currentRow: Customer | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Customer | null>>
  handleAdd: (data: CustomerFormValues) => void
  handleEdit: (id: string, data: CustomerFormValues) => void
  handleDelete: (id: string) => void
}

const CustomersContext = React.createContext<CustomersContextType | null>(null)

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(initialData as Customer[])
  const [open, setOpen] = useState<CustomersDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Customer | null>(null)

  function handleAdd(data: CustomerFormValues) {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      customerCode: `KH-${String(customers.length + 1).padStart(3, '0')}`,
      name: data.name,
      phone: data.phone ?? '',
      gender: data.gender,
      address: data.address ?? '',
      dob: data.dob ?? '',
      createdAt: new Date().toISOString().split('T')[0],
      orders: [],
    }
    setCustomers((prev) => [newCustomer, ...prev])
  }

  function handleEdit(id: string, data: CustomerFormValues) {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              name: data.name,
              phone: data.phone ?? c.phone,
              gender: data.gender,
              address: data.address ?? c.address,
              dob: data.dob ?? c.dob,
            }
          : c,
      ),
    )
  }

  function handleDelete(id: string) {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <CustomersContext.Provider
      value={{ customers, open, setOpen, currentRow, setCurrentRow, handleAdd, handleEdit, handleDelete }}
    >
      {children}
    </CustomersContext.Provider>
  )
}

export function useCustomers() {
  const ctx = React.useContext(CustomersContext)
  if (!ctx) throw new Error('useCustomers must be used within <CustomersProvider>')
  return ctx
}
