import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: number;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    me(user: any): any;
}
