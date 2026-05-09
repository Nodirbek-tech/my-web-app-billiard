export type Role = 'ADMIN' | 'STAFF';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED';
export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'MIXED';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  cardNumber: string;
  qrCodeValue?: string | null;
  bonusBalance: number;
  telegramId?: string | null;
  createdAt: string;
  _count?: { visits: number };
}

export interface CustomerVisit {
  id: number;
  customerId: number;
  sessionId: number;
  playCost: number;
  orderCost: number;
  totalCost: number;
  bonusEarned: number;
  bonusRedeemed: number;
  createdAt: string;
  session?: {
    id: number;
    startTime: string;
    endTime?: string | null;
    table: { id: number; name: string; number: number };
  };
}

export interface BusinessSettings {
  id: number;
  cashbackPercent: number;
  dayHourlyPrice: number;
  nightHourlyPrice: number;
  dayStartTime: string;
  nightStartTime: string;
  address?: string;
  contactPhone?: string;
}

export interface Reservation {
  id: number;
  name: string;
  phone: string;
  date: string;
  peopleCount: number;
  note?: string | null;
  status: ReservationStatus;
  customerId?: number | null;
  customer?: Customer | null;
  createdAt: string;
}

export interface Promotion {
  id: number;
  title: string;
  message: string;
  active: boolean;
  createdAt: string;
  _count?: { sendLogs: number };
}

export interface PromotionSendLog {
  id: number;
  promotionId: number;
  customerId: number;
  sentAt: string;
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
  orders?: SessionOrder[];
  payment?: Payment | null;
  customerId?: number | null;
  customer?: Customer | null;
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
  bonusRedeemed?: number;
  bonusEarned?: number;
  customerId?: number | null;
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
  bonusRedeemed?: number;
  bonusEarned?: number;
  totalCost: number;
  method: PaymentMethod;
  cashAmount: number | null;
  cardAmount: number | null;
  change: number | null;
  notes: string | null;
  paidAt: string;
  customerName?: string | null;
  customerCard?: string | null;
  bonusBalance?: number | null;
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
