import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PretsService } from './prets.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreatePretDto } from './dto/create-pret.dto.js';
import { EnregistrerPaiementDto } from './dto/enregistrer-paiement.dto.js';
import { ReconduirePretDto } from './dto/reconduire-pret.dto.js';

@Controller('prets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PretsController {
  constructor(private readonly pretsService: PretsService) {}

  /**
   * Créer un nouveau prêt
   */
  @Post()
  @Roles('PRESIDENT', 'TRESORIER')
  async create(@Body() dto: CreatePretDto, @Request() req: any) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.pretsService.create(tenantId, responsableId, dto);
  }

  /**
   * Obtenir tous les prêts
   */
  @Get()
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async findAll(
    @Query('statut') statut?: string,
    @Query('type') type?: string,
    @Query('emprunteurId') emprunteurId?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Request() req?: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.pretsService.findAll(tenantId, {
      statut,
      type,
      emprunteurId,
      limit,
      offset,
    });
  }

  /**
   * Obtenir un prêt par ID
   */
  @Get(':id')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.pretsService.findOne(tenantId, id);
  }

  /**
   * Enregistrer un paiement
   */
  @Post(':id/paiement')
  @Roles('PRESIDENT', 'TRESORIER')
  async enregistrerPaiement(
    @Param('id') id: string,
    @Body() dto: EnregistrerPaiementDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.pretsService.enregistrerPaiement(tenantId, id, responsableId, dto);
  }

  /**
   * Reconduire un prêt
   */
  @Post(':id/reconduire')
  @Roles('PRESIDENT', 'TRESORIER')
  async reconduire(
    @Param('id') id: string,
    @Body() dto: ReconduirePretDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.pretsService.reconduire(tenantId, id, dto);
  }

  /**
   * Déclencher le recouvrement forcé
   */
  @Post(':id/recouvrement-force')
  @Roles('PRESIDENT', 'TRESORIER')
  async declencherRecouvrementForce(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.pretsService.declencherRecouvrementForce(tenantId, id, responsableId);
  }

  /**
   * Obtenir l'échéancier d'un prêt
   */
  @Get(':id/echeancier')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE')
  async getEcheancier(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.pretsService.getEcheancier(tenantId, id);
  }

  /**
   * Obtenir le solde restant d'un prêt
   */
  @Get(':id/solde-restant')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE')
  async getSoldeRestant(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.pretsService.getSoldeRestant(tenantId, id);
  }

  /**
   * Obtenir les statistiques des prêts
   */
  @Get('statistiques/global')
  @Roles('PRESIDENT', 'TRESORIER')
  async getStatistiques(@Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.pretsService.getStatistiques(tenantId);
  }
}
