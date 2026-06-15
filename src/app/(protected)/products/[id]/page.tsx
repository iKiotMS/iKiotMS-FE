'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  DollarSign,
  FileText,
  Package,
  Pencil,
  Tag,
  Warehouse,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/page-header'
import { ProductsButtonGroup } from '../components/products-button-group'
import { useProducts } from '../components/products-provider'
import { STATUS_MAP } from '../components/products-columns'

const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  )
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { products, setOpen, setCurrentRow } = useProducts()

  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Package className="size-12 text-muted-foreground" />
        <p className="text-muted-foreground">Không tìm thấy hàng hóa</p>
        <Button variant="outline" onClick={() => router.push('/products')}>
          <ArrowLeft className="mr-2 size-4" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  const { label: statusLabel, className: statusClassName } = STATUS_MAP[product.status]
  const profit = product.retailPrice - product.costPrice

  function handleEdit() {
    setCurrentRow(product ?? null)
    setOpen('edit')
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Hàng hóa', href: '/products' },
          { label: product.name },
        ]}
        onBack={() => router.back()}
        title={product.name}
        titleExtra={
          <Badge variant="secondary" className={statusClassName}>
            {statusLabel}
          </Badge>
        }
        description={[product.brandName, product.categoryName].filter(Boolean).join(' · ')}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={handleEdit}
            >
              <Pencil className="mr-2 size-4" />
              Chỉnh sửa
            </Button>
            <ProductsButtonGroup />
          </>
        }
      />

      {/* Detail cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Identification */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="size-4" />
              Thông tin định danh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="Mã hàng"
              value={<span className="font-mono font-medium">{product.productCode}</span>}
            />
            <Separator />
            <InfoRow
              label="SKU"
              value={<span className="font-mono text-sm">{product.sku}</span>}
            />
            <Separator />
            <InfoRow label="Mã vạch" value={product.barcode || '—'} />
            <Separator />
            <InfoRow
              label="Danh mục"
              value={
                <Badge variant="secondary" className="text-xs">
                  {product.categoryName}
                </Badge>
              }
            />
            <Separator />
            <InfoRow label="Thương hiệu" value={product.brandName || '—'} />
            <Separator />
            <InfoRow
              label="Ngày tạo"
              value={new Date(product.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            />
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="size-4" />
              Giá & Thuế
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="Giá vốn"
              value={
                <span className="font-medium tabular-nums">{formatVND(product.costPrice)}</span>
              }
            />
            <Separator />
            <InfoRow
              label="Giá bán"
              value={
                <span className="font-semibold tabular-nums text-primary">
                  {formatVND(product.retailPrice)}
                </span>
              }
            />
            <Separator />
            <InfoRow
              label="Lợi nhuận gộp"
              value={
                <span
                  className={`font-medium tabular-nums ${
                    profit >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatVND(profit)}
                </span>
              }
            />
            <Separator />
            <InfoRow label="VAT" value={`${product.VAT}%`} />
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Warehouse className="size-4" />
              Kho hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="Tồn kho hiện tại"
              value={
                <span
                  className={`font-semibold text-base tabular-nums ${
                    product.stock === 0
                      ? 'text-red-600 dark:text-red-400'
                      : product.stock < 10
                        ? 'text-orange-500 dark:text-orange-400'
                        : ''
                  }`}
                >
                  {product.stock.toLocaleString('vi-VN')} đơn vị
                </span>
              }
            />
            <Separator />
            <InfoRow
              label="Thời hạn bảo hành"
              value={product.warrantyPeriod || '—'}
            />
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="size-4" />
              Mô tả
            </CardTitle>
          </CardHeader>
          <CardContent>
            {product.description ? (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Chưa có mô tả</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
