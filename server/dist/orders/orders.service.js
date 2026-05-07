"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ws_service_1 = require("../websocket/ws.service");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    constructor(prisma, ws) {
        this.prisma = prisma;
        this.ws = ws;
    }
    async addOrder(dto) {
        const session = await this.prisma.session.findUnique({
            where: { id: dto.sessionId },
            select: { status: true, tableId: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== client_1.SessionStatus.ACTIVE)
            throw new common_1.BadRequestException('Session is not active');
        const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (!product.active)
            throw new common_1.BadRequestException('Product is not available');
        const total = Math.round(product.price * dto.quantity * 100) / 100;
        const order = await this.prisma.sessionOrder.create({
            data: {
                sessionId: dto.sessionId,
                productId: dto.productId,
                quantity: dto.quantity,
                unitPrice: product.price,
                total,
            },
            include: { product: true },
        });
        this.ws.emitSessionUpdate({ id: dto.sessionId, tableId: session.tableId });
        return order;
    }
    async removeOrder(id) {
        const order = await this.prisma.sessionOrder.findUnique({
            where: { id },
            include: { session: { select: { status: true, tableId: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.session.status !== client_1.SessionStatus.ACTIVE)
            throw new common_1.BadRequestException('Cannot remove order from completed session');
        await this.prisma.sessionOrder.delete({ where: { id } });
        this.ws.emitSessionUpdate({ id: order.sessionId, tableId: order.session.tableId });
        return { success: true };
    }
    async getSessionOrders(sessionId) {
        return this.prisma.sessionOrder.findMany({
            where: { sessionId },
            include: { product: true },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ws_service_1.WsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map