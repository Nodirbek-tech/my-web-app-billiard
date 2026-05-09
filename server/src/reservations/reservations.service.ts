import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReservationDto) {
    return this.prisma.reservation.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        date: new Date(dto.date),
        peopleCount: dto.peopleCount,
        note: dto.note ?? null,
        customerId: dto.customerId ?? null,
      },
      include: { customer: true },
    });
  }

  async findAll(status?: ReservationStatus) {
    return this.prisma.reservation.findMany({
      where: status ? { status } : {},
      orderBy: { date: 'asc' },
      include: { customer: true },
    });
  }

  async findOne(id: number) {
    const r = await this.prisma.reservation.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!r) throw new NotFoundException('Bron topilmadi');
    return r;
  }

  async findByCustomer(customerId: number) {
    return this.prisma.reservation.findMany({
      where: { customerId },
      orderBy: { date: 'desc' },
      take: 10,
    });
  }

  async updateStatus(id: number, dto: UpdateReservationStatusDto) {
    await this.findOne(id);
    return this.prisma.reservation.update({
      where: { id },
      data: { status: dto.status },
      include: { customer: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.reservation.delete({ where: { id } });
  }
}
