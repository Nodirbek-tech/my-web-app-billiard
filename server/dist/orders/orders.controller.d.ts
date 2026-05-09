import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private orders;
    constructor(orders: OrdersService);
    add(dto: CreateOrderDto): Promise<{
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
    remove(id: number): Promise<{
        success: boolean;
    }>;
    getBySession(sessionId: number): Promise<({
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
