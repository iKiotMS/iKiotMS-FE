import { PageHeader } from '@/components/page-header'
import { ProductsButtonGroup } from './_components/products-button-group'
import { ProductsTable } from './_components/table/products-table'

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Hàng hóa' },
        ]}
        title="Hàng hóa"
        description="Quản lý danh sách hàng hóa, giá bán và tồn kho"
        actions={<ProductsButtonGroup />}
      />
      <ProductsTable />
    </div>
  )
}
