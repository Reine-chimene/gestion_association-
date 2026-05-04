import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MembresService } from './membres.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateMembreDto } from './dto/create-membre.dto.js';
import { UpdateMembreDto } from './dto/update-membre.dto.js';
import { ChangeStatusDto } from './dto/change-status.dto.js';

@Controller('membres')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembresController {
  constructor(private readonly membresService: MembresService) {}

  /**
   * Créer un nouveau membre
   */
  @Post()
  @Roles('PRESIDENT', 'SECRETAIRE')
  async create(@Body() dto: CreateMembreDto, @Request() req: any) {
    const tenantId = req.user.tenantId;

    return this.membresService.create(tenantId, {
      nom: dto.nom,
      prenom: dto.prenom,
      telephone: dto.telephone,
      email: dto.email,
      dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
      adresse: dto.adresse,
      situationMatrimoniale: dto.situationMatrimoniale,
      nombreEnfants: dto.nombreEnfants,
      parrainId: dto.parrainId,
      userId: dto.userId,
    });
  }

  /**
   * Obtenir le profil du membre connecté
   */
  @Get('me/profil')
  async getMyProfile(@Request() req: any) {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    
    // Trouver le membre associé à cet utilisateur
    const membre = await this.membresService.findByUserId(tenantId, userId);
    return membre;
  }

  /**
   * Obtenir tous les membres avec pagination et filtres
   */
  @Get()
  @Roles('PRESIDENT', 'SECRETAIRE', 'TRESORIER', 'COMMISSAIRE')
  async findAll(
    @Query('statut') statut?: string,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Request() req?: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.membresService.findAll(tenantId, {
      statut,
      search,
      limit,
      offset,
    });
  }

  /**
   * Obtenir les statistiques des membres
   */
  @Get('statistiques')
  @Roles('PRESIDENT', 'SECRETAIRE', 'TRESORIER')
  async getStatistiques(@Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.membresService.getStatistiques(tenantId);
  }

  /**
   * Obtenir la situation nette d'un membre (DOIT ÊTRE AVANT @Get(':id'))
   */
  @Get(':id/situation-nette')
  @Roles('PRESIDENT', 'TRESORIER', 'COMMISSAIRE', 'MEMBRE')
  async getSituationNette(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.membresService.getSituationNette(tenantId, id);
  }

  /**
   * Changer le statut d'un membre (DOIT ÊTRE AVANT @Get(':id'))
   */
  @Patch(':id/status')
  @Roles('PRESIDENT')
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.membresService.changeStatus(
      tenantId,
      id,
      dto.statut,
      dto.motif,
    );
  }

  /**
   * Obtenir un membre par ID (GÉNÉRAL - DOIT ÊTRE EN DERNIER)
   */
  @Get(':id')
  @Roles('PRESIDENT', 'SECRETAIRE', 'TRESORIER', 'COMMISSAIRE', 'MEMBRE')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.membresService.findOne(tenantId, id);
  }

  /**
   * Mettre à jour un membre
   */
  @Patch(':id')
  @Roles('PRESIDENT', 'SECRETAIRE')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMembreDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.membresService.update(tenantId, id, {
      nom: dto.nom,
      prenom: dto.prenom,
      telephone: dto.telephone,
      email: dto.email,
      dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
      adresse: dto.adresse,
      photoUrl: dto.photoUrl,
      cniUrl: dto.cniUrl,
    });
  }
}
