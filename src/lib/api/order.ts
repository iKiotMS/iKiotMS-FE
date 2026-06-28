// [API – Order]
import client from '@/lib/api/client';
import type { Order, OrderCreatePayload, OrderCreateResponse } from '@/types/order';

export const orderApi = {
  create: async (payload: OrderCreatePayload): Promise<OrderCreateResponse> => {
    const res = await client.post<OrderCreateResponse>('/orders', payload);
    return res.data;
  },
  getById: async (id: string): Promise<Order> => {
    const res = await client.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return res.data.data;
  },
};
