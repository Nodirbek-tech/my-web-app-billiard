"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async createCategory(dto) {
        return this.prisma.category.create({ data: dto });
    }
    async updateCategory(id, dto) {
        return this.prisma.category.update({ where: { id }, data: dto });
    }
    async findAllProducts() {
        return this.prisma.product.findMany({
            where: { active: true },
            include: { category: true },
            orderBy: { name: 'asc' },
        });
    }
    async findProductById(id) {
        const p = await this.prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!p)
            throw new common_1.NotFoundException('Product not found');
        return p;
    }
    async createProduct(dto) {
        return this.prisma.product.create({
            data: dto,
            include: { category: true },
        });
    }
    async updateProduct(id, dto) {
        await this.findProductById(id);
        return this.prisma.product.update({
            where: { id },
            data: dto,
            include: { category: true },
        });
    }
    async removeProduct(id) {
        await this.findProductById(id);
        return this.prisma.product.update({
            where: { id },
            data: { active: false },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map