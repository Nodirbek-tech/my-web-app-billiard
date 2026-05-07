import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStatus, TableStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

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
        where: { status: SessionStatus.ACTIVE },
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
        where: { status: SessionStatus.COMPLETED },
        include: {
          table: true,
          payment: true,
          _count: { select: { orders: true } },
        },
        orderBy: { endTime: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.session.count({ where: { status: SessionStatus.COMPLETED } }),
    ]);

    return {
      data: sessions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
