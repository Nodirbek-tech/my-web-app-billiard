import api from '../lib/api';
import type { Customer } from '../types';

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  bonusBalance?: number;
}

export interface UpdateCustomerPayload {
  name?: string;
  phone?: string;
}

export const customersApi = {
  findAll: async (search?: string): Promise<Customer[]> => {
    const { data } = await api.get('/customers', { params: search ? { search } : {} });
    return data;
  },
  findOne: async (id: number): Promise<Customer & { visits: any[] }> => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },
  create: async (payload: CreateCustomerPayload): Promise<Customer> => {
    const { data } = await api.post('/customers', payload);
    return data;
  },
  update: async (id: number, payload: UpdateCustomerPayload): Promise<Customer> => {
    const { data } = await api.patch(`/customers/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
