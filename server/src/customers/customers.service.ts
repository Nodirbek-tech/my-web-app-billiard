import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Bu telefon raqami allaqachon ro\'yxatda');

    return this.prisma.$transaction(async (tx) => {
      const c = await tx.customer.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          bonusBalance: dto.bonusBalance ?? 0,
          cardNumber: 'TEMP',
        },
      });
      return tx.customer.update({
        where: { id: c.id },
        data: { cardNumber: `LC-${c.id.toString().padStart(8, '0')}` },
      });
    });
  }

  async findAll(search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
            { cardNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { visits: true } } },
    });
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        visits: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { session: { include: { table: true } } },
        },
        _count: { select: { visits: true } },
      },
    });
    if (!customer) throw new NotFoundException('Mijoz topilmadi');
    return customer;
  }

  async findByPhone(phone: string) {
    return this.prisma.customer.findMany({
      where: { phone: { contains: phone } },
      take: 10,
    });
  }

  async update(id: number, dto: UpdateCustomerDto) {
    await this.findOne(id);
    if (dto.phone) {
      const existing = await this.prisma.customer.findUnique({ where: { phone: dto.phone } });
      if (existing && existing.id !== id) throw new ConflictException('Bu telefon raqami band');
    }
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.customer.delete({ where: { id } });
  }
}
