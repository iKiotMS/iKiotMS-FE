'use client'

import React, { useState } from 'react'
import initialData from '../data/categories.json'
import type { CategoryFormValues } from './categories-mutate-dialog'

export interface Category {
  id: string
  categoryCode: string
  name: string
  description: string
  productCount: number
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
}

type CategoriesDialogType = 'add' | 'edit' | 'delete'

type CategoriesContextType = {
  categories: Category[]
  open: CategoriesDialogType | null
  setOpen: (str: CategoriesDialogType | null) => void
  currentRow: Category | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Category | null>>
  handleAdd: (data: CategoryFormValues) => void
  handleEdit: (id: string, data: CategoryFormValues) => void
  handleDelete: (id: string) => void
}

const CategoriesContext = React.createContext<CategoriesContextType | null>(null)

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialData as Category[])
  const [open, setOpen] = useState<CategoriesDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Category | null>(null)

  function handleAdd(data: CategoryFormValues) {
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
  }

  function handleEdit(id: string, data: CategoryFormValues) {
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
  }

  function handleDelete(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <CategoriesContext.Provider
      value={{ categories, open, setOpen, currentRow, setCurrentRow, handleAdd, handleEdit, handleDelete }}
    >
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = React.useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories must be used within <CategoriesProvider>')
  return ctx
}
