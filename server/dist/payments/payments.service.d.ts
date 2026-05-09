import { PrismaService } from '../prisma/prisma.service';
import { WsService } from '../websocket/ws.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private prisma;
    private ws;
    constructor(prisma: PrismaService, ws: WsService);
    createPayment(dto: CreatePaymentDto): Promise<{
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
        };
    } & {
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
    }>;
    getPaymentBySession(sessionId: number): Promise<{
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
        };
    } & {
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
    }>;
    getReceiptData(sessionId: number): Promise<{
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
