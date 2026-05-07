import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
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
