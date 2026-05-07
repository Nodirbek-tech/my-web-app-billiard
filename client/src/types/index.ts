export type Role = 'ADMIN' | 'STAFF';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED';
export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'MIXED';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface Table {
  id: number;
  name: string;
  number: number;
  hourlyPrice: number;
  nightPrice?: number | null;
  status: TableStatus;
  createdAt: string;
  activeSession?: Session | null;
}

export interface Session {
  id: number;
  tableId: number;
  table: Table;
  startTime: string;
  endTime?: string | null;
  totalMinutes?: number | null;
  playCost?: number | null;
  status: SessionStatus;
  rounds: SessionRound[];
  orders: SessionOrder[];
  payment?: Payment | null;
}

export interface SessionRound {
  id: number;
  sessionId: number;
  roundNum: number;
  startTime: string;
  endTime?: string | null;
  minutes?: number | null;
  cost?: number | null;
}

export interface Category {
  id: number;
  name: string;
  active: boolean;
  products?: Product[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  category: Category;
  stock?: number | null;
  active: boolean;
}

export interface SessionOrder {
  id: number;
  sessionId: number;
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
}

export interface Payment {
  id: number;
  sessionId: number;
  playCost: number;
  orderCost: number;
  discount: number;
  totalCost: number;
  method: PaymentMethod;
  paidAt: string;
}

export interface ReceiptData {
  receiptNumber: string;
  paymentId: number;
  sessionId: number;
  tableNumber: number;
  tableName: string;
  startTime: string;
  endTime: string;
  totalMinutes: number;
  cashierName: string;
  rounds: { roundNum: number; startTime: string; endTime: string; minutes: number; cost: number }[];
  orders: { name: string; quantity: number; unitPrice: number; total: number }[];
  playCost: number;
  orderCost: number;
  serviceFee: number;
  discount: number;
  totalCost: number;
  method: PaymentMethod;
  cashAmount: number | null;
  cardAmount: number | null;
  change: number | null;
  notes: string | null;
  paidAt: string;
}

export interface TodayStats {
  totalRevenue: number;
  sessionCount: number;
  activeTables: number;
  paymentBreakdown: { cash: number; card: number };
  topProducts: { name: string; count: number; revenue: number }[];
}

export interface PaginatedSessions {
  data: Session[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
