// [Page – Brands]
import { PageHeader } from '@/components/page-header'
import { BrandsButtonGroup } from './_components/brands-button-group'
import { BrandsTable } from './_components/table/brands-table'

export default function BrandsPage() {
  return (
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
  )
}
