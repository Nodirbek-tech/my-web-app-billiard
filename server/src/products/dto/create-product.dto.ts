import { IsString, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  categoryId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;
}
