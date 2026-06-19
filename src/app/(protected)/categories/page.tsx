// [Page – Categories]
import { PageHeader } from '@/components/page-header'
import { CategoriesButtonGroup } from './_components/categories-button-group'
import { CategoriesTable } from './_components/table/categories-table'

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Danh mục' },
        ]}
        title="Danh mục"
        description="Quản lý danh mục hàng hóa trong cửa hàng"
        actions={<CategoriesButtonGroup />}
      />
      <CategoriesTable />
    </div>
  )
}
