import { IsString, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTableDto {
  @ApiProperty({ example: 'Table Alpha' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  number: number;

  @ApiProperty({ example: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hourlyPrice: number;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  nightPrice?: number;
}
