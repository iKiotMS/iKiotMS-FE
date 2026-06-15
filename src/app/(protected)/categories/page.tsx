'use client'

import { CategoriesProvider } from './components/categories-provider'
import { CategoriesButtonGroup } from './components/categories-button-group'
import { CategoriesTable } from './components/categories-table'
import { CategoriesDialogs } from './components/categories-dialogs'

export default function CategoriesPage() {
  return (
    <CategoriesProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Danh mục</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý danh mục hàng hóa trong cửa hàng
            </p>
          </div>
          <CategoriesButtonGroup />
        </div>
        <CategoriesTable />
      </div>

      <CategoriesDialogs />
    </CategoriesProvider>
  )
}
