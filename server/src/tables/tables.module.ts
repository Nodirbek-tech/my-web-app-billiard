import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { WsModule } from '../websocket/ws.module';

@Module({
  imports: [WsModule],
  providers: [TablesService],
  controllers: [TablesController],
  exports: [TablesService],
})
export class TablesModule {}
