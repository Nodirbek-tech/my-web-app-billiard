import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe, Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { TelegramService } from '../telegram/telegram.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(
    private promotions: PromotionsService,
    private telegram: TelegramService,
  ) {}

  @Post()
  async create(@Body() dto: CreatePromotionDto) {
    const promotion = await this.promotions.create(dto);
    if (promotion.active) {
      this.telegram
        .sendPromotionBroadcast(promotion.id, promotion.title, promotion.message)
        .catch(() => {});
    }
    return promotion;
  }

  @Get()
  findAll(@Query('active') active?: string) {
    return this.promotions.findAll(active === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promotions.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePromotionDto) {
    return this.promotions.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promotions.remove(id);
  }

  @Post(':id/broadcast')
  async broadcast(@Param('id', ParseIntPipe) id: number) {
    const promotion = await this.promotions.findOne(id);
    const sent = await this.telegram.sendPromotionBroadcast(promotion.id, promotion.title, promotion.message);
    return { sent };
  }
}
