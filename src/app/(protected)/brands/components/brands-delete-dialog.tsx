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
import { useBrands, type Brand } from './brands-provider'

type BrandsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Brand | null
}

export function BrandsDeleteDialog({ open, onOpenChange, currentRow }: BrandsDeleteDialogProps) {
  const { handleDelete } = useBrands()

  function onConfirm() {
    if (currentRow) handleDelete(currentRow.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa thương hiệu</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa thương hiệu{' '}
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
