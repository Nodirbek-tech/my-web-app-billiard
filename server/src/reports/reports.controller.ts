import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('today')
  today() {
    return this.reports.getTodayStats();
  }

  @Get('sessions')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  sessions(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.reports.getSessionHistory(+page, +limit);
  }
}
