import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCustomerDto): Promise<{
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
    }>;
    findAll(search?: string): Promise<({
        _count: {
            visits: number;
        };
    } & {
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
    })[]>;
    findOne(id: number): Promise<{
        _count: {
            visits: number;
        };
        visits: ({
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
            customerId: number;
            playCost: number;
            sessionId: number;
            orderCost: number;
            totalCost: number;
            bonusEarned: number;
            bonusRedeemed: number;
        })[];
    } & {
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
    }>;
    findByPhone(phone: string): Promise<{
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
    }[]>;
    update(id: number, dto: UpdateCustomerDto): Promise<{
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
    }>;
    remove(id: number): Promise<{
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
    }>;
}
