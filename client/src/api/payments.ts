import api from '../lib/api';
import type { Payment, ReceiptData } from '../types';

export const paymentsApi = {
  create: async (sessionId: number, method: 'CASH' | 'CARD', discount = 0): Promise<Payment> => {
    const { data } = await api.post('/payments', { sessionId, method, discount });
    return data;
  },
  getReceipt: async (sessionId: number): Promise<ReceiptData> => {
    const { data } = await api.get(`/payments/receipt/${sessionId}`);
    return data;
  },
};
