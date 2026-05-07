import { Controller, Post, Delete, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  add(@Body() dto: CreateOrderDto) {
    return this.orders.addOrder(dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orders.removeOrder(id);
  }

  @Get('session/:sessionId')
  getBySession(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.orders.getSessionOrders(sessionId);
  }
}
