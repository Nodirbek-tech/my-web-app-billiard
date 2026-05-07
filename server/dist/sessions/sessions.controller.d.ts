import { SessionsService } from './sessions.service';
import { StopAndPayDto } from './dto/stop-and-pay.dto';
export declare class SessionsController {
    private sessions;
    constructor(sessions: SessionsService);
    start(tableId: number): Promise<{
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
        rounds: {
            id: number;
            createdAt: Date;
            roundNum: number;
            sessionId: number;
            startTime: Date;
            endTime: Date | null;
            minutes: number | null;
            cost: number | null;
        }[];
        orders: ({
            product: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                price: number;
                categoryId: number;
                stock: number | null;
                active: boolean;
            };
        } & {
            id: number;
            createdAt: Date;
            sessionId: number;
            productId: number;
            quantity: number;
            unitPrice: number;
            total: number;
        })[];
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
    }>;
    nextRound(id: number): Promise<{
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
        rounds: {
            id: number;
            createdAt: Date;
            roundNum: number;
            sessionId: number;
            startTime: Date;
            endTime: Date | null;
            minutes: number | null;
            cost: number | null;
        }[];
        orders: ({
            product: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                price: number;
                categoryId: number;
                stock: number | null;
                active: boolean;
            };
        } & {
            id: number;
            createdAt: Date;
            sessionId: number;
            productId: number;
            quantity: number;
            unitPrice: number;
            total: number;
        })[];
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
    }>;
    stopAndPay(id: number, dto: StopAndPayDto, user: any): Promise<{
        receiptNumber: string;
        paymentId: any;
        sessionId: number;
        tableNumber: number;
        tableName: string;
        startTime: string;
        endTime: string;
        totalMinutes: number;
        cashierName: string;
        rounds: {
            roundNum: number;
            startTime: string;
            endTime: string;
            minutes: number;
            cost: number;
        }[];
        orders: {
            name: string;
            quantity: number;
            unitPrice: number;
            total: number;
        }[];
        playCost: number;
        orderCost: number;
        serviceFee: number;
        discount: number;
        totalCost: number;
        method: "CASH" | "CARD" | "MIXED";
        cashAmount: number;
        cardAmount: number;
        change: number;
        notes: string;
        paidAt: any;
    }>;
    getOne(id: number): Promise<{
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
        rounds: {
            id: number;
            createdAt: Date;
            roundNum: number;
            sessionId: number;
            startTime: Date;
            endTime: Date | null;
            minutes: number | null;
            cost: number | null;
        }[];
        orders: ({
            product: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                price: number;
                categoryId: number;
                stock: number | null;
                active: boolean;
            };
        } & {
            id: number;
            createdAt: Date;
            sessionId: number;
            productId: number;
            quantity: number;
            unitPrice: number;
            total: number;
        })[];
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
    }>;
    getActive(tableId: number): Promise<{
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
        rounds: {
            id: number;
            createdAt: Date;
            roundNum: number;
            sessionId: number;
            startTime: Date;
            endTime: Date | null;
            minutes: number | null;
            cost: number | null;
        }[];
        orders: ({
            product: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                price: number;
                categoryId: number;
                stock: number | null;
                active: boolean;
            };
        } & {
            id: number;
            createdAt: Date;
            sessionId: number;
            productId: number;
            quantity: number;
            unitPrice: number;
            total: number;
        })[];
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
    }>;
}
