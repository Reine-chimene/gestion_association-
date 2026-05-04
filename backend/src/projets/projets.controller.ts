import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjetsService } from './projets.service.js';
import { CreateProjetDto } from './dto/create-projet.dto.js';
import { ContribuerProjetDto } from './dto/contribuer-projet.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('projets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjetsController {
  constructor(private readonly projetsService: ProjetsService) {}

  /**
   * Créer un nouveau projet
   * Accessible par: PRESIDENT, TRESORIER, SECRETAIRE
   */
  @Post()
  @Roles(Role.PRESIDENT, Role.TRESORIER, Role.SECRETAIRE)
  create(@Request() req: any, @Body() createProjetDto: CreateProjetDto) {
    const tenantId = req.user.tenantId;
    return this.projetsService.create(tenantId, createProjetDto);
  }

  /**
   * Obtenir tous les projets
   * Accessible par: Tous les rôles
   */
  @Get()
  findAll(@Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.projetsService.findAll(tenantId);
  }

  /**
   * Obtenir les statistiques globales (DOIT ÊTRE AVANT @Get(':id'))
   * Accessible par: PRESIDENT, TRESORIER, SECRETAIRE
   */
  @Get('statistiques/global')
  @Roles(Role.PRESIDENT, Role.TRESORIER, Role.SECRETAIRE)
  getStatistiques(@Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.projetsService.getStatistiques(tenantId);
  }

  /**
   * Obtenir l'avancement d'un projet (DOIT ÊTRE AVANT @Get(':id'))
   * Accessible par: Tous les rôles
   */
  @Get(':id/avancement')
  getAvancement(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.projetsService.getAvancement(tenantId, id);
  }

  /**
   * Obtenir un projet par ID (GÉNÉRAL - DOIT ÊTRE EN DERNIER)
   * Accessible par: Tous les rôles
   */
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.projetsService.findOne(tenantId, id);
  }

  /**
   * Enregistrer une contribution
   * Accessible par: PRESIDENT, TRESORIER, SECRETAIRE
   */
  @Post(':id/contribuer')
  @Roles(Role.PRESIDENT, Role.TRESORIER, Role.SECRETAIRE)
  contribuer(
    @Request() req: any,
    @Param('id') id: string,
    @Body() contribuerDto: ContribuerProjetDto,
  ) {
    const tenantId = req.user.tenantId;
    return this.projetsService.contribuer(tenantId, id, contribuerDto);
  }
}
