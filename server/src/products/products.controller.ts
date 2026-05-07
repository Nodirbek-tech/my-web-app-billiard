import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get('categories')
  getCategories() {
    return this.products.findAllCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.products.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCategoryDto>) {
    return this.products.updateCategory(id, dto);
  }

  @Get()
  findAll() {
    return this.products.findAllProducts();
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.createProduct(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateProductDto>) {
    return this.products.updateProduct(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.products.removeProduct(id);
  }
}
