import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`WS connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`WS disconnected: ${client.id}`);
  }

  emitTableUpdate(data: any) {
    this.server.emit('table:update', data);
  }

  emitSessionUpdate(data: any) {
    this.server.emit('session:update', data);
  }
}
