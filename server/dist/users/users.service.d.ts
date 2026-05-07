import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
    }>;
    remove(id: number): Promise<{
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
