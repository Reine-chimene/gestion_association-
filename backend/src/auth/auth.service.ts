import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, tenantId, role, associationNom, associationSlug, associationDevise, associationLangue } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    // Vérifier si le tenant existe, sinon le créer
    let tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      // Si le tenant n'existe pas, on le crée avec les infos de l'association
      const nom = associationNom || `Association ${tenantId}`;
      const slug = associationSlug || tenantId.toLowerCase().replace(/\s+/g, '-');
      const devise = associationDevise || 'FCFA';
      const langue = associationLangue || 'fr';

      tenant = await this.prisma.tenant.create({
        data: {
          id: tenantId,
          nom,
          slug,
          devise,
          langue,
        },
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        tenantId: tenant.id,
        role,
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, tenantId } = loginDto;

    // Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Vérifier le verrouillage du compte
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is locked. Try again later.');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Incrémenter les tentatives échouées
      const failedAttempts = user.failedAttempts + 1;
      const updateData: any = { failedAttempts };

      // Verrouiller après 5 tentatives
      if (failedAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Réinitialiser les tentatives échouées
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Générer les tokens
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

  private async generateTokens(user: any) {
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

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Gestion des rôles par le président
  async assignRole(presidentId: string, userId: string, newRole: string, motif?: string) {
    // Vérifier que l'utilisateur qui assigne est bien président
    const president = await this.prisma.user.findUnique({
      where: { id: presidentId },
    });

    if (!president || president.role !== 'PRESIDENT') {
      throw new UnauthorizedException('Only president can assign roles');
    }

    // Récupérer l'utilisateur cible
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new UnauthorizedException('User not found');
    }

    // Vérifier que les deux utilisateurs sont du même tenant
    if (president.tenantId !== targetUser.tenantId) {
      throw new UnauthorizedException('Cannot assign role to user from different tenant');
    }

    // Enregistrer l'ancien rôle pour l'audit
    const oldRole = targetUser.role;

    // Mettre à jour le rôle
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
    });

    // Enregistrer dans l'audit log
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

  async getUsersByTenant(tenantId: string) {
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
}
