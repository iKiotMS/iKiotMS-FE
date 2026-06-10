'use client'

import { Package, TrendingUp, AlertTriangle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductsProvider, useProducts } from './components/products-provider'
import { ProductsButtonGroup } from './components/products-button-group'
import { ProductsTable } from './components/products-table'
import { ProductsDialogs } from './components/products-dialogs'

function StatCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  className?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`size-4 ${className ?? 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function ProductsStats() {
  const { products } = useProducts()
  const total = products.length
  const active = products.filter((p) => p.status === 'ACTIVE').length
  const outOfStock = products.filter((p) => p.stock === 0).length
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Tổng hàng hóa" value={total} icon={Package} />
      <StatCard title="Đang kinh doanh" value={active} icon={TrendingUp} className="text-green-500" />
      <StatCard title="Sắp hết hàng" value={lowStock} icon={AlertTriangle} className="text-orange-500" />
      <StatCard title="Hết hàng" value={outOfStock} icon={XCircle} className="text-red-500" />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <ProductsProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hàng hóa</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý danh sách hàng hóa, giá bán và tồn kho
            </p>
          </div>
          <ProductsButtonGroup />
        </div>

        <ProductsStats />
        <ProductsTable />
      </div>

      <ProductsDialogs />
    </ProductsProvider>
  )
}
