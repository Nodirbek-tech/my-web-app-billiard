import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: any = null;

  onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      this.logger.log('TELEGRAM_BOT_TOKEN not set — bot disabled');
      return;
    }
    // Phase 2: initialize bot here
    this.logger.log('Telegram bot token found — Phase 2 integration pending');
  }

  async notifyPayment(_customerId: number, _message: string): Promise<void> {
    // Phase 2: send receipt/notification to customer via Telegram
  }
}
