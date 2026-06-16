'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCustomers, type Customer } from './customers-provider'

type CustomersDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Customer | null
}

export function CustomersDeleteDialog({ open, onOpenChange, currentRow }: CustomersDeleteDialogProps) {
  const { handleDelete } = useCustomers()

  function onConfirm() {
    if (currentRow) handleDelete(currentRow.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa khách hàng</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa khách hàng{' '}
            <strong className="text-foreground">{currentRow?.name ?? ''}</strong>?{' '}
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="cursor-pointer">
            <Trash2 className="mr-2 size-4" />
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
