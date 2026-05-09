import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePromotionDto) {
    return this.prisma.promotion.create({ data: dto });
  }

  async findAll(activeOnly = false) {
    return this.prisma.promotion.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { sendLogs: true } } },
    });
  }

  async findOne(id: number) {
    const p = await this.prisma.promotion.findUnique({
      where: { id },
      include: { _count: { select: { sendLogs: true } } },
    });
    if (!p) throw new NotFoundException('Aksiya topilmadi');
    return p;
  }

  async update(id: number, dto: UpdatePromotionDto) {
    await this.findOne(id);
    return this.prisma.promotion.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.promotion.delete({ where: { id } });
  }

  async getActiveForBot() {
    return this.prisma.promotion.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
