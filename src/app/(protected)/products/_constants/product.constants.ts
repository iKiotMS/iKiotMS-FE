import type { ProductStatus } from '../_types/product.types'

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

export const CATEGORIES = [
  'Đồ uống',
  'Thực phẩm',
  'Văn phòng phẩm',
  'Phụ kiện điện tử',
  'Y tế & Vệ sinh',
  'Chăm sóc cá nhân',
  'Gia dụng',
  'Khác',
]

export const COLUMN_LABELS: Record<string, string> = {
  image: '',
  productCode: 'Mã hàng',
  name: 'Tên hàng hóa',
  categoryName: 'Danh mục',
  costPrice: 'Giá vốn',
  retailPrice: 'Giá bán',
  stock: 'Tồn kho',
  status: 'Trạng thái',
}
