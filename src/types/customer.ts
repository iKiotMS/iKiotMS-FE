// [Domain – Types]
export type CustomerGender = 'MALE' | 'FEMALE' | 'OTHER'
export type CustomerOrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED'
export type CustomerOrderPaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY'

export interface CustomerOrderItem {
  productName: string
  quantity: number
  unitPrice: number
}

export interface CustomerOrder {
  id: string
  branchName: string
  status: CustomerOrderStatus
  staffName: string
  paymentMethod: CustomerOrderPaymentMethod
  grandTotal: number
  items: CustomerOrderItem[]
  createdAt: string
}

export interface Customer {
  id: string
  customerCode: string
  name: string
  phone: string
  gender: CustomerGender
  address: string
  dob: string
  createdAt: string
  orders: CustomerOrder[]
}

export interface CustomerQueryParams {
  keyword?: string
  gender?: CustomerGender
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  search?: string
}

export interface CustomerListResponse {
  data: Customer[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CustomerCreatePayload {
  customerCode?: string
  name: string
  phone?: string
  gender: CustomerGender
  address?: string
  dob?: string
}

export type CustomerUpdatePayload = Partial<CustomerCreatePayload>
