import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { WsModule } from '../websocket/ws.module';

@Module({
  imports: [WsModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
