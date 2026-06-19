'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useProducts } from '../../_context/products-provider'
import { STATUS_MAP } from '../../_constants/product.constants'
import type { Product } from '@/types/product'

const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

type ProductsExpandedPanelProps = {
  product: Product
  isExpanded: boolean
}

export function ProductsExpandedPanel({ product, isExpanded }: ProductsExpandedPanelProps) {
  const { setOpen, setCurrentRow } = useProducts()
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

  const profit = product.retailPrice - product.costPrice
  const profitPositive = profit >= 0

  if (loading) {
    return (
      <div className="bg-background border-b px-6 py-4 space-y-4">
        <div className="flex gap-6">
          <Skeleton className="size-20 rounded-lg shrink-0" />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
      <div className="flex gap-6">
        <img
          src={product.imageUrl || 'https://placehold.co/80x80/e2e8f0/94a3b8?text=IMG'}
          alt={product.name}
          className="size-20 rounded-lg object-cover border shrink-0"
        />
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Mã hàng</span>
            <span className="font-mono font-medium">{product.productCode}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">SKU</span>
            <span className="font-mono">{product.sku}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Mã vạch</span>
            <span className="font-mono">{product.barcode || '—'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Trạng thái</span>
            <Badge
              variant="secondary"
              className={cn('w-fit text-xs', STATUS_MAP[product.status].className)}
            >
              {STATUS_MAP[product.status].label}
            </Badge>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Giá vốn</span>
            <span className="tabular-nums">{formatVND(product.costPrice)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Giá bán</span>
            <span className="tabular-nums font-medium text-primary">
              {formatVND(product.retailPrice)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Lợi nhuận</span>
            <span
              className={cn(
                'tabular-nums font-medium',
                profitPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {formatVND(profit)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">VAT</span>
            <span>{product.VAT}%</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Tồn kho</span>
            <span
              className={cn(
                'font-medium',
                product.stock === 0
                  ? 'text-red-600 dark:text-red-400'
                  : product.stock < 10
                    ? 'text-orange-500 dark:text-orange-400'
                    : '',
              )}
            >
              {product.stock.toLocaleString('vi-VN')}
            </span>
          </div>
          {product.warrantyPeriod && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Bảo hành</span>
              <span>{product.warrantyPeriod}</span>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Ngày tạo</span>
            <span>{product.createdAt}</span>
          </div>
          {product.description && (
            <div className="flex flex-col gap-0.5 col-span-2 md:col-span-4">
              <span className="text-xs text-muted-foreground">Mô tả</span>
              <span className="text-muted-foreground">{product.description}</span>
            </div>
          )}
        </div>
      </div>
      <Separator className="mt-4" />
      <div className="flex items-center justify-between mt-3">
        <Button
          variant="destructive"
          size="sm"
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            setCurrentRow(product)
            setOpen('delete')
          }}
        >
          <Trash2 className="mr-2 size-4" />
          Xóa
        </Button>
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            setCurrentRow(product)
            setOpen('edit')
          }}
        >
          <Pencil className="mr-2 size-4" />
          Chỉnh sửa
        </Button>
      </div>
    </div>
  )
}
