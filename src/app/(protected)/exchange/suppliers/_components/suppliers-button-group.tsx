// [Component – Button Group Supplier]
'use client'

import { Download, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSuppliers } from '../_context/suppliers-provider'

export function SuppliersButtonGroup() {
  const { setOpen, selectedIds } = useSuppliers()
  return (
    <div className="flex shrink-0 items-center gap-2">
      {selectedIds.length > 0 && (
        <Button
          variant="destructive"
          size="sm"
          className="cursor-pointer"
          onClick={() => setOpen('deleteMany')}
        >
          <Trash2 className="mr-2 size-4" />
          Xóa {selectedIds.length} mục
        </Button>
      )}
      <Button variant="outline" size="sm" className="cursor-pointer">
        <Download className="mr-2 size-4" />
        Xuất file
      </Button>
      <Button size="sm" className="cursor-pointer" onClick={() => setOpen('add')}>
        <Plus className="mr-2 size-4" />
        Thêm nhà cung cấp
      </Button>
    </div>
  )
}
