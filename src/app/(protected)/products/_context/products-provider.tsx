// [Context – UI State]
'use client'

import React, { useEffect, useState } from 'react'
import type { Product } from '@/types/product'
import type { ProductsDialogType, ProductFormValues } from '../_types/product.types'
import { useProductsMutations } from '../_hooks/use-products-mutations'
import { branchApi } from '@/lib/api/branch'
import { warehouseApi } from '@/lib/api/warehouse'

type LocationOption = { value: string; label: string }

type ProductsContextType = {
  products: Product[]
  isLoading: boolean
  open: ProductsDialogType | null
  setOpen: (str: ProductsDialogType | null) => void
  currentRow: Product | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Product | null>>
  handleAdd: (data: ProductFormValues) => Promise<boolean>
  handleEdit: (id: string, data: ProductFormValues) => Promise<boolean>
  handleDelete: (id: string) => Promise<boolean>
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  handleDeleteMany: (ids: string[]) => Promise<boolean>
  selectionVersion: number
  branchOptions: LocationOption[]
  warehouseOptions: LocationOption[]
}

const ProductsContext = React.createContext<ProductsContextType | null>(null)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const { products, isLoading, handleAdd, handleEdit, handleDelete, handleDeleteMany } =
    useProductsMutations()
  const [open, setOpen] = useState<ProductsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Product | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionVersion, setSelectionVersion] = useState(0)
  const [branchOptions, setBranchOptions] = useState<LocationOption[]>([])
  const [warehouseOptions, setWarehouseOptions] = useState<LocationOption[]>([])

  useEffect(() => {
    async function loadLocationOptions() {
      try {
        const res = await branchApi.getList({ limit: 100 })
        setBranchOptions((res.data ?? []).map((b) => ({ value: b._id, label: b.name })))
      } catch {
        setBranchOptions([])
      }
      try {
        const res = await warehouseApi.getList({ limit: 100 })
        setWarehouseOptions((res.data ?? []).map((w) => ({ value: w._id, label: w.name })))
      } catch {
        setWarehouseOptions([])
      }
    }
    loadLocationOptions()
  }, [])

  async function handleDeleteManyWrapper(ids: string[]): Promise<boolean> {
    const success = await handleDeleteMany(ids)
    if (success) {
      setSelectedIds([])
      setSelectionVersion((v) => v + 1)
    }
    return success
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        handleAdd,
        handleEdit,
        handleDelete,
        selectedIds,
        setSelectedIds,
        handleDeleteMany: handleDeleteManyWrapper,
        selectionVersion,
        branchOptions,
        warehouseOptions,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = React.useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within <ProductsProvider>')
  return ctx
}
