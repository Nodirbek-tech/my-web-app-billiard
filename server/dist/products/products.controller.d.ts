import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class ProductsController {
    private products;
    constructor(products: ProductsService);
    getCategories(): Promise<({
        products: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            price: number;
            categoryId: number;
            stock: number | null;
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
    findAll(): Promise<({
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
        active: boolean;
        price: number;
        categoryId: number;
        stock: number | null;
    })[]>;
    create(dto: CreateProductDto): Promise<{
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
        active: boolean;
        price: number;
        categoryId: number;
        stock: number | null;
    }>;
    update(id: number, dto: Partial<CreateProductDto>): Promise<{
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
        active: boolean;
        price: number;
        categoryId: number;
        stock: number | null;
    }>;
    remove(id: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        price: number;
        categoryId: number;
        stock: number | null;
    }>;
}
