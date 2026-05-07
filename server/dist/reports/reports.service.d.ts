import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getTodayStats(): Promise<{
        totalRevenue: number;
        sessionCount: number;
        activeTables: number;
        paymentBreakdown: {
            cash: number;
            card: number;
        };
        topProducts: {
            name: string;
            count: number;
            revenue: number;
        }[];
    }>;
    getSessionHistory(page?: number, limit?: number): Promise<{
        data: ({
            table: {
                number: number;
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                hourlyPrice: number;
                nightPrice: number | null;
                status: import(".prisma/client").$Enums.TableStatus;
            };
            payment: {
                id: number;
                createdAt: Date;
                sessionId: number;
                playCost: number;
                discount: number;
                serviceFee: number;
                method: import(".prisma/client").$Enums.PaymentMethod;
                cashAmount: number | null;
                cardAmount: number | null;
                notes: string | null;
                cashierName: string | null;
                orderCost: number;
                totalCost: number;
                paidAt: Date;
            };
            _count: {
                orders: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SessionStatus;
            startTime: Date;
            endTime: Date | null;
            tableId: number;
            totalMinutes: number | null;
            playCost: number | null;
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
}
