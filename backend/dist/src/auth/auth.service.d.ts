import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
    private generateTokens;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    assignRole(presidentId: string, userId: string, newRole: string, motif?: string): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        message: string;
    }>;
    getUsersByTenant(tenantId: string): Promise<{
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
