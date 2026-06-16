'use client'

import { useBrands } from './brands-provider'
import { BrandsMutateDialog } from './brands-mutate-dialog'
import { BrandsDeleteDialog } from './brands-delete-dialog'

export function BrandsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useBrands()

  return (
    <>
      <BrandsMutateDialog
        key="brand-add"
        open={open === 'add'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />
      {currentRow && (
        <BrandsMutateDialog
          key="brand-edit"
          open={open === 'edit'}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null)
              setCurrentRow(null)
            }
          }}
          currentRow={currentRow}
        />
      )}
      <BrandsDeleteDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
        currentRow={currentRow}
      />
    </>
  )
}
