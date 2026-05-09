import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TablesModule } from './tables/tables.module';
import { SessionsModule } from './sessions/sessions.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';
import { WsModule } from './websocket/ws.module';
import { CustomersModule } from './customers/customers.module';
import { SettingsModule } from './settings/settings.module';
import { TelegramModule } from './telegram/telegram.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PromotionsModule } from './promotions/promotions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TablesModule,
    SessionsModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    ReportsModule,
    WsModule,
    CustomersModule,
    SettingsModule,
    TelegramModule,
    ReservationsModule,
    PromotionsModule,
  ],
})
export class AppModule {}
