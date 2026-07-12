'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthScope } from '@/app/(protected)/exchange/shared/auth-scope'
import { ImportsProvider } from './components/imports-provider'
import { ImportsButtonGroup } from './components/imports-button-group'
import { ImportsTable } from './components/imports-table'
import { ImportsDialogs } from './components/imports-dialogs'

export default function ImportsPage() {
  const router = useRouter()
  const role = getAuthScope().role
  const isBranchManager = role === 'BRANCH_MANAGER'

  useEffect(() => {
    if (isBranchManager) {
      router.replace('/exchange/exports')
    }
  }, [isBranchManager, router])

  if (isBranchManager) {
    return null
  }

  return (
    <ImportsProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nhập hàng</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý đơn nhập hàng từ nhà cung cấp vào kho / chi nhánh
            </p>
          </div>
          <ImportsButtonGroup />
        </div>
        <ImportsTable />
      </div>
      <ImportsDialogs />
    </ImportsProvider>
  )
}
