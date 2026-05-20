import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiProperty } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { IsNumber, Min, Max, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateSettingsDto {
  @ApiProperty({ required: false, example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  cashbackPercent?: number;

  @ApiProperty({ required: false, example: 40000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dayHourlyPrice?: number;

  @ApiProperty({ required: false, example: 50000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  nightHourlyPrice?: number;

  @ApiProperty({ required: false, example: '06:00' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  dayStartTime?: string;

  @ApiProperty({ required: false, example: '18:00' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  nightStartTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get()
  get() {
    return this.settings.get();
  }

  @Patch()
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}
