// [Constants – Supplier]
import type { SupplierStatus, TransactionType } from '@/types/supplier'

export const STATUS_MAP: Record<SupplierStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Đang hợp tác',
    className: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  },
  INACTIVE: {
    label: 'Ngừng hợp tác',
    className: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
  },
}

export const TRANSACTION_TYPE_MAP: Record<TransactionType, { label: string; className: string }> = {
  PURCHASE: {
    label: 'Nhập hàng',
    className: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
  },
  PAYMENT: {
    label: 'Thanh toán',
    className: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  },
  RETURN: {
    label: 'Trả hàng',
    className: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
  },
}

export const COLUMN_LABELS: Record<string, string> = {
  supplierCode: 'Mã nhà cung cấp',
  supplierName: 'Tên nhà cung cấp',
  contactName: 'Người liên hệ',
  phoneNumber: 'Số điện thoại',
  email: 'Email',
  creditLimit: 'Hạn mức tín dụng',
  outstandingDebt: 'Công nợ',
  status: 'Trạng thái',
}
