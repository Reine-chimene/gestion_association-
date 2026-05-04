import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { AssignRoleDto } from './dto/assign-role.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            tenantId: string;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    assignRole(req: any, userId: string, assignRoleDto: AssignRoleDto): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        message: string;
    }>;
    getUsersByTenant(req: any): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        lastLogin: Date | null;
        membre: {
            nom: string;
            prenom: string;
            telephone: string;
        } | null;
    }[]>;
}
