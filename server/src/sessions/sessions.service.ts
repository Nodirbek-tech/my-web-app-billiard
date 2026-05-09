import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WsService } from '../websocket/ws.service';
import { SettingsService } from '../settings/settings.service';
import { TelegramService } from '../telegram/telegram.service';
import { TableStatus, SessionStatus } from '@prisma/client';
import { StopAndPayDto } from './dto/stop-and-pay.dto';
import type { BusinessSettings } from '@prisma/client';

function parseHour(hhmm: string): number {
  return parseInt(hhmm.split(':')[0], 10);
}

// Splits a time range at day/night boundaries and returns the total cost.
function calcCostSplit(
  start: Date,
  end: Date,
  dayRate: number,
  nightRate: number,
  dayStartHour: number,
  nightStartHour: number,
): number {
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
      } else {
        boundary.setHours(dayStartHour, 0, 0, 0);
      }
    } else {
      boundary.setHours(nightStartHour, 0, 0, 0);
    }

    const segEnd = Math.min(boundary.getTime(), endMs);
    const segMinutes = (segEnd - current) / 60000;
    cost += (segMinutes / 60) * rate;
    current = segEnd;
  }

  return Math.round(cost * 100) / 100;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);
  private settingsCache: { data: BusinessSettings; expiresAt: number } | null = null;

  constructor(
    private prisma: PrismaService,
    private ws: WsService,
    private settingsService: SettingsService,
    private telegram: TelegramService,
  ) {}

  // 60-second in-memory settings cache — avoids a DB round-trip on every session op
  private async getSettings(): Promise<BusinessSettings> {
    const now = Date.now();
    if (this.settingsCache && now < this.settingsCache.expiresAt) {
      return this.settingsCache.data;
    }
    const data = await this.settingsService.get();
    this.settingsCache = { data, expiresAt: now + 60_000 };
    return data;
  }

  // Full includes — used when the response is displayed in SessionPanel
  private sessionIncludes() {
    return {
      rounds: { orderBy: { roundNum: 'asc' as const } },
      orders: { include: { product: true }, orderBy: { createdAt: 'asc' as const } },
      table: true,
      payment: true,
      customer: true,
    };
  }

  // Lean includes — used for start/next-round/stop where orders/customer aren't needed
  private leanIncludes() {
    return {
      rounds: { orderBy: { roundNum: 'asc' as const } },
      table: true,
    };
  }

  async startSession(tableId: number) {
    const t0 = Date.now();
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      select: { id: true, status: true },
    });
    if (!table) throw new NotFoundException('Table not found');
    if (table.status !== TableStatus.AVAILABLE)
      throw new BadRequestException('Table is already occupied');

    const now = new Date();
    const session = await this.prisma.$transaction(async (tx) => {
      const s = await tx.session.create({
        data: {
          tableId,
          startTime: now,
          status: SessionStatus.ACTIVE,
          rounds: { create: { roundNum: 1, startTime: now } },
        },
        include: this.leanIncludes(),
      });
      await tx.table.update({ where: { id: tableId }, data: { status: TableStatus.OCCUPIED } });
      return s;
    });

    this.ws.emitTableUpdate({ id: tableId, status: TableStatus.OCCUPIED });
    const ms = Date.now() - t0;
    if (ms > 150) this.logger.warn(`startSession(${tableId}) ${ms}ms`);
    return session;
  }

  async nextRound(sessionId: number) {
    const t0 = Date.now();
    const [session, settings] = await Promise.all([
      this.prisma.session.findUnique({
        where: { id: sessionId },
        select: {
          id: true, tableId: true, status: true,
          rounds: { orderBy: { roundNum: 'asc' as const } },
          table: { select: { id: true } },
        },
      }),
      this.getSettings(),
    ]);
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.ACTIVE)
      throw new BadRequestException('Session is not active');

    const activeRound = session.rounds.find((r) => !r.endTime);
    if (!activeRound) throw new BadRequestException('No active round');

    const now = new Date();
    const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
    const cost = calcCostSplit(
      activeRound.startTime,
      now,
      settings.dayHourlyPrice,
      settings.nightHourlyPrice,
      parseHour(settings.dayStartTime),
      parseHour(settings.nightStartTime),
    );

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
    if (ms > 150) this.logger.warn(`nextRound(${sessionId}) ${ms}ms`);
    return updated;
  }

  async stopSession(sessionId: number) {
    const t0 = Date.now();
    const [session, settings] = await Promise.all([
      this.prisma.session.findUnique({
        where: { id: sessionId },
        select: {
          id: true, tableId: true, status: true,
          rounds: { orderBy: { roundNum: 'asc' as const } },
          orders: { select: { id: true } },
        },
      }),
      this.getSettings(),
    ]);
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.ACTIVE)
      throw new BadRequestException('Session is not active');

    const now = new Date();
    const activeRound = session.rounds.find((r) => !r.endTime);

    if (activeRound) {
      const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
      const cost = calcCostSplit(
        activeRound.startTime,
        now,
        settings.dayHourlyPrice,
        settings.nightHourlyPrice,
        parseHour(settings.dayStartTime),
        parseHour(settings.nightStartTime),
      );
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
        data: { endTime: now, totalMinutes, playCost, status: SessionStatus.COMPLETED },
        include: this.leanIncludes(),
      });
      await tx.table.update({
        where: { id: session.tableId },
        data: { status: TableStatus.AVAILABLE },
      });
      return s;
    });

    this.ws.emitTableUpdate({ id: session.tableId, status: TableStatus.AVAILABLE });
    this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
    const ms = Date.now() - t0;
    if (ms > 200) this.logger.warn(`stopSession(${sessionId}) ${ms}ms`);
    return updated;
  }

  async attachCustomer(sessionId: number, customerId: number | null) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.ACTIVE)
      throw new BadRequestException('Session is not active');

    if (customerId !== null) {
      const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) throw new NotFoundException('Customer not found');
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: { customerId },
      include: this.sessionIncludes(),
    });

    this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
    return updated;
  }

  // Atomic stop + payment — session stays ACTIVE until this succeeds
  async stopAndPay(sessionId: number, dto: StopAndPayDto) {
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
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.ACTIVE)
      throw new BadRequestException('Session is not active');
    if (session.payment) throw new BadRequestException('Payment already processed');

    const dayStartHour = parseHour(settings.dayStartTime);
    const nightStartHour = parseHour(settings.nightStartTime);

    const now = new Date();
    const activeRound = session.rounds.find((r) => !r.endTime);

    let closedRound: { id: number; minutes: number; cost: number; endTime: Date } | null = null;
    if (activeRound) {
      const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
      const cost = calcCostSplit(
        activeRound.startTime,
        now,
        settings.dayHourlyPrice,
        settings.nightHourlyPrice,
        dayStartHour,
        nightStartHour,
      );
      closedRound = { id: activeRound.id, minutes, cost, endTime: now };
    }

    const finalRounds = session.rounds.map((r) =>
      closedRound && r.id === closedRound.id
        ? { ...r, endTime: closedRound.endTime, minutes: closedRound.minutes, cost: closedRound.cost }
        : r,
    );

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
    const change =
      dto.method === 'CASH' && cashAmount !== null && cashAmount >= totalCost
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
        data: { endTime: now, totalMinutes, playCost, status: SessionStatus.COMPLETED },
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
        data: { status: TableStatus.AVAILABLE },
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

    this.ws.emitTableUpdate({ id: session.tableId, status: TableStatus.AVAILABLE });
    this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });

    // Fire-and-forget — never blocks the payment response
    if (customer?.telegramId) {
      this.telegram.notifyPayment(customer.id, {
        tableName: session.table.name,
        totalMinutes,
        totalCost,
        bonusEarned,
        bonusBalance: newBonusBalance ?? 0,
      }).catch(() => {});
    }

    const ms = Date.now() - t0;
    if (ms > 300) this.logger.warn(`stopAndPay(${sessionId}) ${ms}ms`);
    return receiptData;
  }

  async getSession(id: number) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: this.sessionIncludes(),
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async getActiveByTable(tableId: number) {
    return this.prisma.session.findFirst({
      where: { tableId, status: SessionStatus.ACTIVE },
      include: this.sessionIncludes(),
    });
  }
}
