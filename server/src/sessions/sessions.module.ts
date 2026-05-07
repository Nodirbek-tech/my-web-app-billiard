import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { WsModule } from '../websocket/ws.module';

@Module({
  imports: [WsModule],
  providers: [SessionsService],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
