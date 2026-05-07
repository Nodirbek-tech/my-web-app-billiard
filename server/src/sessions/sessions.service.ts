import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WsService } from '../websocket/ws.service';
import { TableStatus, SessionStatus } from '@prisma/client';
import { StopAndPayDto } from './dto/stop-and-pay.dto';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private ws: WsService,
  ) {}

  private calcCost(start: Date, end: Date, dayRate: number, nightRate?: number): number {
    const minutes = (end.getTime() - start.getTime()) / 60000;
    const h = start.getHours();
    const isNight = h >= 18 || h < 6;
    const rate = nightRate && isNight ? nightRate : dayRate;
    return Math.round((minutes / 60) * rate * 100) / 100;
  }

  private sessionIncludes() {
    return {
      rounds: { orderBy: { roundNum: 'asc' as const } },
      orders: { include: { product: true }, orderBy: { createdAt: 'asc' as const } },
      table: true,
      payment: true,
    };
  }

  async startSession(tableId: number) {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
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
        include: this.sessionIncludes(),
      });
      await tx.table.update({ where: { id: tableId }, data: { status: TableStatus.OCCUPIED } });
      return s;
    });

    this.ws.emitTableUpdate({ id: tableId, status: TableStatus.OCCUPIED });
    return session;
  }

  async nextRound(sessionId: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { rounds: true, table: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.ACTIVE)
      throw new BadRequestException('Session is not active');

    const activeRound = session.rounds.find((r) => !r.endTime);
    if (!activeRound) throw new BadRequestException('No active round');

    const now = new Date();
    const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
    const cost = this.calcCost(
      activeRound.startTime,
      now,
      session.table.hourlyPrice,
      session.table.nightPrice ?? undefined,
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
      include: this.sessionIncludes(),
    });
    this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
    return updated;
  }

  async stopSession(sessionId: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { rounds: true, orders: true, table: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.ACTIVE)
      throw new BadRequestException('Session is not active');

    const now = new Date();
    const activeRound = session.rounds.find((r) => !r.endTime);

    if (activeRound) {
      const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
      const cost = this.calcCost(
        activeRound.startTime,
        now,
        session.table.hourlyPrice,
        session.table.nightPrice ?? undefined,
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
        include: this.sessionIncludes(),
      });
      await tx.table.update({
        where: { id: session.tableId },
        data: { status: TableStatus.AVAILABLE },
      });
      return s;
    });

    this.ws.emitTableUpdate({ id: session.tableId, status: TableStatus.AVAILABLE });
    this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
    return updated;
  }

  // Atomic stop + payment — session stays ACTIVE until this succeeds
  async stopAndPay(sessionId: number, dto: StopAndPayDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { rounds: true, orders: { include: { product: true } }, table: true, payment: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.ACTIVE)
      throw new BadRequestException('Session is not active');
    if (session.payment) throw new BadRequestException('Payment already processed');

    const now = new Date();
    const activeRound = session.rounds.find((r) => !r.endTime);

    let closedRound: { id: number; minutes: number; cost: number; endTime: Date } | null = null;
    if (activeRound) {
      const minutes = Math.ceil((now.getTime() - activeRound.startTime.getTime()) / 60000);
      const cost = this.calcCost(
        activeRound.startTime, now,
        session.table.hourlyPrice, session.table.nightPrice ?? undefined,
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
    const totalCost = Math.max(0, Math.round((playCost + orderCost + serviceFee - discount) * 100) / 100);
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
      const p = await (tx.payment.create as any)({
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
        data: { status: TableStatus.AVAILABLE },
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

    this.ws.emitTableUpdate({ id: session.tableId, status: TableStatus.AVAILABLE });
    this.ws.emitSessionUpdate({ id: sessionId, tableId: session.tableId });
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
