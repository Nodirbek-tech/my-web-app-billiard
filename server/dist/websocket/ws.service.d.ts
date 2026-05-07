import { WsGateway } from './ws.gateway';
export declare class WsService {
    private gateway;
    constructor(gateway: WsGateway);
    emitTableUpdate(data: any): void;
    emitSessionUpdate(data: any): void;
}
