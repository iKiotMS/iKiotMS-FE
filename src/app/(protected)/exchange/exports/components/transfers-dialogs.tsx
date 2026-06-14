'use client'

import { useTransfers } from './transfers-provider'
import { TransfersCreateDialog } from './transfers-create-dialog'
import { TransfersDetailSheet } from './transfers-detail-sheet'

export function TransfersDialogs() {
  const { open, setOpen, currentRow } = useTransfers()
  return (
    <>
      <TransfersCreateDialog open={open === 'create'} onOpenChange={(v) => !v && setOpen(null)} />
      <TransfersDetailSheet open={open === 'detail'} onOpenChange={(v) => !v && setOpen(null)} request={currentRow} />
    </>
  )
}
