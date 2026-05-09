import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class TelegramService implements OnModuleInit {
    private prisma;
    private readonly logger;
    private bot;
    private sessions;
    constructor(prisma: PrismaService);
    onModuleInit(): void;
    notifyPayment(customerId: number, data: {
        tableName: string;
        totalMinutes: number;
        totalCost: number;
        bonusEarned: number;
        bonusBalance: number;
    }): Promise<void>;
    sendPromotionBroadcast(promotionId: number, title: string, msg: string): Promise<number>;
    notifyReservationStatus(telegramId: string, data: {
        date: Date;
        peopleCount: number;
    }, status: 'CONFIRMED' | 'CANCELLED'): Promise<void>;
    private getSession;
    private setSession;
    private clearSession;
    private mainMenu;
    private phoneKb;
    private cancelKb;
    private findCustomerByTgId;
    private requireCustomer;
    private setupHandlers;
    private handleHistory;
    private handlePromotions;
}
