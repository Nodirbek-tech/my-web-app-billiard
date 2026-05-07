import api from '../lib/api';
import type { Table } from '../types';

export const tablesApi = {
  getAll: async (): Promise<Table[]> => {
    const { data } = await api.get('/tables');
    return data;
  },
  getOne: async (id: number): Promise<Table> => {
    const { data } = await api.get(`/tables/${id}`);
    return data;
  },
  create: async (dto: { name: string; number: number; hourlyPrice: number; nightPrice?: number }): Promise<Table> => {
    const { data } = await api.post('/tables', dto);
    return data;
  },
  update: async (id: number, dto: Partial<{ name: string; hourlyPrice: number; nightPrice: number }>): Promise<Table> => {
    const { data } = await api.patch(`/tables/${id}`, dto);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
};
