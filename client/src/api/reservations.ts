import api from '../lib/api';
import type { Reservation, ReservationStatus } from '../types';

export interface CreateReservationPayload {
  name: string;
  phone: string;
  date: string;
  peopleCount: number;
  note?: string;
  customerId?: number;
}

export const reservationsApi = {
  getAll: async (status?: ReservationStatus): Promise<Reservation[]> => {
    const { data } = await api.get('/reservations', { params: status ? { status } : undefined });
    return data;
  },
  getOne: async (id: number): Promise<Reservation> => {
    const { data } = await api.get(`/reservations/${id}`);
    return data;
  },
  create: async (payload: CreateReservationPayload): Promise<Reservation> => {
    const { data } = await api.post('/reservations', payload);
    return data;
  },
  updateStatus: async (id: number, status: ReservationStatus): Promise<Reservation> => {
    const { data } = await api.patch(`/reservations/${id}/status`, { status });
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },
};
