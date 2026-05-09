import api from '../lib/api';
import type { Promotion } from '../types';

export interface CreatePromotionPayload {
  title: string;
  message: string;
  active?: boolean;
}

export const promotionsApi = {
  getAll: async (): Promise<Promotion[]> => {
    const { data } = await api.get('/promotions');
    return data;
  },
  create: async (payload: CreatePromotionPayload): Promise<Promotion> => {
    const { data } = await api.post('/promotions', payload);
    return data;
  },
  toggle: async (id: number, active: boolean): Promise<Promotion> => {
    const { data } = await api.patch(`/promotions/${id}`, { active });
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/promotions/${id}`);
  },
  broadcast: async (id: number): Promise<{ sent: number }> => {
    const { data } = await api.post(`/promotions/${id}/broadcast`);
    return data;
  },
};
