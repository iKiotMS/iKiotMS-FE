'use client'

import { BrandsProvider } from './components/brands-provider'
import { BrandsButtonGroup } from './components/brands-button-group'
import { BrandsTable } from './components/brands-table'
import { BrandsDialogs } from './components/brands-dialogs'

export default function BrandsPage() {
  return (
    <BrandsProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Thương hiệu</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý thương hiệu và nhà sản xuất hàng hóa
            </p>
          </div>
          <BrandsButtonGroup />
        </div>
        <BrandsTable />
      </div>

      <BrandsDialogs />
    </BrandsProvider>
  )
}
