import { PrismaService } from '../prisma/prisma.service';
import { WsService } from '../websocket/ws.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private prisma;
    private ws;
    constructor(prisma: PrismaService, ws: WsService);
    addOrder(dto: CreateOrderDto): Promise<{
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
    }>;
    removeOrder(id: number): Promise<{
        success: boolean;
    }>;
    getSessionOrders(sessionId: number): Promise<({
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
    })[]>;
}
