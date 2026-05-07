import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllCategories(): Promise<({
        products: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            categoryId: number;
            stock: number | null;
            active: boolean;
        }[];
    } & {
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
    })[]>;
    createCategory(dto: CreateCategoryDto): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
    }>;
    updateCategory(id: number, dto: Partial<CreateCategoryDto>): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
    }>;
    findAllProducts(): Promise<({
        category: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
        };
    } & {
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        categoryId: number;
        stock: number | null;
        active: boolean;
    })[]>;
    findProductById(id: number): Promise<{
        category: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
        };
    } & {
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        categoryId: number;
        stock: number | null;
        active: boolean;
    }>;
    createProduct(dto: CreateProductDto): Promise<{
        category: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
        };
    } & {
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        categoryId: number;
        stock: number | null;
        active: boolean;
    }>;
    updateProduct(id: number, dto: Partial<CreateProductDto>): Promise<{
        category: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
        };
    } & {
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        categoryId: number;
        stock: number | null;
        active: boolean;
    }>;
    removeProduct(id: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        categoryId: number;
        stock: number | null;
        active: boolean;
    }>;
}
