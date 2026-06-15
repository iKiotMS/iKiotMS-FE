'use client'

import React, { useState } from 'react'
import initialData from '../data/brands.json'
import type { BrandFormValues } from './brands-mutate-dialog'

export interface Brand {
  id: string
  brandCode: string
  name: string
  country: string
  description: string
  productCount: number
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
}

type BrandsDialogType = 'add' | 'edit' | 'delete'

type BrandsContextType = {
  brands: Brand[]
  open: BrandsDialogType | null
  setOpen: (str: BrandsDialogType | null) => void
  currentRow: Brand | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Brand | null>>
  handleAdd: (data: BrandFormValues) => void
  handleEdit: (id: string, data: BrandFormValues) => void
  handleDelete: (id: string) => void
}

const BrandsContext = React.createContext<BrandsContextType | null>(null)

export function BrandsProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>(initialData as Brand[])
  const [open, setOpen] = useState<BrandsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Brand | null>(null)

  function handleAdd(data: BrandFormValues) {
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
  }

  function handleEdit(id: string, data: BrandFormValues) {
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
  }

  function handleDelete(id: string) {
    setBrands((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <BrandsContext.Provider
      value={{ brands, open, setOpen, currentRow, setCurrentRow, handleAdd, handleEdit, handleDelete }}
    >
      {children}
    </BrandsContext.Provider>
  )
}

export function useBrands() {
  const ctx = React.useContext(BrandsContext)
  if (!ctx) throw new Error('useBrands must be used within <BrandsProvider>')
  return ctx
}
