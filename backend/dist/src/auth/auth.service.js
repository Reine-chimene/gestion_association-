"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { email, password, tenantId, role } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { tenantId_email: { tenantId, email } },
        });
        if (existingUser) {
            throw new common_1.UnauthorizedException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                tenantId,
                role,
            },
        });
        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }
    async login(loginDto) {
        const { email, password, tenantId } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { tenantId_email: { tenantId, email } },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new common_1.UnauthorizedException('Account is locked. Try again later.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const failedAttempts = user.failedAttempts + 1;
            const updateData = { failedAttempts };
            if (failedAttempts >= 5) {
                updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
            }
            await this.prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failedAttempts: 0,
                lockedUntil: null,
                lastLogin: new Date(),
            },
        });
        const tokens = await this.generateTokens(user);
        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            },
            ...tokens,
        };
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
            expiresIn: '7d',
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            return this.generateTokens(user);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async assignRole(presidentId, userId, newRole, motif) {
        const president = await this.prisma.user.findUnique({
            where: { id: presidentId },
        });
        if (!president || president.role !== 'PRESIDENT') {
            throw new common_1.UnauthorizedException('Only president can assign roles');
        }
        const targetUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!targetUser) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (president.tenantId !== targetUser.tenantId) {
            throw new common_1.UnauthorizedException('Cannot assign role to user from different tenant');
        }
        const oldRole = targetUser.role;
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId: president.tenantId,
                userId: presidentId,
                entityType: 'USER',
                entityId: userId,
                action: 'ASSIGN_ROLE',
                oldValue: oldRole,
                newValue: newRole,
            },
        });
        return {
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            message: `Role updated from ${oldRole} to ${newRole}`,
        };
    }
    async getUsersByTenant(tenantId) {
        return this.prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                lastLogin: true,
                membre: {
                    select: {
                        nom: true,
                        prenom: true,
                        telephone: true,
                    },
                },
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map