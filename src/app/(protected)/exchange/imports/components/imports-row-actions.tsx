'use client'

import { type Row } from '@tanstack/react-table'
import { Eye, EllipsisVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useImports } from './imports-provider'
import type { StockMovement } from '@/types/stock-movement'

export function ImportsRowActions({ row }: { row: Row<StockMovement> }) {
  const { setOpen, setCurrentRow } = useImports()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
          <EllipsisVertical className="size-4" />
          <span className="sr-only">Thao tác</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => { setCurrentRow(row.original); setOpen('detail') }}
        >
          <Eye className="mr-2 size-4" />
          Xem chi tiết
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
