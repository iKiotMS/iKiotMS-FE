'use client'

import React, { useState } from 'react'
import initialData from '../data/customers.json'

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

type CustomersContextType = {
  customers: Customer[]
}

const CustomersContext = React.createContext<CustomersContextType | null>(null)

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [customers] = useState<Customer[]>(initialData as Customer[])

  return (
    <CustomersContext.Provider value={{ customers }}>
      {children}
    </CustomersContext.Provider>
  )
}

export function useCustomers() {
  const ctx = React.useContext(CustomersContext)
  if (!ctx) throw new Error('useCustomers must be used within <CustomersProvider>')
  return ctx
}
