// [API – Order]
import client from '@/lib/api/client';
import type { OrderCreatePayload, OrderCreateResponse } from '@/types/order';

export const orderApi = {
  create: async (payload: OrderCreatePayload): Promise<OrderCreateResponse> => {
    const res = await client.post<OrderCreateResponse>('/orders', payload);
    return res.data;
  },
};
