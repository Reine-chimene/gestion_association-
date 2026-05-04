import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ComplementFondsService } from './complement-fonds.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateComplementFondsDto } from './dto/create-complement-fonds.dto.js';
import { EnregistrerPaiementDto } from './dto/enregistrer-paiement.dto.js';
import { UpdateStatutDto } from './dto/update-statut.dto.js';

@Controller('complement-fonds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplementFondsController {
  constructor(private readonly complementFondsService: ComplementFondsService) {}

  /**
   * Calculer le complément fonds annuel
   */
  @Post('calculer')
  @Roles('PRESIDENT', 'TRESORIER')
  async calculerComplementAnnuel(
    @Body() dto: CreateComplementFondsDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.complementFondsService.calculerComplementAnnuel(
      tenantId,
      dto.annee,
      dto.montantTotal,
    );
  }

  /**
   * Obtenir tous les compléments fonds
   */
  @Get()
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async findAll(
    @Query('annee', new DefaultValuePipe(0), ParseIntPipe) annee?: number,
    @Query('statut') statut?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Request() req?: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.complementFondsService.findAll(tenantId, {
      annee: annee && annee > 0 ? annee : undefined,
      statut,
      limit,
      offset,
    });
  }

  /**
   * Obtenir le suivi des paiements (DOIT ÊTRE AVANT @Get(':id'))
   */
  @Get(':id/suivi-paiements')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async getSuiviPaiements(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.complementFondsService.getSuiviPaiements(tenantId, id);
  }

  /**
   * Obtenir un complément fonds par ID (GÉNÉRAL - DOIT ÊTRE EN DERNIER)
   */
  @Get(':id')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.complementFondsService.findOne(tenantId, id);
  }

  /**
   * Enregistrer un paiement
   */
  @Post(':id/paiements')
  @Roles('PRESIDENT', 'TRESORIER')
  async enregistrerPaiement(
    @Param('id') id: string,
    @Body() dto: EnregistrerPaiementDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.complementFondsService.enregistrerPaiement(
      tenantId,
      id,
      responsableId,
      {
        membreId: dto.membreId,
        montant: dto.montant,
        modePaiement: dto.modePaiement,
      },
    );
  }

  /**
   * Augmenter le complément fonds
   */
  @Put(':id/augmenter')
  @Roles('PRESIDENT', 'TRESORIER')
  async augmenter(
    @Param('id') id: string,
    @Body('nouveauMontantTotal') nouveauMontantTotal: number,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.complementFondsService.augmenter(tenantId, id, nouveauMontantTotal);
  }

  /**
   * Casser le complément fonds
   */
  @Put(':id/casser')
  @Roles('PRESIDENT', 'TRESORIER')
  async casser(
    @Param('id') id: string,
    @Body('motif') motif: string,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.complementFondsService.casser(tenantId, id, responsableId, motif);
  }
}
