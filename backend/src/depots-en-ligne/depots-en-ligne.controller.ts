import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DepotsEnLigneService } from './depots-en-ligne.service.js';
import { CreateDepotDto } from './dto/create-depot.dto.js';
import { ValiderDepotDto } from './dto/valider-depot.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('depots-en-ligne')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepotsEnLigneController {
  constructor(private readonly depotsEnLigneService: DepotsEnLigneService) {}

  /**
   * Créer un nouveau dépôt en ligne (accessible à tous les membres)
   */
  @Post()
  create(@Body() createDepotDto: CreateDepotDto, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.depotsEnLigneService.create(createDepotDto, tenantId);
  }

  /**
   * Obtenir tous les dépôts en attente de validation (admin uniquement)
   */
  @Get('en-attente')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  getDepotsEnAttente(@Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.depotsEnLigneService.getDepotsEnAttente(tenantId);
  }

  /**
   * Obtenir les dépôts d'un membre spécifique
   */
  @Get('membre/:membreId')
  getDepotsByMembre(@Param('membreId') membreId: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.depotsEnLigneService.getDepotsByMembre(membreId, tenantId);
  }

  /**
   * Valider ou rejeter un dépôt (admin uniquement)
   */
  @Post(':id/valider')
  @Roles('PRESIDENT', 'TRESORIER')
  validerDepot(
    @Param('id') id: string,
    @Body() validerDepotDto: ValiderDepotDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    return this.depotsEnLigneService.validerDepot(id, validerDepotDto, tenantId);
  }

  /**
   * Obtenir les statistiques des dépôts (admin uniquement)
   */
  @Get('statistiques')
  @Roles('PRESIDENT', 'TRESORIER', 'SECRETAIRE')
  getStatistiques(@Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.depotsEnLigneService.getStatistiques(tenantId);
  }
}
