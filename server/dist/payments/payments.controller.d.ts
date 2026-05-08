import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private payments;
    constructor(payments: PaymentsService);
    create(dto: CreatePaymentDto): Promise<{
        session: {
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
            tableId: number;
            customerId: number | null;
            startTime: Date;
            endTime: Date | null;
            totalMinutes: number | null;
            playCost: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        customerId: number | null;
        playCost: number;
        sessionId: number;
        discount: number;
        serviceFee: number;
        method: import(".prisma/client").$Enums.PaymentMethod;
        cashAmount: number | null;
        cardAmount: number | null;
        notes: string | null;
        cashierName: string | null;
        bonusRedeemed: number;
        orderCost: number;
        bonusEarned: number;
        totalCost: number;
        paidAt: Date;
    }>;
    getBySession(sessionId: number): Promise<{
        session: {
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
            tableId: number;
            customerId: number | null;
            startTime: Date;
            endTime: Date | null;
            totalMinutes: number | null;
            playCost: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        customerId: number | null;
        playCost: number;
        sessionId: number;
        discount: number;
        serviceFee: number;
        method: import(".prisma/client").$Enums.PaymentMethod;
        cashAmount: number | null;
        cardAmount: number | null;
        notes: string | null;
        cashierName: string | null;
        bonusRedeemed: number;
        orderCost: number;
        bonusEarned: number;
        totalCost: number;
        paidAt: Date;
    }>;
    getReceipt(sessionId: number): Promise<{
        receiptNumber: string;
        tableNumber: number;
        tableName: string;
        startTime: Date;
        endTime: Date;
        totalMinutes: number;
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
        orders: {
            name: string;
            quantity: number;
            unitPrice: number;
            total: number;
        }[];
        playCost: number;
        orderCost: number;
        discount: number;
        totalCost: number;
        method: import(".prisma/client").$Enums.PaymentMethod;
        paidAt: Date;
    }>;
}
