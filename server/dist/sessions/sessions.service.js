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
var SessionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ws_service_1 = require("../websocket/ws.service");
const settings_service_1 = require("../settings/settings.service");
const telegram_service_1 = require("../telegram/telegram.service");
const client_1 = require("@prisma/client");
function parseHour(hhmm) {
    return parseInt(hhmm.split(':')[0], 10);
}
function calcCostSplit(start, end, dayRate, nightRate, dayStartHour, nightStartHour) {
    let cost = 0;
    let current = start.getTime();
    const endMs = end.getTime();
    while (current < endMs) {
        const d = new Date(current);
        const h = d.getHours();
        const isNight = h >= nightStartHour || h < dayStartHour;
        const rate = isNight ? nightRate : dayRate;
        const boundary = new Date(d);
        if (isNight) {
            if (h >= nightStartHour) {
                boundary.setDate(boundary.getDate() + 1);
                boundary.setHours(dayStartHour, 0, 0, 0);
            }
            else {
                boundary.setHours(dayStartHour, 0, 0, 0);
            }
        }
        else {
            boundary.setHours(nightStartHour, 0, 0, 0);
        }
        const segEnd = Math.min(boundary.getTime(), endMs);
        const segMinutes = (segEnd - current) / 60000;
        cost += (segMinutes / 60) * rate;
        current = segEnd;
    }
    return Math.round(cost * 100) / 100;
}
let SessionsService = SessionsService_1 = class SessionsService {
    constructor(prisma, ws, settingsService, telegram) {
        this.prisma = prisma;
        this.ws = ws;
        this.settingsService = settingsService;
        this.telegram = telegram;
        this.logger = new common_1.Logger(SessionsService_1.name);
        this.settingsCache = null;
    }
    async getSettings() {
        const now = Date.now();
        if (this.settingsCache && now < this.settingsCache.expiresAt) {
            return this.settingsCache.data;
        }
        const data = await this.settingsService.get();
        this.settingsCache = { data, expiresAt: now + 60_000 };
        return data;
    }
    sessionIncludes() {
        return {
            rounds: { orderBy: { roundNum: 'asc' } },
            orders: { include: { product: true }, orderBy: { createdAt: 'asc' } },
            table: true,
            payment: true,
            customer: true,
        };
    }
    leanIncludes() {
        return {
            rounds: { orderBy: { roundNum: 'asc' } },
            table: true,
        };
    }
    async startSession(tableId) {
        const t0 = Date.now();
        const table = await this.prisma.table.findUnique({
            where: { id: tableId },
            select: { id: true, status: true },
        });
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
                include: this.leanIncludes(),
            });
            await tx.table.update({ where: { id: tableId }, data: { status: client_1.TableStatus.OCCUPIED } });
            return s;
        });
        this.ws.emitTableUpdate({ id: tableId, status: client_1.TableStatus.OCCUPIED });
        const ms = Date.now() - t0;
        if (ms > 150)
            this.logger.warn(`startSession(${tableId}) ${ms}ms`);
        return session;
    }
    async nextRound(sessionId) {
        const t0 = Date.now();
        const [session, settings] = await Promise.all([
            this.prisma.session.findUnique({
                where: { id: sessionId },
                select: {
                    id: true, tableId: true, status: true,
                    rounds: { orderBy: { roundNum: 'asc' } },
                    table: { select: { id: true } },
                },
            }),
            this.getSettings(),
        ]);
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== client_1.SessionStatus.ACTIVE)
            throw new common_1.BadRequestException('Session is not active');
        const activeRound = session.rounds.find((r) => !r.endTime);
        if (!activeRound)
            throw new common_1.BadRequestException('No active round');
        const now = new Date();
        const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
        const cost = calcCostSplit(activeRound.startTime, now, settings.dayHourlyPrice, settings.nightHourlyPrice, parseHour(settings.dayStartTime), parseHour(settings.nightStartTime));
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
            include: this.leanIncludes(),
        });
        this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
        const ms = Date.now() - t0;
        if (ms > 150)
            this.logger.warn(`nextRound(${sessionId}) ${ms}ms`);
        return updated;
    }
    async stopSession(sessionId) {
        const t0 = Date.now();
        const [session, settings] = await Promise.all([
            this.prisma.session.findUnique({
                where: { id: sessionId },
                select: {
                    id: true, tableId: true, status: true,
                    rounds: { orderBy: { roundNum: 'asc' } },
                    orders: { select: { id: true } },
                },
            }),
            this.getSettings(),
        ]);
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== client_1.SessionStatus.ACTIVE)
            throw new common_1.BadRequestException('Session is not active');
        const now = new Date();
        const activeRound = session.rounds.find((r) => !r.endTime);
        if (activeRound) {
            const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
            const cost = calcCostSplit(activeRound.startTime, now, settings.dayHourlyPrice, settings.nightHourlyPrice, parseHour(settings.dayStartTime), parseHour(settings.nightStartTime));
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
                include: this.leanIncludes(),
            });
            await tx.table.update({
                where: { id: session.tableId },
                data: { status: client_1.TableStatus.AVAILABLE },
            });
            return s;
        });
        this.ws.emitTableUpdate({ id: session.tableId, status: client_1.TableStatus.AVAILABLE });
        this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
        const ms = Date.now() - t0;
        if (ms > 200)
            this.logger.warn(`stopSession(${sessionId}) ${ms}ms`);
        return updated;
    }
    async attachCustomer(sessionId, customerId) {
        const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== client_1.SessionStatus.ACTIVE)
            throw new common_1.BadRequestException('Session is not active');
        if (customerId !== null) {
            const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
            if (!customer)
                throw new common_1.NotFoundException('Customer not found');
        }
        const updated = await this.prisma.session.update({
            where: { id: sessionId },
            data: { customerId },
            include: this.sessionIncludes(),
        });
        this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
        return updated;
    }
    async stopAndPay(sessionId, dto) {
        const t0 = Date.now();
        const [session, settings] = await Promise.all([
            this.prisma.session.findUnique({
                where: { id: sessionId },
                include: {
                    rounds: true,
                    orders: { include: { product: true } },
                    table: true,
                    payment: true,
                    customer: true,
                },
            }),
            this.getSettings(),
        ]);
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.status !== client_1.SessionStatus.ACTIVE)
            throw new common_1.BadRequestException('Session is not active');
        if (session.payment)
            throw new common_1.BadRequestException('Payment already processed');
        const dayStartHour = parseHour(settings.dayStartTime);
        const nightStartHour = parseHour(settings.nightStartTime);
        const now = new Date();
        const activeRound = session.rounds.find((r) => !r.endTime);
        let closedRound = null;
        if (activeRound) {
            const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
            const cost = calcCostSplit(activeRound.startTime, now, settings.dayHourlyPrice, settings.nightHourlyPrice, dayStartHour, nightStartHour);
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
        const customer = session.customer;
        const rawBonusRedeemed = dto.bonusRedeemed ?? 0;
        const bonusRedeemed = customer
            ? Math.min(rawBonusRedeemed, customer.bonusBalance)
            : 0;
        const grossCost = Math.max(0, Math.round((playCost + orderCost + serviceFee - discount) * 100) / 100);
        const totalCost = Math.max(0, Math.round((grossCost - bonusRedeemed) * 100) / 100);
        let bonusEarned = 0;
        if (customer) {
            bonusEarned = Math.round(totalCost * settings.cashbackPercent) / 100;
        }
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
                    customerId: customer?.id ?? null,
                    bonusRedeemed,
                    bonusEarned,
                },
            });
            if (customer) {
                await tx.customerVisit.create({
                    data: {
                        customerId: customer.id,
                        sessionId,
                        playCost,
                        orderCost,
                        totalCost,
                        bonusEarned,
                        bonusRedeemed,
                    },
                });
                await tx.customer.update({
                    where: { id: customer.id },
                    data: { bonusBalance: { increment: bonusEarned - bonusRedeemed } },
                });
            }
            await tx.table.update({
                where: { id: session.tableId },
                data: { status: client_1.TableStatus.AVAILABLE },
            });
            return p;
        });
        const newBonusBalance = customer
            ? Math.max(0, customer.bonusBalance + bonusEarned - bonusRedeemed)
            : null;
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
            bonusRedeemed,
            bonusEarned,
            totalCost,
            method: dto.method,
            cashAmount,
            cardAmount,
            change,
            notes: dto.notes ?? null,
            paidAt: payment.paidAt.toISOString(),
            customerName: customer?.name ?? null,
            customerCard: customer?.cardNumber ?? null,
            bonusBalance: newBonusBalance,
        };
        this.ws.emitTableUpdate({ id: session.tableId, status: client_1.TableStatus.AVAILABLE });
        this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
        if (customer?.telegramId) {
            this.telegram.notifyPayment(customer.id, {
                tableName: session.table.name,
                totalMinutes,
                totalCost,
                bonusEarned,
                bonusBalance: newBonusBalance ?? 0,
            }).catch(() => { });
        }
        const ms = Date.now() - t0;
        if (ms > 300)
            this.logger.warn(`stopAndPay(${sessionId}) ${ms}ms`);
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
exports.SessionsService = SessionsService = SessionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ws_service_1.WsService,
        settings_service_1.SettingsService,
        telegram_service_1.TelegramService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map