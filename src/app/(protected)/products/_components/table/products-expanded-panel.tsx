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

  const thumbnail = product.images?.find((i) => i.isThumbnail) ?? product.images?.[0]

  if (loading) {
    return (
      <div className="bg-background border-b px-6 py-4 space-y-4">
        <div className="flex gap-6">
          <Skeleton className="size-20 rounded-lg shrink-0" />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
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
          src={thumbnail?.url || 'https://placehold.co/80x80/e2e8f0/94a3b8?text=IMG'}
          alt={product.name}
          className="size-20 rounded-lg object-cover border shrink-0"
        />
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Tên hàng hóa</span>
            <span className="font-medium">{product.name}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Danh mục</span>
            <span>{product.categoryName || '—'}</span>
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
          {product.createdAt && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Ngày tạo</span>
              <span>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
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
