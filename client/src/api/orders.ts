import api from '../lib/api';
import type { SessionOrder } from '../types';

export const ordersApi = {
  add: async (sessionId: number, productId: number, quantity: number): Promise<SessionOrder> => {
    const { data } = await api.post('/orders', { sessionId, productId, quantity });
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
  getBySession: async (sessionId: number): Promise<SessionOrder[]> => {
    const { data } = await api.get(`/orders/session/${sessionId}`);
    return data;
  },
};
