import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WsService } from '../websocket/ws.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private ws: WsService,
  ) {}

  async createPayment(dto: CreatePaymentDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
      include: { orders: true, payment: true, table: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.COMPLETED)
      throw new BadRequestException('Session must be stopped before payment');
    if (session.payment) throw new ConflictException('Payment already exists for this session');

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

  async getPaymentBySession(sessionId: number) {
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
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getReceiptData(sessionId: number) {
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
}
