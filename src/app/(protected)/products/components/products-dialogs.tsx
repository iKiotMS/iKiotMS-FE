'use client'

import { useProducts } from './products-provider'
import { ProductsMutateDialog } from './products-mutate-dialog'
import { ProductsDeleteDialog } from './products-delete-dialog'

export function ProductsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts()

  return (
    <>
      <ProductsMutateDialog
        key="product-add"
        open={open === 'add'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />
      {currentRow && (
        <ProductsMutateDialog
          key="product-edit"
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
      <ProductsDeleteDialog
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
