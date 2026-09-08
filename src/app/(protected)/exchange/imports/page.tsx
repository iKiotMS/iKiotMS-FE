'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthScope } from '@/app/(protected)/exchange/shared/auth-scope'
import { canAccessImports } from '@/components/sidebar/constants/role-permissions'
import { ImportsProvider } from './components/imports-provider'
import { ImportsButtonGroup } from './components/imports-button-group'
import { ImportsTable } from './components/imports-table'
import { ImportsDialogs } from './components/imports-dialogs'

import { PageHeader } from "@/components/page-header"

export default function ImportsPage() {
  const router = useRouter()
  // Trực thuộc chi nhánh thì không tạo phiếu nhập - nhập hàng về kho.
  const branchId = getAuthScope().branchId
  const isBranchStaff = !canAccessImports(branchId)

  useEffect(() => {
    if (isBranchStaff) {
      router.replace('/exchange/exports')
    }
  }, [isBranchStaff, router])

  if (isBranchStaff) {
    return null
  }

  return (
    <ImportsProvider>
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <PageHeader
          breadcrumbs={[
            { label: "Trang chủ", href: "/dashboard" },
            { label: "Giao dịch" },
            { label: "Nhập hàng" },
          ]}
          title="Nhập hàng"
          actions={<ImportsButtonGroup />}
        />
        <ImportsTable />
      </div>
      <ImportsDialogs />
    </ImportsProvider>
  )
}
