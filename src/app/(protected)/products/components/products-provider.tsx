'use client'

import React, { useState } from 'react'
import initialProductsData from '../data/products.json'
import type { ProductFormValues } from './products-mutate-dialog'

export interface Product {
  id: string
  productCode: string
  sku: string
  barcode: string
  name: string
  categoryName: string
  brandName: string
  retailPrice: number
  costPrice: number
  VAT: number
  stock: number
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  warrantyPeriod: string
  description: string
  createdAt: string
}

type ProductsDialogType = 'add' | 'edit' | 'delete'

type ProductsContextType = {
  products: Product[]
  open: ProductsDialogType | null
  setOpen: (str: ProductsDialogType | null) => void
  currentRow: Product | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Product | null>>
  handleAdd: (data: ProductFormValues) => void
  handleEdit: (id: string, data: ProductFormValues) => void
  handleDelete: (id: string) => void
}

const ProductsContext = React.createContext<ProductsContextType | null>(null)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProductsData as Product[])
  const [open, setOpen] = useState<ProductsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Product | null>(null)

  function handleAdd(data: ProductFormValues) {
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
    }
    setProducts((prev) => [newProduct, ...prev])
  }

  function handleEdit(id: string, data: ProductFormValues) {
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
  }

  function handleDelete(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <ProductsContext.Provider
      value={{ products, open, setOpen, currentRow, setCurrentRow, handleAdd, handleEdit, handleDelete }}
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
