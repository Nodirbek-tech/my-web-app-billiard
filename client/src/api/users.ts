import api from '../lib/api';
import type { AuthUser } from '../types';

export const usersApi = {
  getAll: async (): Promise<AuthUser[]> => {
    const { data } = await api.get('/users');
    return data;
  },
  create: async (dto: { email: string; password: string; name: string; role?: string }): Promise<AuthUser> => {
    const { data } = await api.post('/users', dto);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
