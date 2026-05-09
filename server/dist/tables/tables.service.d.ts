import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
export declare class TablesService {
    private prisma;
    constructor(prisma: PrismaService);
    private leanSessionInclude;
    private fullSessionInclude;
    findAll(): Promise<{
        activeSession: {
            orders: any[];
            customer: any;
            payment: any;
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
        sessions: any;
        number: number;
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hourlyPrice: number;
        nightPrice: number | null;
        status: import(".prisma/client").$Enums.TableStatus;
    }[]>;
    findOne(id: number): Promise<{
        activeSession: {
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
        };
        sessions: any;
        number: number;
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hourlyPrice: number;
        nightPrice: number | null;
        status: import(".prisma/client").$Enums.TableStatus;
    }>;
    create(dto: CreateTableDto): Promise<{
        number: number;
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hourlyPrice: number;
        nightPrice: number | null;
        status: import(".prisma/client").$Enums.TableStatus;
    }>;
    update(id: number, dto: Partial<CreateTableDto>): Promise<{
        number: number;
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hourlyPrice: number;
        nightPrice: number | null;
        status: import(".prisma/client").$Enums.TableStatus;
    }>;
    remove(id: number): Promise<{
        number: number;
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hourlyPrice: number;
        nightPrice: number | null;
        status: import(".prisma/client").$Enums.TableStatus;
    }>;
}
