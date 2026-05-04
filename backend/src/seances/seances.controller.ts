import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SeancesService } from './seances.service.js';
import { CreateSeanceDto } from './dto/create-seance.dto.js';
import { EnregistrerPresencesDto } from './dto/enregistrer-presences.dto.js';
import { CollecterCotisationsDto } from './dto/collecter-cotisations.dto.js';
import { CloturerSeanceDto } from './dto/cloturer-seance.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('seances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeancesController {
  constructor(private readonly seancesService: SeancesService) {}

  /**
   * Créer une nouvelle séance
   * Accessible par: PRESIDENT, SECRETAIRE
   */
  @Post()
  @Roles(Role.PRESIDENT, Role.SECRETAIRE)
  create(@Request() req: any, @Body() createSeanceDto: CreateSeanceDto) {
    return this.seancesService.creer(req.user.tenantId, createSeanceDto);
  }

  /**
   * Récupérer toutes les séances
   * Accessible par: Tous les rôles
   */
  @Get()
  findAll(@Request() req: any) {
    return this.seancesService.findAll(req.user.tenantId);
  }

  /**
   * Récupérer une séance par ID
   * Accessible par: Tous les rôles
   */
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.seancesService.findOne(req.user.tenantId, id);
  }

  /**
   * Enregistrer les présences pour une séance
   * Accessible par: PRESIDENT, SECRETAIRE
   */
  @Post(':id/presences')
  @Roles(Role.PRESIDENT, Role.SECRETAIRE)
  enregistrerPresences(
    @Request() req: any,
    @Param('id') id: string,
    @Body() enregistrerPresencesDto: EnregistrerPresencesDto,
  ) {
    return this.seancesService.enregistrerPresences(
      req.user.tenantId,
      id,
      enregistrerPresencesDto,
    );
  }

  /**
   * Collecter les cotisations lors d'une séance
   * Accessible par: PRESIDENT, TRESORIER
   */
  @Post(':id/cotisations')
  @Roles(Role.PRESIDENT, Role.TRESORIER)
  collecterCotisations(
    @Request() req: any,
    @Param('id') id: string,
    @Body() collecterCotisationsDto: CollecterCotisationsDto,
  ) {
    return this.seancesService.collecterCotisations(
      req.user.tenantId,
      id,
      collecterCotisationsDto,
    );
  }

  /**
   * Générer le procès-verbal d'une séance
   * Accessible par: PRESIDENT, SECRETAIRE
   */
  @Get(':id/proces-verbal')
  @Roles(Role.PRESIDENT, Role.SECRETAIRE)
  genererProcesVerbal(@Request() req: any, @Param('id') id: string) {
    return this.seancesService.genererProcesVerbal(req.user.tenantId, id);
  }

  /**
   * Clôturer une séance
   * Accessible par: PRESIDENT
   */
  @Post(':id/cloturer')
  @Roles(Role.PRESIDENT)
  cloturerSeance(
    @Request() req: any,
    @Param('id') id: string,
    @Body() cloturerSeanceDto: CloturerSeanceDto,
  ) {
    return this.seancesService.cloturerSeance(req.user.tenantId, id, cloturerSeanceDto);
  }
}
