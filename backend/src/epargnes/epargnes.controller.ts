import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EpargnesService } from './epargnes.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CotiserDto } from './dto/cotiser.dto.js';
import { RedistribuerDto } from './dto/redistribuer.dto.js';
import { TypeEpargne } from '@prisma/client';

@Controller('epargnes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EpargnesController {
  constructor(private readonly epargnesService: EpargnesService) {}

  /**
   * Enregistrer une cotisation d'épargne
   */
  @Post('cotiser')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async cotiser(@Body() dto: CotiserDto, @Request() req: any) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.epargnesService.cotiser(tenantId, responsableId, dto);
  }

  /**
   * Obtenir le solde d'épargne d'un membre
   */
  @Get('solde/:membreId')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE')
  async getSolde(
    @Param('membreId') membreId: string,
    @Query('type') type: TypeEpargne,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.epargnesService.calculerSolde(tenantId, membreId, type);
  }

  /**
   * Redistribuer l'épargne avec intérêts
   */
  @Post('redistribuer')
  @Roles('PRESIDENT', 'TRESORIER')
  async redistribuer(@Body() dto: RedistribuerDto, @Request() req: any) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.epargnesService.redistribuer(tenantId, responsableId, dto);
  }

  /**
   * Calculer les intérêts générés
   */
  @Get('interets-generes')
  @Roles('PRESIDENT', 'TRESORIER')
  async getInteretsGeneres(
    @Query('type') type: TypeEpargne,
    @Query('tauxInteret') tauxInteret: string,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const taux = parseFloat(tauxInteret) || 0;

    return this.epargnesService.calculerInteretsGeneres(tenantId, type, taux);
  }

  /**
   * Obtenir toutes les épargnes
   */
  @Get()
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async findAll(@Query('type') type: TypeEpargne, @Request() req: any) {
    const tenantId = req.user.tenantId;

    return this.epargnesService.findAll(tenantId, type);
  }

  /**
   * Obtenir une épargne par ID
   */
  @Get(':id')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;

    return this.epargnesService.findOne(tenantId, id);
  }

  /**
   * Obtenir les statistiques des épargnes
   */
  @Get('statistiques/global')
  @Roles('PRESIDENT', 'TRESORIER')
  async getStatistiques(@Request() req: any) {
    const tenantId = req.user.tenantId;

    return this.epargnesService.getStatistiques(tenantId);
  }
}
