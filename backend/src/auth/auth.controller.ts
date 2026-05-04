import { Body, Controller, Post, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { AssignRoleDto } from './dto/assign-role.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  // Gestion des rôles (réservé au président)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PRESIDENT')
  @Patch('users/:userId/role')
  async assignRole(
    @Request() req: any,
    @Param('userId') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.authService.assignRole(
      req.user.sub,
      userId,
      assignRoleDto.role,
      assignRoleDto.motif,
    );
  }

  // Liste des utilisateurs du tenant (réservé au président)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PRESIDENT')
  @Get('users')
  async getUsersByTenant(@Request() req: any) {
    return this.authService.getUsersByTenant(req.user.tenantId);
  }
}
