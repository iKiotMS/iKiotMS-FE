'use client'

import { TransfersProvider } from './components/transfers-provider'
import { TransfersButtonGroup } from './components/transfers-button-group'
import { TransfersTable } from './components/transfers-table'
import { TransfersDialogs } from './components/transfers-dialogs'
import { useTransfers } from './components/transfers-provider'

function ExportsPageContent() {
  const { labels } = useTransfers()

  return (
    <>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{labels.moduleTitle}</h1>
            <p className="text-muted-foreground text-sm mt-1">{labels.moduleSubtitle}</p>
          </div>
          <TransfersButtonGroup />
        </div>
        <TransfersTable />
      </div>
      <TransfersDialogs />
    </>
  )
}

export default function ExportsPage() {
  return (
    <TransfersProvider>
      <ExportsPageContent />
    </TransfersProvider>
  )
}
