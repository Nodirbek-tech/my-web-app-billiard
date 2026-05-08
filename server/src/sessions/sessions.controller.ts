import { Controller, Post, Patch, Get, Param, ParseIntPipe, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { StopAndPayDto } from './dto/stop-and-pay.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class AttachCustomerDto {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  customerId?: number | null;
}

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private sessions: SessionsService) {}

  @Post('start/:tableId')
  start(@Param('tableId', ParseIntPipe) tableId: number) {
    return this.sessions.startSession(tableId);
  }

  @Post(':id/next-round')
  nextRound(@Param('id', ParseIntPipe) id: number) {
    return this.sessions.nextRound(id);
  }

  // Atomic: stops session + processes payment in one transaction
  @Post(':id/stop-and-pay')
  stopAndPay(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StopAndPayDto,
    @CurrentUser() user: any,
  ) {
    if (!dto.cashierName) dto.cashierName = user?.name ?? 'Staff';
    return this.sessions.stopAndPay(id, dto);
  }

  @Patch(':id/customer')
  attachCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AttachCustomerDto,
  ) {
    return this.sessions.attachCustomer(id, dto.customerId ?? null);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessions.getSession(id);
  }

  @Get('table/:tableId/active')
  getActive(@Param('tableId', ParseIntPipe) tableId: number) {
    return this.sessions.getActiveByTable(tableId);
  }
}
