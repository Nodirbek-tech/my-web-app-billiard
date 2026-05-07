import { Injectable } from '@nestjs/common';
import { WsGateway } from './ws.gateway';

@Injectable()
export class WsService {
  constructor(private gateway: WsGateway) {}

  emitTableUpdate(data: any) {
    this.gateway.emitTableUpdate(data);
  }

  emitSessionUpdate(data: any) {
    this.gateway.emitSessionUpdate(data);
  }
}
