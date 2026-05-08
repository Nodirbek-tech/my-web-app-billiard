import { OnModuleInit } from '@nestjs/common';
export declare class TelegramService implements OnModuleInit {
    private readonly logger;
    private bot;
    onModuleInit(): void;
    notifyPayment(_customerId: number, _message: string): Promise<void>;
}
