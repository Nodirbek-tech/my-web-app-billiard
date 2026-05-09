import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  // Lean — only what TableCard needs (timer + round count). No orders/products/customer.
  private leanSessionInclude() {
    return {
      where: { status: SessionStatus.ACTIVE },
      take: 1,
      include: {
        rounds: { orderBy: { roundNum: 'asc' as const } },
      },
    } as const;
  }

  // Full — needed by SessionPanel to show orders, customer, completed rounds.
  private fullSessionInclude() {
    return {
      where: { status: SessionStatus.ACTIVE },
      take: 1,
      include: {
        rounds: { orderBy: { roundNum: 'asc' as const } },
        orders: { include: { product: true }, orderBy: { createdAt: 'asc' as const } },
        customer: true,
        payment: true,
      },
    } as const;
  }

  async findAll() {
    const tables = await this.prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: { sessions: this.leanSessionInclude() },
    });

    return tables.map((t) => ({
      ...t,
      // Backfill optional fields so frontend types stay satisfied
      activeSession: t.sessions[0]
        ? { ...t.sessions[0], orders: [] as any[], customer: null as any, payment: null as any }
        : null,
      sessions: undefined,
    }));
  }

  async findOne(id: number) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: { sessions: this.fullSessionInclude() },
    });
    if (!table) throw new NotFoundException('Table not found');
    return { ...table, activeSession: table.sessions[0] || null, sessions: undefined };
  }

  async create(dto: CreateTableDto) {
    const exists = await this.prisma.table.findUnique({ where: { number: dto.number } });
    if (exists) throw new ConflictException(`Table #${dto.number} already exists`);
    return this.prisma.table.create({ data: dto });
  }

  async update(id: number, dto: Partial<CreateTableDto>) {
    await this.findOne(id);
    return this.prisma.table.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.table.delete({ where: { id } });
  }
}
