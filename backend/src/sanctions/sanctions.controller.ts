import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SanctionsService } from './sanctions.service.js';
import { CreateTypeSanctionDto } from './dto/create-type-sanction.dto.js';
import { UpdateTypeSanctionDto } from './dto/update-type-sanction.dto.js';
import { AppliquerSanctionDto } from './dto/appliquer-sanction.dto.js';
import { AnnulerSanctionDto } from './dto/annuler-sanction.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('sanctions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SanctionsController {
  constructor(private readonly sanctionsService: SanctionsService) {}

  // ============================================
  // GESTION DES TYPES DE SANCTIONS
  // ============================================

  /**
   * Créer un nouveau type de sanction
   * Accessible par: PRESIDENT
   */
  @Post('types')
  @Roles(Role.PRESIDENT)
  createTypeSanction(
    @Request() req: any,
    @Body() createTypeSanctionDto: CreateTypeSanctionDto,
  ) {
    return this.sanctionsService.createTypeSanction(req.user.tenantId, createTypeSanctionDto);
  }

  /**
   * Récupérer tous les types de sanctions
   * Accessible par: Tous les rôles
   */
  @Get('types')
  findAllTypesSanctions(@Request() req: any) {
    return this.sanctionsService.findAllTypesSanctions(req.user.tenantId);
  }

  /**
   * Récupérer un type de sanction par ID
   * Accessible par: Tous les rôles
   */
  @Get('types/:id')
  findOneTypeSanction(@Request() req: any, @Param('id') id: string) {
    return this.sanctionsService.findOneTypeSanction(req.user.tenantId, id);
  }

  /**
   * Mettre à jour un type de sanction
   * Accessible par: PRESIDENT
   */
  @Patch('types/:id')
  @Roles(Role.PRESIDENT)
  updateTypeSanction(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateTypeSanctionDto: UpdateTypeSanctionDto,
  ) {
    return this.sanctionsService.updateTypeSanction(
      req.user.tenantId,
      id,
      updateTypeSanctionDto,
    );
  }

  /**
   * Supprimer un type de sanction
   * Accessible par: PRESIDENT
   */
  @Delete('types/:id')
  @Roles(Role.PRESIDENT)
  removeTypeSanction(@Request() req: any, @Param('id') id: string) {
    return this.sanctionsService.removeTypeSanction(req.user.tenantId, id);
  }

  // ============================================
  // GESTION DES SANCTIONS
  // ============================================

  /**
   * Appliquer une sanction à un membre
   * Accessible par: PRESIDENT, SECRETAIRE
   */
  @Post()
  @Roles(Role.PRESIDENT, Role.SECRETAIRE)
  appliquerSanction(@Request() req: any, @Body() appliquerSanctionDto: AppliquerSanctionDto) {
    return this.sanctionsService.appliquerSanction(req.user.tenantId, appliquerSanctionDto);
  }

  /**
   * Récupérer toutes les sanctions
   * Accessible par: Tous les rôles
   * Query params: membreId, statut
   */
  @Get()
  findAllSanctions(
    @Request() req: any,
    @Query('membreId') membreId?: string,
    @Query('statut') statut?: string,
  ) {
    return this.sanctionsService.findAllSanctions(req.user.tenantId, membreId, statut);
  }

  /**
   * Récupérer une sanction par ID
   * Accessible par: Tous les rôles
   */
  @Get(':id')
  findOneSanction(@Request() req: any, @Param('id') id: string) {
    return this.sanctionsService.findOneSanction(req.user.tenantId, id);
  }

  /**
   * Annuler une sanction
   * Accessible par: PRESIDENT
   */
  @Post(':id/annuler')
  @Roles(Role.PRESIDENT)
  annulerSanction(
    @Request() req: any,
    @Param('id') id: string,
    @Body() annulerSanctionDto: AnnulerSanctionDto,
  ) {
    return this.sanctionsService.annulerSanction(req.user.tenantId, id, annulerSanctionDto);
  }

  /**
   * Marquer une sanction comme payée
   * Accessible par: PRESIDENT, TRESORIER
   */
  @Post(':id/payer')
  @Roles(Role.PRESIDENT, Role.TRESORIER)
  marquerPayee(@Request() req: any, @Param('id') id: string) {
    return this.sanctionsService.marquerPayee(req.user.tenantId, id);
  }

  /**
   * Récupérer les sanctions d'un membre
   * Accessible par: Tous les rôles
   */
  @Get('membre/:membreId')
  getSanctionsByMembre(@Request() req: any, @Param('membreId') membreId: string) {
    return this.sanctionsService.getSanctionsByMembre(req.user.tenantId, membreId);
  }

  /**
   * Calculer le total des sanctions impayées d'un membre
   * Accessible par: Tous les rôles
   */
  @Get('membre/:membreId/total-impayees')
  getTotalSanctionsImpayees(@Request() req: any, @Param('membreId') membreId: string) {
    return this.sanctionsService.getTotalSanctionsImpayees(req.user.tenantId, membreId);
  }
}
