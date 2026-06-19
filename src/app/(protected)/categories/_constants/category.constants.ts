// [Constants – Category]
import type { CategoryStatus } from '@/types/category'

export const STATUS_MAP: Record<CategoryStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Đang sử dụng',
    className: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  },
  INACTIVE: {
    label: 'Ngừng sử dụng',
    className: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
  },
}

export const COLUMN_LABELS: Record<string, string> = {
  categoryCode: 'Mã danh mục',
  name: 'Tên danh mục',
  description: 'Mô tả',
  productCount: 'Số hàng hóa',
  status: 'Trạng thái',
}
