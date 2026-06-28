// [Domain – Types]
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';
export type OrderPaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY' | 'SEPAY';

export interface OrderItemPayload {
  productItemId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
}

export interface OrderCreatePayload {
  customerId: string;
  branchId: string;
  paymentMethod: OrderPaymentMethod;
  items: OrderItemPayload[];
  grandTotal: number;
  customerPay?: number;
  note?: string;
}

export interface OrderItem {
  productItemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  _id: string;
}

export interface Order {
  id: string;
  tenantId: string;
  branchId: string;
  customerId: string;
  status: OrderStatus;
  userId: string;
  paymentMethod: OrderPaymentMethod;
  paymentReference?: string;
  sepayTransactionId?: number;
  grandTotal: number;
  customerPay?: number;
  change?: number;
  note?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderCreateResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
    qrUrl?: string;
  };
}
