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
import { TontinesService } from './tontines.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateTontineDto } from './dto/create-tontine.dto.js';
import { CollecterCotisationsDto } from './dto/collecter-cotisations.dto.js';
import { DistribuerCagnotteDto } from './dto/distribuer-cagnotte.dto.js';
import { VendreTourDto } from './dto/vendre-tour.dto.js';
import { VendreInteretsDto } from './dto/vendre-interets.dto.js';

@Controller('tontines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TontinesController {
  constructor(private readonly tontinesService: TontinesService) {}

  /**
   * Créer une nouvelle tontine
   */
  @Post()
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async create(@Body() dto: CreateTontineDto, @Request() req: any) {
    const tenantId = req.user.tenantId;

    return this.tontinesService.create(tenantId, {
      nom: dto.nom,
      type: dto.type,
      montantCotisation: dto.montantCotisation,
      frequence: dto.frequence,
      dateDebut: new Date(dto.dateDebut),
      participants: dto.participants,
    });
  }

  /**
   * Obtenir toutes les tontines
   */
  @Get()
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async findAll(
    @Query('statut') statut?: string,
    @Query('type') type?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Request() req?: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.tontinesService.findAll(tenantId, {
      statut,
      type,
      limit,
      offset,
    });
  }

  /**
   * Collecter les cotisations
   */
  @Post(':id/collecter-cotisations')
  @Roles('PRESIDENT', 'TRESORIER')
  async collecterCotisations(
    @Param('id') id: string,
    @Body() dto: CollecterCotisationsDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.tontinesService.collecterCotisations(
      tenantId,
      id,
      responsableId,
      dto.cotisations,
    );
  }

  /**
   * Distribuer la cagnotte
   */
  @Post(':id/distribuer-cagnotte')
  @Roles('PRESIDENT', 'TRESORIER')
  async distribuerCagnotte(
    @Param('id') id: string,
    @Body() dto: DistribuerCagnotteDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const responsableId = req.user.userId;

    return this.tontinesService.distribuerCagnotte(tenantId, id, responsableId, {
      prets: dto.retenuesPrets,
      sanctions: dto.retenuesSanctions,
      complementFonds: dto.retenuesComplementFonds,
    });
  }

  /**
   * Vendre un tour
   */
  @Post(':id/vendre-tour')
  @Roles('PRESIDENT', 'TRESORIER')
  async sellTour(
    @Param('id') id: string,
    @Body() dto: VendreTourDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.tontinesService.sellTour(tenantId, id, {
      acheteurId: dto.acheteurId,
      tourOriginal: dto.tourOriginal,
      montantOffre: dto.montantOffre,
    });
  }

  /**
   * Vendre des intérêts
   */
  @Post(':id/vendre-interets')
  @Roles('PRESIDENT', 'TRESORIER')
  async sellInterets(
    @Param('id') id: string,
    @Body() dto: VendreInteretsDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.tontinesService.sellInterets(tenantId, id, {
      vendeurId: dto.vendeurId,
      acheteurId: dto.acheteurId,
      montantInterets: dto.montantInterets,
      montantOffre: dto.montantOffre,
      modalite: dto.modalite,
    });
  }

  /**
   * Attribuer tour gratuit
   */
  @Post(':id/attribuer-tour-gratuit/:beneficiaireId')
  @Roles('PRESIDENT', 'TRESORIER')
  async attribuerTourGratuit(
    @Param('id') id: string,
    @Param('beneficiaireId') beneficiaireId: string,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    return this.tontinesService.attribuerTourGratuit(tenantId, id, beneficiaireId);
  }

  /**
   * Lister les ventes de tours (DOIT ÊTRE AVANT @Get(':id'))
   */
  @Get(':id/ventes-tours')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async getVentesTour(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    const tontine = await this.tontinesService.findOne(tenantId, id);
    return tontine.ventesTours || [];
  }

  /**
   * Lister les tours gratuits (DOIT ÊTRE AVANT @Get(':id'))
   */
  @Get(':id/tours-gratuits')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async getToursGratuits(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    const tontine = await this.tontinesService.findOne(tenantId, id);
    return tontine.toursGratuits || [];
  }

  /**
   * Obtenir le bénéficiaire actuel (DOIT ÊTRE AVANT @Get(':id'))
   */
  @Get(':id/beneficiaire-actuel')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async getBeneficiaireActuel(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.tontinesService.getBeneficiaireActuel(tenantId, id);
  }

  /**
   * Vérifier tour gratuit (DOIT ÊTRE AVANT @Get(':id'))
   */
  @Get(':id/verifier-tour-gratuit/:membreId')
  @Roles('PRESIDENT', 'TRESORIER')
  async verifierTourGratuit(
    @Param('id') id: string,
    @Param('membreId') membreId: string,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    return this.tontinesService.verifierTourGratuit(tenantId, id, membreId);
  }

  /**
   * Obtenir une tontine par ID (GÉNÉRAL - DOIT ÊTRE EN DERNIER)
   */
  @Get(':id')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.tontinesService.findOne(tenantId, id);
  }
}
