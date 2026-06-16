'use client'

import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  type ColumnFiltersState,
  type ExpandedState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { CalendarIcon, Funnel, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useCustomers, type Customer, type CustomerOrder } from './customers-provider'
import { customersColumns as columns, GENDER_MAP } from './customers-columns'
import { CustomersEmpty } from './customers-empty'

const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

const COLUMN_LABELS: Record<string, string> = {
  customerCode: 'Mã KH',
  name: 'Tên khách hàng',
  gender: 'Giới tính',
  address: 'Địa chỉ',
  totalSpending: 'Tổng chi tiêu',
  createdAt: 'Ngày tạo',
}

const ORDER_STATUS_MAP: Record<
  CustomerOrder['status'],
  { label: string; className: string }
> = {
  COMPLETED: {
    label: 'Hoàn thành',
    className: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  },
  PENDING: {
    label: 'Đang xử lý',
    className: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  },
  RETURNED: {
    label: 'Trả hàng',
    className: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
  },
}

const PAYMENT_LABEL: Record<CustomerOrder['paymentMethod'], string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  MOMO: 'MoMo',
  VNPAY: 'VNPay',
}

function CustomerExpandedPanel({
  customer,
  isExpanded,
}: {
  customer: Customer
  isExpanded: boolean
}) {
  const [loading, setLoading] = useState(false)
  const wasExpandedRef = useRef(false)

  useLayoutEffect(() => {
    if (isExpanded && !wasExpandedRef.current) {
      wasExpandedRef.current = true
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 350)
      return () => clearTimeout(t)
    }
    if (!isExpanded) {
      wasExpandedRef.current = false
    }
  }, [isExpanded])

  const totalSpending = customer.orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.grandTotal, 0)

  if (loading) {
    return (
      <div className="bg-background border-b px-6 py-4 space-y-4">
        <div className="flex gap-4 mb-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
      <Tabs defaultValue="info">
        <TabsList className="mb-4">
          <TabsTrigger value="info" className="cursor-pointer">Thông tin</TabsTrigger>
          <TabsTrigger value="history" className="cursor-pointer">
            Lịch sử mua hàng
            <Badge variant="secondary" className="ml-1.5 text-xs">
              {customer.orders.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Customer info */}
        <TabsContent value="info">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Mã khách hàng</span>
              <span className="font-mono font-medium">{customer.customerCode}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Họ và tên</span>
              <span className="font-medium">{customer.name}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Số điện thoại</span>
              <span>{customer.phone || '—'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Giới tính</span>
              <Badge
                variant="secondary"
                className={cn('w-fit text-xs', GENDER_MAP[customer.gender].className)}
              >
                {GENDER_MAP[customer.gender].label}
              </Badge>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Ngày sinh</span>
              <span>{customer.dob || '—'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Ngày tạo</span>
              <span>{customer.createdAt}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Tổng chi tiêu</span>
              <span className="font-medium text-primary tabular-nums">{formatVND(totalSpending)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Số đơn hàng</span>
              <span className="font-medium">{customer.orders.length}</span>
            </div>
            {customer.address && (
              <div className="flex flex-col gap-0.5 col-span-2 md:col-span-4">
                <span className="text-xs text-muted-foreground">Địa chỉ</span>
                <span className="text-muted-foreground">{customer.address}</span>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Purchase history */}
        <TabsContent value="history">
          {customer.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Chưa có đơn hàng nào
            </p>
          ) : (
            <div className="space-y-2">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs">Mã đơn</TableHead>
                      <TableHead className="text-xs">Ngày mua</TableHead>
                      <TableHead className="text-xs">Chi nhánh</TableHead>
                      <TableHead className="text-xs">Sản phẩm</TableHead>
                      <TableHead className="text-xs">Thanh toán</TableHead>
                      <TableHead className="text-xs">Trạng thái</TableHead>
                      <TableHead className="text-xs text-right">Tổng tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders.map((order) => (
                      <TableRow key={order.id} className="text-sm">
                        <TableCell className="font-mono text-xs">{order.id}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{order.createdAt}</TableCell>
                        <TableCell className="text-xs">{order.branchName}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-col gap-0.5">
                            {order.items.map((item, i) => (
                              <span key={i} className="text-muted-foreground">
                                {item.productName}{' '}
                                <span className="text-foreground font-medium">×{item.quantity}</span>
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{PAYMENT_LABEL[order.paymentMethod]}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn('text-xs', ORDER_STATUS_MAP[order.status].className)}
                          >
                            {ORDER_STATUS_MAP[order.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums text-xs">
                          {formatVND(order.grandTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end text-sm font-medium pt-1 pr-1">
                Tổng chi tiêu (hoàn thành):&nbsp;
                <span className="text-primary tabular-nums">{formatVND(totalSpending)}</span>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

    </div>
  )
}

export function CustomersTable() {
  const { customers } = useCustomers()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) => {
        if (dateFrom && c.createdAt < dateFrom) return false
        if (dateTo && c.createdAt > dateTo) return false
        return true
      }),
    [customers, dateFrom, dateTo],
  )

  const table = useReactTable({
    data: filteredCustomers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      expanded,
    },
  })

  const genderFilter = table.getColumn('gender')?.getFilterValue() as string

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm tên, SĐT, mã KH..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(String(e.target.value))}
              className="pl-9 h-9"
            />
          </div>

          <Select
            value={genderFilter || ''}
            onValueChange={(value) =>
              table.getColumn('gender')?.setFilterValue(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-32 h-9 text-sm">
              <SelectValue placeholder="Giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="MALE">Nam</SelectItem>
              <SelectItem value="FEMALE">Nữ</SelectItem>
              <SelectItem value="OTHER">Khác</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5">
            <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 w-36 text-sm cursor-pointer"
              title="Từ ngày"
            />
            <span className="text-muted-foreground text-sm">—</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 w-36 text-sm cursor-pointer"
              title="Đến ngày"
            />
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 cursor-pointer text-xs"
                onClick={() => { setDateFrom(''); setDateTo('') }}
              >
                Xóa
              </Button>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="cursor-pointer h-9">
              <Funnel />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {COLUMN_LABELS[col.id] ?? col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    onClick={() => row.toggleExpanded()}
                    className={cn(
                      'cursor-pointer',
                      row.getIsExpanded() &&
                        'bg-primary/15 shadow-[inset_0_1px_0_hsl(var(--primary)/0.7),inset_1px_0_0_hsl(var(--primary)/0.7),inset_-1px_0_0_hsl(var(--primary)/0.7)]',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={
                          cell.column.id === 'select'
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    className={cn(
                      'hover:bg-transparent transition-colors duration-300 border-transparent',
                      row.getIsExpanded() &&
                        'shadow-[inset_0_-1px_0_hsl(var(--primary)/0.7),inset_1px_0_0_hsl(var(--primary)/0.7),inset_-1px_0_0_hsl(var(--primary)/0.7)]',
                    )}
                  >
                    <TableCell colSpan={row.getVisibleCells().length} className="p-0">
                      <div
                        className={cn(
                          'grid transition-[grid-template-rows] duration-300 ease-in-out',
                          row.getIsExpanded() ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                        )}
                      >
                        <div className="overflow-hidden">
                          <CustomerExpandedPanel
                            customer={row.original}
                            isExpanded={row.getIsExpanded()}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <CustomersEmpty />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Hiển thị</Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20 cursor-pointer">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden sm:block text-sm text-muted-foreground">
          Đã chọn {table.getFilteredSelectedRowModel().rows.length} /{' '}
          {table.getFilteredRowModel().rows.length} khách hàng
        </div>
        <div className="flex items-center space-x-2">
          <span className="hidden sm:block text-sm font-medium">
            Trang{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="cursor-pointer"
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="cursor-pointer"
          >
            Tiếp
          </Button>
        </div>
      </div>
    </div>
  )
}
