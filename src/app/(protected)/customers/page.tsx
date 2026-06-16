'use client'

import { PageHeader } from '@/components/page-header'
import { CustomersProvider } from './components/customers-provider'
import { CustomersButtonGroup } from './components/customers-button-group'
import { CustomersTable } from './components/customers-table'

export default function CustomersPage() {
  return (
    <CustomersProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <PageHeader
          breadcrumbs={[
            { label: 'Trang chủ', href: '/dashboard' },
            { label: 'Khách hàng' },
          ]}
          title="Khách hàng"
          description="Quản lý danh sách khách hàng và lịch sử mua hàng"
          actions={<CustomersButtonGroup />}
        />
        <CustomersTable />
      </div>
    </CustomersProvider>
  )
}
