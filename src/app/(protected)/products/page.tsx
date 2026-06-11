'use client'

import { ProductsProvider } from './components/products-provider'
import { ProductsButtonGroup } from './components/products-button-group'
import { ProductsTable } from './components/products-table'
import { ProductsDialogs } from './components/products-dialogs'

export default function ProductsPage() {
  return (
    <ProductsProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hàng hóa</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý danh sách hàng hóa, giá bán và tồn kho
            </p>
          </div>
          <ProductsButtonGroup />
        </div>
        <ProductsTable />
      </div>

      <ProductsDialogs />
    </ProductsProvider>
  )
}
