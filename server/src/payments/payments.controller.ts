import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.payments.createPayment(dto);
  }

  @Get('session/:sessionId')
  getBySession(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.payments.getPaymentBySession(sessionId);
  }

  @Get('receipt/:sessionId')
  getReceipt(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.payments.getReceiptData(sessionId);
  }
}
