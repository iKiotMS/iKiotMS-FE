'use client'

import { useCustomers } from './customers-provider'
import { CustomersMutateDialog } from './customers-mutate-dialog'
import { CustomersDeleteDialog } from './customers-delete-dialog'

export function CustomersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers()

  return (
    <>
      <CustomersMutateDialog
        key="customer-add"
        open={open === 'add'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />
      {currentRow && (
        <CustomersMutateDialog
          key="customer-edit"
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
      <CustomersDeleteDialog
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
