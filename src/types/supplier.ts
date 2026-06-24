// [Domain – Types]
export type SupplierStatus = 'ACTIVE' | 'INACTIVE'

export type TransactionType = 'PURCHASE' | 'PAYMENT' | 'RETURN'

export interface Supplier {
  id: string
  supplierCode: string
  supplierName: string
  contactName: string
  phoneNumber: string
  email: string
  address: string
  creditLimit: number
  outstandingDebt: number
  status: SupplierStatus
  createdAt: string
}

export interface SupplierTransaction {
  id: string
  supplierId: string
  type: TransactionType
  reference: string
  amount: number
  balance: number
  description: string
  date: string
}

export interface SupplierQueryParams {
  keyword?: string
  status?: SupplierStatus
  page?: number
  limit?: number
}

export interface SupplierListResponse {
  data: Supplier[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SupplierCreatePayload {
  supplierCode: string
  supplierName: string
  contactName?: string
  phoneNumber?: string
  email?: string
  address?: string
  creditLimit?: number
  status: SupplierStatus
}

export type SupplierUpdatePayload = Partial<SupplierCreatePayload>
