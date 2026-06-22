import { type ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import { STATUS_MAP } from '../../_constants/product.constants'

function SortableHeader({
  label,
  column,
}: {
  label: string
  column: {
    getIsSorted: () => false | 'asc' | 'desc'
    toggleSorting: (desc?: boolean) => void
  }
}) {
  const sorted = column.getIsSorted()
  return (
    <button
      className="flex items-center gap-1 cursor-pointer hover:text-foreground"
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {label}
      {sorted === 'asc' ? (
        <ChevronUp className="size-3" />
      ) : sorted === 'desc' ? (
        <ChevronDown className="size-3" />
      ) : (
        <ChevronsUpDown className="size-3 text-muted-foreground" />
      )}
    </button>
  )
}

export const productsColumns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center px-2">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center px-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Chọn dòng"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    id: 'image',
    header: '',
    cell: ({ row }) => {
      const thumbnail =
        row.original.images?.find((i) => i.isThumbnail) ?? row.original.images?.[0]
      return (
        <img
          src={thumbnail?.url || 'https://placehold.co/40x40/e2e8f0/94a3b8?text=IMG'}
          alt={row.original.name}
          className="size-10 rounded-md object-cover border"
        />
      )
    },
    size: 56,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader label="Tên hàng hóa" column={column} />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'categoryName',
    header: 'Danh mục',
    cell: ({ row }) => {
      const cat = row.getValue('categoryName') as string | undefined
      return cat ? (
        <Badge variant="secondary" className="text-xs">
          {cat}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      )
    },
    filterFn: (row, columnId, value: string) => row.getValue(columnId) === value,
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const status = row.getValue('status') as Product['status']
      const { label, className } = STATUS_MAP[status]
      return (
        <Badge variant="secondary" className={className}>
          {label}
        </Badge>
      )
    },
    filterFn: (row, columnId, value: string) => row.getValue(columnId) === value,
  },
  {
    id: 'expand',
    header: '',
    cell: ({ row }) => (
      <ChevronRight
        className={cn(
          'size-4 text-muted-foreground transition-transform duration-200',
          row.getIsExpanded() && 'rotate-90',
        )}
      />
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
]
