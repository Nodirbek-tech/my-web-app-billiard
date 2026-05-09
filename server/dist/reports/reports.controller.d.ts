import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reports;
    constructor(reports: ReportsService);
    today(): Promise<{
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
    sessions(page?: string, limit?: string): Promise<{
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
                customerId: number | null;
                playCost: number;
                sessionId: number;
                method: import(".prisma/client").$Enums.PaymentMethod;
                orderCost: number;
                totalCost: number;
                bonusEarned: number;
                bonusRedeemed: number;
                discount: number;
                serviceFee: number;
                cashAmount: number | null;
                cardAmount: number | null;
                notes: string | null;
                cashierName: string | null;
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
            tableId: number;
            customerId: number | null;
            startTime: Date;
            endTime: Date | null;
            totalMinutes: number | null;
            playCost: number | null;
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
}
