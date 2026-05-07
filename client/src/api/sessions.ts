import api from '../lib/api';
import type { Session, ReceiptData } from '../types';

export interface StopAndPayPayload {
  method: 'CASH' | 'CARD' | 'MIXED';
  discount?: number;
  serviceFee?: number;
  cashAmount?: number;
  cardAmount?: number;
  notes?: string;
  cashierName?: string;
}

export const sessionsApi = {
  start: async (tableId: number): Promise<Session> => {
    const { data } = await api.post(`/sessions/start/${tableId}`);
    return data;
  },
  nextRound: async (sessionId: number): Promise<Session> => {
    const { data } = await api.post(`/sessions/${sessionId}/next-round`);
    return data;
  },
  // Atomic: stops session AND processes payment in one call
  stopAndPay: async (sessionId: number, payload: StopAndPayPayload): Promise<ReceiptData> => {
    const { data } = await api.post(`/sessions/${sessionId}/stop-and-pay`, payload);
    return data;
  },
  getOne: async (id: number): Promise<Session> => {
    const { data } = await api.get(`/sessions/${id}`);
    return data;
  },
  getActiveByTable: async (tableId: number): Promise<Session | null> => {
    const { data } = await api.get(`/sessions/table/${tableId}/active`);
    return data;
  },
};
