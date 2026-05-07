import { IsNumber, IsPositive, IsIn, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  sessionId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ enum: ['CASH', 'CARD'] })
  @IsIn(['CASH', 'CARD'])
  method: 'CASH' | 'CARD';
}
