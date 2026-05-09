import { SessionsService } from './sessions.service';
import { StopAndPayDto } from './dto/stop-and-pay.dto';
declare class AttachCustomerDto {
    customerId?: number | null;
}
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
        rounds: {
            id: number;
            createdAt: Date;
            startTime: Date;
            endTime: Date | null;
            sessionId: number;
            roundNum: number;
            minutes: number | null;
            cost: number | null;
        }[];
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
        rounds: {
            id: number;
            createdAt: Date;
            startTime: Date;
            endTime: Date | null;
            sessionId: number;
            roundNum: number;
            minutes: number | null;
            cost: number | null;
        }[];
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
    }>;
    stopAndPay(id: number, dto: StopAndPayDto, user: any): Promise<{
        receiptNumber: string;
        paymentId: number;
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
        bonusRedeemed: number;
        bonusEarned: number;
        totalCost: number;
        method: "CASH" | "CARD" | "MIXED";
        cashAmount: number;
        cardAmount: number;
        change: number;
        notes: string;
        paidAt: string;
        customerName: string;
        customerCard: string;
        bonusBalance: number;
    }>;
    attachCustomer(id: number, dto: AttachCustomerDto): Promise<{
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
        customer: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            cardNumber: string;
            telegramId: string | null;
            qrCodeValue: string | null;
            bonusBalance: number;
            telegramUsername: string | null;
        };
        rounds: {
            id: number;
            createdAt: Date;
            startTime: Date;
            endTime: Date | null;
            sessionId: number;
            roundNum: number;
            minutes: number | null;
            cost: number | null;
        }[];
        orders: ({
            product: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                active: boolean;
                price: number;
                categoryId: number;
                stock: number | null;
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
        tableId: number;
        customerId: number | null;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        playCost: number | null;
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
        customer: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            cardNumber: string;
            telegramId: string | null;
            qrCodeValue: string | null;
            bonusBalance: number;
            telegramUsername: string | null;
        };
        rounds: {
            id: number;
            createdAt: Date;
            startTime: Date;
            endTime: Date | null;
            sessionId: number;
            roundNum: number;
            minutes: number | null;
            cost: number | null;
        }[];
        orders: ({
            product: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                active: boolean;
                price: number;
                categoryId: number;
                stock: number | null;
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
        tableId: number;
        customerId: number | null;
        startTime: Date;
        endTime: Date | null;
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
        customer: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            cardNumber: string;
            telegramId: string | null;
            qrCodeValue: string | null;
            bonusBalance: number;
            telegramUsername: string | null;
        };
        rounds: {
            id: number;
            createdAt: Date;
            startTime: Date;
            endTime: Date | null;
            sessionId: number;
            roundNum: number;
            minutes: number | null;
            cost: number | null;
        }[];
        orders: ({
            product: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                active: boolean;
                price: number;
                categoryId: number;
                stock: number | null;
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
        tableId: number;
        customerId: number | null;
        startTime: Date;
        endTime: Date | null;
        totalMinutes: number | null;
        playCost: number | null;
    }>;
}
export {};
