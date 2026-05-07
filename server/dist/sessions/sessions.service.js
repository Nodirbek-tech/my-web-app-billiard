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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ws_service_1 = require("../websocket/ws.service");
const client_1 = require("@prisma/client");
let SessionsService = class SessionsService {
    constructor(prisma, ws) {
        this.prisma = prisma;
        this.ws = ws;
    }
    calcCost(start, end, dayRate, nightRate) {
        const minutes = (end.getTime() - start.getTime()) / 60000;
        const h = start.getHours();
        const isNight = h >= 18 || h < 6;
        const rate = nightRate && isNight ? nightRate : dayRate;
        return Math.round((minutes / 60) * rate * 100) / 100;
    }
    sessionIncludes() {
        return {
            rounds: { orderBy: { roundNum: 'asc' } },
            orders: { include: { product: true }, orderBy: { createdAt: 'asc' } },
            table: true,
            payment: true,
        };
    }
    async startSession(tableId) {
        const table = await this.prisma.table.findUnique({ where: { id: tableId } });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        if (table.status !== client_1.TableStatus.AVAILABLE)
            throw new common_1.BadRequestException('Table is already occupied');
        const now = new Date();
        const session = await this.prisma.$transaction(async (tx) => {
            const s = await tx.session.create({
                data: {
                    tableId,
                    startTime: now,
                    status: client_1.SessionStatus.ACTIVE,
                    rounds: { create: { roundNum: 1, startTime: now } },
                },
                include: this.sessionIncludes(),
            });
            await tx.table.update({ where: { id: tableId }, data: { status: client_1.TableStatus.OCCUPIED } });
            return s;
        });
        this.ws.emitTableUpdate({ id: tableId, status: client_1.TableStatus.OCCUPIED });
        return session;
    }
    async nextRound(sessionId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { rounds: true, table: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== client_1.SessionStatus.ACTIVE)
            throw new common_1.BadRequestException('Session is not active');
        const activeRound = session.rounds.find((r) => !r.endTime);
        if (!activeRound)
            throw new common_1.BadRequestException('No active round');
        const now = new Date();
        const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
        const cost = this.calcCost(activeRound.startTime, now, session.table.hourlyPrice, session.table.nightPrice ?? undefined);
        await this.prisma.$transaction([
            this.prisma.sessionRound.update({
                where: { id: activeRound.id },
                data: { endTime: now, minutes, cost },
            }),
            this.prisma.sessionRound.create({
                data: { sessionId, roundNum: session.rounds.length + 1, startTime: now },
            }),
        ]);
        const updated = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: this.sessionIncludes(),
        });
        this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
        return updated;
    }
    async stopSession(sessionId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { rounds: true, orders: true, table: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== client_1.SessionStatus.ACTIVE)
            throw new common_1.BadRequestException('Session is not active');
        const now = new Date();
        const activeRound = session.rounds.find((r) => !r.endTime);
        if (activeRound) {
            const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
            const cost = this.calcCost(activeRound.startTime, now, session.table.hourlyPrice, session.table.nightPrice ?? undefined);
            await this.prisma.sessionRound.update({
                where: { id: activeRound.id },
                data: { endTime: now, minutes, cost },
            });
        }
        const allRounds = await this.prisma.sessionRound.findMany({ where: { sessionId } });
        const totalMinutes = allRounds.reduce((s, r) => s + (r.minutes ?? 0), 0);
        const playCost = Math.round(allRounds.reduce((s, r) => s + (r.cost ?? 0), 0) * 100) / 100;
        const updated = await this.prisma.$transaction(async (tx) => {
            const s = await tx.session.update({
                where: { id: sessionId },
                data: { endTime: now, totalMinutes, playCost, status: client_1.SessionStatus.COMPLETED },
                include: this.sessionIncludes(),
            });
            await tx.table.update({
                where: { id: session.tableId },
                data: { status: client_1.TableStatus.AVAILABLE },
            });
            return s;
        });
        this.ws.emitTableUpdate({ id: session.tableId, status: client_1.TableStatus.AVAILABLE });
        this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
        return updated;
    }
    async stopAndPay(sessionId, dto) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { rounds: true, orders: { include: { product: true } }, table: true, payment: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== client_1.SessionStatus.ACTIVE)
            throw new common_1.BadRequestException('Session is not active');
        if (session.payment)
            throw new common_1.BadRequestException('Payment already processed');
        const now = new Date();
        const activeRound = session.rounds.find((r) => !r.endTime);
        let closedRound = null;
        if (activeRound) {
            const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
            const cost = this.calcCost(activeRound.startTime, now, session.table.hourlyPrice, session.table.nightPrice ?? undefined);
            closedRound = { id: activeRound.id, minutes, cost, endTime: now };
        }
        const finalRounds = session.rounds.map((r) => closedRound && r.id === closedRound.id
            ? { ...r, endTime: closedRound.endTime, minutes: closedRound.minutes, cost: closedRound.cost }
            : r);
        const totalMinutes = finalRounds.reduce((s, r) => s + (r.minutes ?? 0), 0);
        const playCost = Math.round(finalRounds.reduce((s, r) => s + (r.cost ?? 0), 0) * 100) / 100;
        const orderCost = Math.round(session.orders.reduce((s, o) => s + o.total, 0) * 100) / 100;
        const discount = Math.round((dto.discount ?? 0) * 100) / 100;
        const serviceFee = Math.round((dto.serviceFee ?? 0) * 100) / 100;
        const totalCost = Math.max(0, Math.round((playCost + orderCost + serviceFee - discount) * 100) / 100);
        const cashAmount = dto.cashAmount ?? null;
        const cardAmount = dto.cardAmount ?? null;
        const change = dto.method === 'CASH' && cashAmount !== null && cashAmount >= totalCost
            ? Math.round((cashAmount - totalCost) * 100) / 100
            : null;
        const payment = await this.prisma.$transaction(async (tx) => {
            if (closedRound) {
                await tx.sessionRound.update({
                    where: { id: closedRound.id },
                    data: { endTime: closedRound.endTime, minutes: closedRound.minutes, cost: closedRound.cost },
                });
            }
            await tx.session.update({
                where: { id: sessionId },
                data: { endTime: now, totalMinutes, playCost, status: client_1.SessionStatus.COMPLETED },
            });
            const p = await tx.payment.create({
                data: {
                    sessionId,
                    playCost,
                    orderCost,
                    discount,
                    serviceFee,
                    totalCost,
                    method: dto.method,
                    cashAmount,
                    cardAmount,
                    notes: dto.notes ?? null,
                    cashierName: dto.cashierName ?? null,
                },
            });
            await tx.table.update({
                where: { id: session.tableId },
                data: { status: client_1.TableStatus.AVAILABLE },
            });
            return p;
        });
        const receiptData = {
            receiptNumber: `RC-${String(payment.id).padStart(6, '0')}`,
            paymentId: payment.id,
            sessionId,
            tableNumber: session.table.number,
            tableName: session.table.name,
            startTime: session.startTime.toISOString(),
            endTime: now.toISOString(),
            totalMinutes,
            cashierName: dto.cashierName ?? 'Staff',
            rounds: finalRounds.map((r) => ({
                roundNum: r.roundNum,
                startTime: r.startTime.toISOString(),
                endTime: (r.endTime ?? now).toISOString(),
                minutes: r.minutes ?? 0,
                cost: r.cost ?? 0,
            })),
            orders: session.orders.map((o) => ({
                name: o.product.name,
                quantity: o.quantity,
                unitPrice: o.unitPrice,
                total: o.total,
            })),
            playCost,
            orderCost,
            serviceFee,
            discount,
            totalCost,
            method: dto.method,
            cashAmount,
            cardAmount,
            change,
            notes: dto.notes ?? null,
            paidAt: payment.paidAt.toISOString(),
        };
        this.ws.emitTableUpdate({ id: session.tableId, status: client_1.TableStatus.AVAILABLE });
        this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
        return receiptData;
    }
    async getSession(id) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: this.sessionIncludes(),
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        return session;
    }
    async getActiveByTable(tableId) {
        return this.prisma.session.findFirst({
            where: { tableId, status: client_1.SessionStatus.ACTIVE },
            include: this.sessionIncludes(),
        });
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ws_service_1.WsService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map