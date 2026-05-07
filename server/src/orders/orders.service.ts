import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WsService } from '../websocket/ws.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ws: WsService,
  ) {}

  async addOrder(dto: CreateOrderDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
      select: { status: true, tableId: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== SessionStatus.ACTIVE)
      throw new BadRequestException('Session is not active');

    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.active) throw new BadRequestException('Product is not available');

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

  async removeOrder(id: number) {
    const order = await this.prisma.sessionOrder.findUnique({
      where: { id },
      include: { session: { select: { status: true, tableId: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.session.status !== SessionStatus.ACTIVE)
      throw new BadRequestException('Cannot remove order from completed session');

    await this.prisma.sessionOrder.delete({ where: { id } });
    this.ws.emitSessionUpdate({ id: order.sessionId, tableId: order.session.tableId });
    return { success: true };
  }

  async getSessionOrders(sessionId: number) {
    return this.prisma.sessionOrder.findMany({
      where: { sessionId },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
