import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { TelegramService } from '../telegram/telegram.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReservationStatus } from '@prisma/client';

@ApiTags('reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(
    private reservations: ReservationsService,
    private telegram: TelegramService,
  ) {}

  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.reservations.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'status', required: false, enum: ReservationStatus })
  findAll(@Query('status') status?: ReservationStatus) {
    return this.reservations.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservations.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    const updated = await this.reservations.updateStatus(id, dto);
    if (
      (dto.status === ReservationStatus.CONFIRMED || dto.status === ReservationStatus.CANCELLED) &&
      updated.customer?.telegramId
    ) {
      this.telegram
        .notifyReservationStatus(
          updated.customer.telegramId,
          { date: updated.date, peopleCount: updated.peopleCount },
          dto.status,
        )
        .catch(() => {});
    }
    return updated;
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservations.remove(id);
  }
}
