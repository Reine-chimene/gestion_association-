import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDepotDto } from './dto/create-depot.dto.js';
import { ValiderDepotDto, ActionValidation } from './dto/valider-depot.dto.js';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DepotsEnLigneService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouveau dépôt en ligne
   */
  async create(createDepotDto: CreateDepotDto, tenantId: string) {
    // Vérifier que le membre existe
    const membre = await this.prisma.membre.findFirst({
      where: {
        id: createDepotDto.membreId,
        tenantId,
      },
    });

    if (!membre) {
      throw new NotFoundException('Membre non trouvé');
    }

    // Créer le dépôt
    const depot = await this.prisma.depotEnLigne.create({
      data: {
        membreId: createDepotDto.membreId,
        type: createDepotDto.type,
        montant: new Decimal(createDepotDto.montant),
        preuveUrl: createDepotDto.preuveUrl,
        motifAbsence: createDepotDto.motifAbsence,
        statut: 'EN_ATTENTE_VALIDATION',
      },
      include: {
        membre: {
          select: {
            numeroMembre: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return depot;
  }

  /**
   * Obtenir tous les dépôts en attente de validation
   */
  async getDepotsEnAttente(tenantId: string) {
    return this.prisma.depotEnLigne.findMany({
      where: {
        statut: 'EN_ATTENTE_VALIDATION',
        membre: {
          tenantId,
        },
      },
      include: {
        membre: {
          select: {
            numeroMembre: true,
            nom: true,
            prenom: true,
            telephone: true,
          },
        },
      },
      orderBy: {
        dateDepot: 'desc',
      },
    });
  }

  /**
   * Obtenir les dépôts d'un membre
   */
  async getDepotsByMembre(membreId: string, tenantId: string) {
    // Vérifier que le membre existe et appartient au tenant
    const membre = await this.prisma.membre.findFirst({
      where: {
        id: membreId,
        tenantId,
      },
    });

    if (!membre) {
      throw new NotFoundException('Membre non trouvé');
    }

    return this.prisma.depotEnLigne.findMany({
      where: {
        membreId,
      },
      orderBy: {
        dateDepot: 'desc',
      },
    });
  }

  /**
   * Valider ou rejeter un dépôt
   */
  async validerDepot(depotId: string, validerDepotDto: ValiderDepotDto, tenantId: string) {
    // Vérifier que le dépôt existe
    const depot = await this.prisma.depotEnLigne.findFirst({
      where: {
        id: depotId,
        membre: {
          tenantId,
        },
      },
      include: {
        membre: true,
      },
    });

    if (!depot) {
      throw new NotFoundException('Dépôt non trouvé');
    }

    if (depot.statut !== 'EN_ATTENTE_VALIDATION') {
      throw new BadRequestException('Ce dépôt a déjà été traité');
    }

    const nouveauStatut = validerDepotDto.action === ActionValidation.VALIDER ? 'VALIDE' : 'REJETE';

    // Mettre à jour le statut du dépôt
    const depotMisAJour = await this.prisma.depotEnLigne.update({
      where: { id: depotId },
      data: {
        statut: nouveauStatut,
        dateValidation: new Date(),
        validateurId: validerDepotDto.validateurId,
      },
      include: {
        membre: {
          select: {
            numeroMembre: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    // Si validé, créditer la caisse correspondante
    if (nouveauStatut === 'VALIDE') {
      // TODO: Intégrer avec le module Caisses pour créditer automatiquement
      // await this.caissesService.crediter({
      //   type: depot.type,
      //   montant: depot.montant,
      //   motif: `Dépôt en ligne validé - ${depot.membre.nom} ${depot.membre.prenom}`,
      //   responsableId: validerDepotDto.validateurId,
      // });
    }

    return depotMisAJour;
  }

  /**
   * Obtenir les statistiques des dépôts
   */
  async getStatistiques(tenantId: string) {
    const [enAttente, valides, rejetes, totalMontant] = await Promise.all([
      this.prisma.depotEnLigne.count({
        where: {
          statut: 'EN_ATTENTE_VALIDATION',
          membre: { tenantId },
        },
      }),
      this.prisma.depotEnLigne.count({
        where: {
          statut: 'VALIDE',
          membre: { tenantId },
        },
      }),
      this.prisma.depotEnLigne.count({
        where: {
          statut: 'REJETE',
          membre: { tenantId },
        },
      }),
      this.prisma.depotEnLigne.aggregate({
        where: {
          statut: 'VALIDE',
          membre: { tenantId },
        },
        _sum: {
          montant: true,
        },
      }),
    ]);

    return {
      enAttente,
      valides,
      rejetes,
      totalMontant: totalMontant._sum.montant || 0,
    };
  }
}
