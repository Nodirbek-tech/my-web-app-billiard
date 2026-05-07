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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTodayStats() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const [payments, activeSessions, topProducts] = await Promise.all([
            this.prisma.payment.findMany({
                where: { paidAt: { gte: todayStart, lte: todayEnd } },
                include: { session: { include: { table: true } } },
            }),
            this.prisma.session.count({
                where: { status: client_1.SessionStatus.ACTIVE },
            }),
            this.prisma.sessionOrder.groupBy({
                by: ['productId'],
                _sum: { quantity: true, total: true },
                _count: { productId: true },
                where: { createdAt: { gte: todayStart, lte: todayEnd } },
                orderBy: { _sum: { total: 'desc' } },
                take: 5,
            }),
        ]);
        const productIds = topProducts.map((p) => p.productId);
        const productNames = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true },
        });
        const nameMap = Object.fromEntries(productNames.map((p) => [p.id, p.name]));
        const totalRevenue = payments.reduce((s, p) => s + p.totalCost, 0);
        const cashRevenue = payments
            .filter((p) => p.method === 'CASH')
            .reduce((s, p) => s + p.totalCost, 0);
        const cardRevenue = payments
            .filter((p) => p.method === 'CARD')
            .reduce((s, p) => s + p.totalCost, 0);
        return {
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            sessionCount: payments.length,
            activeTables: activeSessions,
            paymentBreakdown: {
                cash: Math.round(cashRevenue * 100) / 100,
                card: Math.round(cardRevenue * 100) / 100,
            },
            topProducts: topProducts.map((p) => ({
                name: nameMap[p.productId] ?? 'Unknown',
                count: p._sum.quantity ?? 0,
                revenue: Math.round((p._sum.total ?? 0) * 100) / 100,
            })),
        };
    }
    async getSessionHistory(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [sessions, total] = await Promise.all([
            this.prisma.session.findMany({
                where: { status: client_1.SessionStatus.COMPLETED },
                include: {
                    table: true,
                    payment: true,
                    _count: { select: { orders: true } },
                },
                orderBy: { endTime: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.session.count({ where: { status: client_1.SessionStatus.COMPLETED } }),
        ]);
        return {
            data: sessions,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map