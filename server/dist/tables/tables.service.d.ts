import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
export declare class TablesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        activeSession: {
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
