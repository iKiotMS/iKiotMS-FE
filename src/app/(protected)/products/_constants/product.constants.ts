// [Constants – Product]
import type { ProductStatus } from '@/types/product'

export const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export const formatPriceAmount = (value?: string | number | null): string => {
  if (value === undefined || value === null || value === '') return ''
  const digits = String(value).replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('vi-VN')
}

export const parsePriceAmount = (value?: string): number => {
  if (!value?.trim()) return 0
  const digits = value.replace(/\D/g, '')
  return digits ? (Number(digits) || 0) : 0
}

export const STATUS_MAP: Record<ProductStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Đang kinh doanh',
    className: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  },
  INACTIVE: {
    label: 'Ngừng kinh doanh',
    className: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
  },
  DISCONTINUED: {
    label: 'Ngừng sản xuất',
    className: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  },
}

export const COLUMN_LABELS: Record<string, string> = {
  image: '',
  productCode: 'Mã hàng',
  name: 'Tên hàng hóa',
  brandId: 'Thương hiệu',
  categoryId: 'Danh mục',
  costPrice: 'Giá vốn',
  retailPrice: 'Giá bán',
  stock: 'Tồn kho',
  status: 'Trạng thái',
}
