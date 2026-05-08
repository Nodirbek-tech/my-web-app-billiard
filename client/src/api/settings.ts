import api from '../lib/api';
import type { BusinessSettings } from '../types';

export interface UpdateSettingsPayload {
  cashbackPercent?: number;
  dayHourlyPrice?: number;
  nightHourlyPrice?: number;
  dayStartTime?: string;
  nightStartTime?: string;
}

export const settingsApi = {
  get: async (): Promise<BusinessSettings> => {
    const { data } = await api.get('/settings');
    return data;
  },
  update: async (payload: UpdateSettingsPayload): Promise<BusinessSettings> => {
    const { data } = await api.patch('/settings', payload);
    return data;
  },
};
