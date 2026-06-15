'use client'

import { useCategories } from './categories-provider'
import { CategoriesMutateDialog } from './categories-mutate-dialog'
import { CategoriesDeleteDialog } from './categories-delete-dialog'

export function CategoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCategories()

  return (
    <>
      <CategoriesMutateDialog
        key="category-add"
        open={open === 'add'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />
      {currentRow && (
        <CategoriesMutateDialog
          key="category-edit"
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
      <CategoriesDeleteDialog
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
