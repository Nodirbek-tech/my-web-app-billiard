import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
export declare class TablesService {
    private prisma;
    constructor(prisma: PrismaService);
    private activeSessionInclude;
    findAll(): Promise<{
        activeSession: {
            customer: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                phone: string;
                cardNumber: string;
                bonusBalance: number;
                telegramId: string | null;
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
            customer: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                phone: string;
                cardNumber: string;
                bonusBalance: number;
                telegramId: string | null;
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
