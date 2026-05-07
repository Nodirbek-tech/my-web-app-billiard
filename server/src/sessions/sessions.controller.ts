import { Controller, Post, Get, Param, ParseIntPipe, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { StopAndPayDto } from './dto/stop-and-pay.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessions.getSession(id);
  }

  @Get('table/:tableId/active')
  getActive(@Param('tableId', ParseIntPipe) tableId: number) {
    return this.sessions.getActiveByTable(tableId);
  }
}
