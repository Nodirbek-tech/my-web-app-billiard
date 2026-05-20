import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('payments')
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
