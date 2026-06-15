'use client'

import { PageHeader } from '@/components/page-header'
import { BrandsProvider } from './components/brands-provider'
import { BrandsButtonGroup } from './components/brands-button-group'
import { BrandsTable } from './components/brands-table'
import { BrandsDialogs } from './components/brands-dialogs'

export default function BrandsPage() {
  return (
    <BrandsProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <PageHeader
          breadcrumbs={[
            { label: 'Trang chủ', href: '/dashboard' },
            { label: 'Thương hiệu' },
          ]}
          title="Thương hiệu"
          description="Quản lý thương hiệu và nhà sản xuất hàng hóa"
          actions={<BrandsButtonGroup />}
        />
        <BrandsTable />
      </div>

      <BrandsDialogs />
    </BrandsProvider>
  )
}
