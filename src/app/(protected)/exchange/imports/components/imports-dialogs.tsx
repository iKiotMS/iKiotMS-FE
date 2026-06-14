'use client'

import { useImports } from './imports-provider'
import { ImportsCreateDialog } from './imports-create-dialog'
import { ImportsDetailSheet } from './imports-detail-sheet'

export function ImportsDialogs() {
  const { open, setOpen, currentRow } = useImports()

  return (
    <>
      <ImportsCreateDialog
        open={open === 'create'}
        onOpenChange={(v) => !v && setOpen(null)}
      />
      <ImportsDetailSheet
        open={open === 'detail'}
        onOpenChange={(v) => !v && setOpen(null)}
        request={currentRow}
      />
    </>
  )
}
