import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAllCategories() {
    return this.prisma.category.findMany({
      where: { active: true },
      include: {
        products: {
          where: { active: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async updateCategory(id: number, dto: Partial<CreateCategoryDto>) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async findAllProducts() {
    return this.prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async findProductById(id: number) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: dto,
      include: { category: true },
    });
  }

  async updateProduct(id: number, dto: Partial<CreateProductDto>) {
    await this.findProductById(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async removeProduct(id: number) {
    await this.findProductById(id);
    return this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }
}
