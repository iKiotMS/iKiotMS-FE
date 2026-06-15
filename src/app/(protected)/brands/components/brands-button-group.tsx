'use client'

import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBrands } from './brands-provider'

export function BrandsButtonGroup() {
  const { setOpen } = useBrands()
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button variant="outline" size="sm" className="cursor-pointer">
        <Download className="mr-2 size-4" />
        Xuất file
      </Button>
      <Button size="sm" className="cursor-pointer" onClick={() => setOpen('add')}>
        <Plus className="mr-2 size-4" />
        Thêm thương hiệu
      </Button>
    </div>
  )
}
