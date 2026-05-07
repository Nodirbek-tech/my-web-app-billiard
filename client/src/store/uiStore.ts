import { create } from 'zustand';
import type { ReceiptData } from '../types';

interface UiState {
  selectedTableId: number | null;
  setSelectedTable: (id: number | null) => void;
  receiptData: ReceiptData | null;
  setReceiptData: (data: ReceiptData | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedTableId: null,
  setSelectedTable: (id) => set({ selectedTableId: id }),
  receiptData: null,
  setReceiptData: (data) => set({ receiptData: data }),
}));
