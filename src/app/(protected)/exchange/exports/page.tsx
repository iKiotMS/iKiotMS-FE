'use client'

import { TransfersProvider } from './components/transfers-provider'
import { TransfersButtonGroup } from './components/transfers-button-group'
import { TransfersTable } from './components/transfers-table'
import { TransfersDialogs } from './components/transfers-dialogs'

export default function ExportsPage() {
  return (
    <TransfersProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chuyển kho</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý yêu cầu chuyển hàng hóa giữa các kho và chi nhánh
            </p>
          </div>
          <TransfersButtonGroup />
        </div>
        <TransfersTable />
      </div>
      <TransfersDialogs />
    </TransfersProvider>
  )
}
