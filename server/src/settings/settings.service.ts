import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateSettingsData {
  cashbackPercent?: number;
  dayHourlyPrice?: number;
  nightHourlyPrice?: number;
  dayStartTime?: string;
  nightStartTime?: string;
  address?: string;
  contactPhone?: string;
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let settings = await this.prisma.businessSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await this.prisma.businessSettings.create({
        data: {
          id: 1,
          cashbackPercent: 5,
          dayHourlyPrice: 40000,
          nightHourlyPrice: 50000,
          dayStartTime: '06:00',
          nightStartTime: '18:00',
        },
      });
    }
    return settings;
  }

  async update(data: UpdateSettingsData) {
    return this.prisma.businessSettings.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        cashbackPercent: data.cashbackPercent ?? 5,
        dayHourlyPrice: data.dayHourlyPrice ?? 40000,
        nightHourlyPrice: data.nightHourlyPrice ?? 50000,
        dayStartTime: data.dayStartTime ?? '06:00',
        nightStartTime: data.nightStartTime ?? '18:00',
        address: data.address ?? "Manzil ko'rsatilmagan",
        contactPhone: data.contactPhone ?? '+998 XX XXX XX XX',
      },
    });
  }
}
