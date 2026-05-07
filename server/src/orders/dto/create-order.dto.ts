import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  sessionId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
}
