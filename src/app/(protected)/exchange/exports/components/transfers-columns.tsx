'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { StockMovement, MovementStatus } from '@/types/stock-movement'
import { TransfersRowActions } from './transfers-row-actions'

export const STATUS_MAP: Record<MovementStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Chờ duyệt',  className: 'text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20' },
  APPROVED:  { label: 'Đã duyệt',   className: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' },
  REJECTED:  { label: 'Từ chối',    className: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' },
  COMPLETED: { label: 'Hoàn thành', className: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' },
  CANCELLED: { label: 'Đã huỷ',     className: 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800' },
}

function SortableHeader({ label, column }: { label: string; column: { getIsSorted: () => false | 'asc' | 'desc'; toggleSorting: (desc?: boolean) => void } }) {
  const sorted = column.getIsSorted()
  return (
    <button className="flex items-center gap-1 cursor-pointer hover:text-foreground" onClick={() => column.toggleSorting(sorted === 'asc')}>
      {label}
      {sorted === 'asc' ? <ChevronUp className="size-3" /> : sorted === 'desc' ? <ChevronDown className="size-3" /> : <ChevronsUpDown className="size-3 text-muted-foreground" />}
    </button>
  )
}

export const transfersColumns: ColumnDef<StockMovement>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center px-2">
        <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Chọn tất cả" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center px-2">
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Chọn dòng" />
      </div>
    ),
    enableSorting: false, enableHiding: false, size: 50,
  },
  {
    accessorKey: '_id',
    header: 'Mã yêu cầu',
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">#{String(row.getValue('_id')).slice(-6).toUpperCase()}</span>,
  },
  {
    accessorKey: 'fromLocationName',
    header: 'Kho gửi',
    cell: ({ row }) => {
      const r = row.original
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{r.fromLocationName ?? '—'}</span>
          <span className="text-xs text-muted-foreground capitalize">{r.fromLocationType === 'warehouse' ? 'Kho' : 'Chi nhánh'}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'toLocationName',
    header: 'Kho nhận',
    cell: ({ row }) => {
      const r = row.original
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{r.toLocationName}</span>
          <span className="text-xs text-muted-foreground capitalize">{r.toLocationType === 'warehouse' ? 'Kho' : 'Chi nhánh'}</span>
        </div>
      )
    },
  },
  {
    id: 'totalItems',
    header: 'Số mặt hàng',
    cell: ({ row }) => <span className="tabular-nums">{row.original.details.length} mặt hàng</span>,
  },
  {
    id: 'totalQty',
    header: ({ column }) => <SortableHeader label="Tổng SL" column={column} />,
    accessorFn: (row) => row.details.reduce((s, d) => s + d.quantity, 0),
    cell: ({ getValue }) => <span className="tabular-nums">{(getValue() as number).toLocaleString('vi-VN')}</span>,
  },
  {
    accessorKey: 'requestedByName',
    header: 'Người yêu cầu',
    cell: ({ row }) => <span className="text-sm">{row.getValue('requestedByName')}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <SortableHeader label="Ngày tạo" column={column} />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy', { locale: vi })}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const status = row.getValue('status') as MovementStatus
      const { label, className } = STATUS_MAP[status]
      return <Badge variant="secondary" className={className}>{label}</Badge>
    },
    filterFn: (row, columnId, value: string) => row.getValue(columnId) === value,
  },
  {
    id: 'actions',
    header: 'Thao tác',
    cell: ({ row }) => <TransfersRowActions row={row} />,
    enableSorting: false, enableHiding: false,
  },
]
