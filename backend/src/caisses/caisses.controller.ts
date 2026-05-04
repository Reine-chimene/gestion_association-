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
import { CaissesService } from './caisses.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CrediterCaisseDto } from './dto/crediter-caisse.dto.js';
import { DebiterCaisseDto } from './dto/debiter-caisse.dto.js';
import { DechargeCaisseDto } from './dto/decharge-caisse.dto.js';
import { VersementBancaireDto } from './dto/versement-bancaire.dto.js';

@Controller('caisses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CaissesController {
  constructor(private readonly caissesService: CaissesService) {}

  /**
   * Obtenir toutes les caisses
   */
  @Get()
  @Roles('PRESIDENT', 'TRESORIER')
  async getAllCaisses(@Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.caissesService.getAllCaisses(tenantId);
  }

  /**
   * Créditer une caisse
   */
  @Post(':type/crediter')
  @Roles('PRESIDENT', 'TRESORIER')
  async crediter(
    @Param('type') type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    @Body() dto: CrediterCaisseDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.caissesService.crediter(
      tenantId,
      type,
      dto.montant,
      dto.motif,
      responsableId,
      dto.reference,
    );
  }

  /**
   * Débiter une caisse
   */
  @Post(':type/debiter')
  @Roles('PRESIDENT', 'TRESORIER')
  async debiter(
    @Param('type') type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    @Body() dto: DebiterCaisseDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.caissesService.debiter(
      tenantId,
      type,
      dto.montant,
      dto.motif,
      responsableId,
      dto.reference,
    );
  }

  /**
   * Décharge (sortie avec justification obligatoire)
   */
  @Post(':type/decharge')
  @Roles('PRESIDENT', 'TRESORIER')
  async decharge(
    @Param('type') type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    @Body() dto: DechargeCaisseDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.caissesService.decharge(
      tenantId,
      type,
      dto.montant,
      dto.motif,
      dto.justification,
      responsableId,
    );
  }

  /**
   * Versement bancaire (entrée avec référence obligatoire)
   */
  @Post(':type/versement-bancaire')
  @Roles('PRESIDENT', 'TRESORIER')
  async versementBancaire(
    @Param('type') type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    @Body() dto: VersementBancaireDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.caissesService.versementBancaire(
      tenantId,
      type,
      dto.montant,
      dto.motif,
      dto.reference,
      responsableId,
    );
  }

  /**
   * Obtenir le solde d'une caisse
   */
  @Get(':type/solde')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async getSolde(
    @Param('type') type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    return this.caissesService.getSolde(tenantId, type);
  }

  /**
   * Obtenir l'historique des mouvements d'une caisse
   */
  @Get(':type/historique')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'COMMISSAIRE')
  async getHistorique(
    @Param('type') type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Request() req?: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.caissesService.getHistorique(
      tenantId,
      type,
      dateDebut ? new Date(dateDebut) : undefined,
      dateFin ? new Date(dateFin) : undefined,
      limit,
      offset,
    );
  }

  /**
   * Vérifier la cohérence d'une caisse
   */
  @Get(':type/verifier-coherence')
  @Roles('PRESIDENT', 'TRESORIER', 'COMMISSAIRE')
  async verifierCoherence(
    @Param('type') type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    return this.caissesService.verifierCoherence(tenantId, type);
  }
}
