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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ws_service_1 = require("../websocket/ws.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    constructor(prisma, ws) {
        this.prisma = prisma;
        this.ws = ws;
    }
    async createPayment(dto) {
        const session = await this.prisma.session.findUnique({
            where: { id: dto.sessionId },
            include: { orders: true, payment: true, table: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== client_1.SessionStatus.COMPLETED)
            throw new common_1.BadRequestException('Session must be stopped before payment');
        if (session.payment)
            throw new common_1.ConflictException('Payment already exists for this session');
        const playCost = session.playCost ?? 0;
        const orderCost = session.orders.reduce((s, o) => s + o.total, 0);
        const discount = dto.discount ?? 0;
        const totalCost = Math.max(0, playCost + orderCost - discount);
        const payment = await this.prisma.payment.create({
            data: {
                sessionId: dto.sessionId,
                playCost,
                orderCost,
                discount,
                totalCost,
                method: dto.method,
            },
            include: {
                session: {
                    include: {
                        table: true,
                        rounds: { orderBy: { roundNum: 'asc' } },
                        orders: { include: { product: true } },
                    },
                },
            },
        });
        this.ws.emitTableUpdate({ id: session.tableId, status: 'AVAILABLE' });
        return payment;
    }
    async getPaymentBySession(sessionId) {
        const payment = await this.prisma.payment.findUnique({
            where: { sessionId },
            include: {
                session: {
                    include: {
                        table: true,
                        rounds: { orderBy: { roundNum: 'asc' } },
                        orders: { include: { product: true } },
                    },
                },
            },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return payment;
    }
    async getReceiptData(sessionId) {
        const payment = await this.getPaymentBySession(sessionId);
        const { session } = payment;
        return {
            receiptNumber: `RC-${String(payment.id).padStart(6, '0')}`,
            tableNumber: session.table.number,
            tableName: session.table.name,
            startTime: session.startTime,
            endTime: session.endTime,
            totalMinutes: session.totalMinutes,
            rounds: session.rounds,
            orders: session.orders.map((o) => ({
                name: o.product.name,
                quantity: o.quantity,
                unitPrice: o.unitPrice,
                total: o.total,
            })),
            playCost: payment.playCost,
            orderCost: payment.orderCost,
            discount: payment.discount,
            totalCost: payment.totalCost,
            method: payment.method,
            paidAt: payment.paidAt,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ws_service_1.WsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map