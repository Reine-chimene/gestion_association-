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
import { AidesService } from './aides.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { DemanderAideMaladieDto } from './dto/demander-aide-maladie.dto.js';
import { DeclarerDecesDto } from './dto/declarer-deces.dto.js';
import { ApprouverAideDto } from './dto/approuver-aide.dto.js';
import { RejeterAideDto } from './dto/rejeter-aide.dto.js';
import { TypeAide } from '@prisma/client';

@Controller('aides')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AidesController {
  constructor(private readonly aidesService: AidesService) {}

  /**
   * Demander une aide maladie
   */
  @Post('maladie')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE')
  async demanderAideMaladie(@Body() dto: DemanderAideMaladieDto, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.aidesService.demanderAideMaladie(tenantId, dto);
  }

  /**
   * Déclarer un décès
   */
  @Post('deces')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async declarerDeces(@Body() dto: DeclarerDecesDto, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.aidesService.declarerDeces(tenantId, dto);
  }

  /**
   * Approuver une aide
   */
  @Post(':id/approuver')
  @Roles('PRESIDENT', 'TRESORIER')
  async approuver(
    @Param('id') id: string,
    @Body() dto: ApprouverAideDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    const approbateurId = req.user.userId;

    return this.aidesService.approuver(tenantId, id, approbateurId, dto);
  }

  /**
   * Rejeter une aide
   */
  @Post(':id/rejeter')
  @Roles('PRESIDENT', 'TRESORIER')
  async rejeter(@Param('id') id: string, @Body() dto: RejeterAideDto, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.aidesService.rejeter(tenantId, id, dto);
  }

  /**
   * Obtenir toutes les aides
   */
  @Get()
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  async findAll(
    @Query('type') type?: TypeAide,
    @Query('statut') statut?: string,
    @Query('beneficiaireId') beneficiaireId?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Request() req?: any,
  ) {
    const tenantId = req.user.tenantId;

    return this.aidesService.findAll(tenantId, {
      type,
      statut,
      beneficiaireId,
      limit,
      offset,
    });
  }

  /**
   * Obtenir les statistiques des aides (DOIT ÊTRE AVANT @Get(':id'))
   */
  @Get('statistiques/global')
  @Roles('PRESIDENT', 'TRESORIER')
  async getStatistiques(@Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.aidesService.getStatistiques(tenantId);
  }

  /**
   * Obtenir une aide par ID (GÉNÉRAL - DOIT ÊTRE EN DERNIER)
   */
  @Get(':id')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.aidesService.findOne(tenantId, id);
  }
}
