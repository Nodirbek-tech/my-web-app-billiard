import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tables')
export class TablesController {
  constructor(private tables: TablesService) {}

  @Get()
  findAll() {
    return this.tables.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tables.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTableDto) {
    return this.tables.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateTableDto>) {
    return this.tables.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tables.remove(id);
  }
}
