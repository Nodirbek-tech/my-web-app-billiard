import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { WsModule } from '../websocket/ws.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [WsModule, SettingsModule],
  providers: [SessionsService],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}
