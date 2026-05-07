import api from '../lib/api';
import type { Category, Product } from '../types';

export const productsApi = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get('/products/categories');
    return data;
  },
  createCategory: async (name: string): Promise<Category> => {
    const { data } = await api.post('/products/categories', { name });
    return data;
  },
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get('/products');
    return data;
  },
  create: async (dto: { name: string; price: number; categoryId: number; stock?: number }): Promise<Product> => {
    const { data } = await api.post('/products', dto);
    return data;
  },
  update: async (id: number, dto: Partial<{ name: string; price: number; stock: number; active: boolean }>): Promise<Product> => {
    const { data } = await api.patch(`/products/${id}`, dto);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
