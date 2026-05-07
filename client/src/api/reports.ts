import api from '../lib/api';
import type { TodayStats, PaginatedSessions } from '../types';

export const reportsApi = {
  getToday: async (): Promise<TodayStats> => {
    const { data } = await api.get('/reports/today');
    return data;
  },
  getSessions: async (page = 1, limit = 20): Promise<PaginatedSessions> => {
    const { data } = await api.get('/reports/sessions', { params: { page, limit } });
    return data;
  },
};
