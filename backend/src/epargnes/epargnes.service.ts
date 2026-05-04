import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CaissesService } from '../caisses/caisses.service.js';
import { CotiserDto } from './dto/cotiser.dto.js';
import { RedistribuerDto } from './dto/redistribuer.dto.js';
import { TypeEpargne, Prisma } from '@prisma/client';

@Injectable()
export class EpargnesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly caissesService: CaissesService,
  ) {}

  /**
   * Enregistrer une cotisation d'épargne
   */
  async cotiser(tenantId: string, responsableId: string, dto: CotiserDto) {
    // Vérifier que le membre existe
    const membre = await this.prisma.membre.findFirst({
      where: { id: dto.membreId, tenantId },
    });

    if (!membre) {
      throw new NotFoundException('Membre non trouvé');
    }

    // Vérifier que le membre est actif
    if (membre.statut !== 'ACTIF') {
      throw new BadRequestException('Le membre doit être actif pour cotiser');
    }

    // Trouver ou créer l'épargne du cycle actuel
    let epargne = await this.prisma.epargne.findFirst({
      where: {
        tenantId,
        type: dto.type,
        statut: 'ACTIF',
      },
    });

    if (!epargne) {
      // Créer une nouvelle épargne pour ce cycle
      const dateDebut = new Date();
      const dateFin = new Date();
      
      // Calculer la date de fin selon le type
      if (dto.type === 'ANNUELLE') {
        dateFin.setFullYear(dateFin.getFullYear() + 1);
      } else if (dto.type === 'SCOLAIRE') {
        // Année scolaire : septembre à juin
        dateFin.setMonth(5); // Juin
        dateFin.setDate(30);
        if (dateDebut.getMonth() > 5) {
          dateFin.setFullYear(dateFin.getFullYear() + 1);
        }
      }

      epargne = await this.prisma.epargne.create({
        data: {
          tenantId,
          type: dto.type,
          dateDebut,
          dateFin,
          cycleActuel: 1,
          statut: 'ACTIF',
        },
      });
    }

    // Utiliser une transaction pour garantir la cohérence
    const result = await this.prisma.$transaction(async (tx) => {
      // Enregistrer la cotisation
      const cotisation = await tx.cotisationEpargne.create({
        data: {
          epargneId: epargne!.id,
          membreId: dto.membreId,
          montant: new Prisma.Decimal(dto.montant),
          date: new Date(),
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

      // Créditer la Caisse Épargne
      await this.caissesService.crediter(
        tenantId,
        'EPARGNE',
        dto.montant,
        `Cotisation épargne ${dto.type} - ${membre.prenom} ${membre.nom} (${membre.numeroMembre})`,
        responsableId,
      );

      return cotisation;
    });

    return result;
  }

  /**
   * Calculer le solde d'épargne d'un membre pour un type donné
   */
  async calculerSolde(tenantId: string, membreId: string, type: TypeEpargne) {
    // Vérifier que le membre existe
    const membre = await this.prisma.membre.findFirst({
      where: { id: membreId, tenantId },
    });

    if (!membre) {
      throw new NotFoundException('Membre non trouvé');
    }

    // Trouver l'épargne active du cycle actuel
    const epargne = await this.prisma.epargne.findFirst({
      where: {
        tenantId,
        type,
        statut: 'ACTIF',
      },
    });

    if (!epargne) {
      return {
        membreId,
        type,
        solde: 0,
        nombreCotisations: 0,
        cycleActuel: 0,
      };
    }

    // Calculer le total des cotisations du membre pour ce cycle
    const cotisations = await this.prisma.cotisationEpargne.findMany({
      where: {
        epargneId: epargne.id,
        membreId,
      },
    });

    const solde = cotisations.reduce(
      (sum, c) => sum + Number(c.montant),
      0,
    );

    return {
      membreId,
      type,
      solde,
      nombreCotisations: cotisations.length,
      cycleActuel: epargne.cycleActuel,
      dateDebut: epargne.dateDebut,
      dateFin: epargne.dateFin,
    };
  }

  /**
   * Redistribuer l'épargne avec intérêts
   */
  async redistribuer(tenantId: string, responsableId: string, dto: RedistribuerDto) {
    // Trouver l'épargne active
    const epargne = await this.prisma.epargne.findFirst({
      where: {
        tenantId,
        type: dto.type,
        statut: 'ACTIF',
      },
      include: {
        cotisations: {
          include: {
            membre: {
              select: {
                id: true,
                numeroMembre: true,
                nom: true,
                prenom: true,
                statut: true,
              },
            },
          },
        },
      },
    });

    if (!epargne) {
      throw new NotFoundException(`Aucune épargne ${dto.type} active trouvée`);
    }

    // Calculer le total collecté
    const totalCollecte = epargne.cotisations.reduce(
      (sum, c) => sum + Number(c.montant),
      0,
    );

    if (totalCollecte === 0) {
      throw new BadRequestException('Aucune cotisation à redistribuer');
    }

    // Calculer les intérêts générés (si taux fourni)
    const tauxInteret = dto.tauxInteret || 0;
    const interetsGeneres = (totalCollecte * tauxInteret) / 100;
    const montantTotal = totalCollecte + interetsGeneres;

    // Calculer les contributions par membre
    const contributionsParMembre = new Map<string, number>();
    epargne.cotisations.forEach((c) => {
      const current = contributionsParMembre.get(c.membreId) || 0;
      contributionsParMembre.set(c.membreId, current + Number(c.montant));
    });

    // Calculer les redistributions proportionnelles
    const redistributions: Array<{
      membreId: string;
      membre: any;
      contribution: number;
      partInterets: number;
      montantTotal: number;
      retenues: number;
      montantNet: number;
    }> = [];

    for (const [membreId, contribution] of contributionsParMembre.entries()) {
      const membre = epargne.cotisations.find((c) => c.membreId === membreId)?.membre;
      
      if (!membre) continue;

      // Calculer la part proportionnelle des intérêts
      const partInterets = (contribution / totalCollecte) * interetsGeneres;
      const montantBrut = contribution + partInterets;

      // TODO: Calculer les retenues (prêts, sanctions)
      // Pour l'instant, pas de retenues
      const retenues = 0;
      const montantNet = montantBrut - retenues;

      redistributions.push({
        membreId,
        membre,
        contribution,
        partInterets,
        montantTotal: montantBrut,
        retenues,
        montantNet,
      });
    }

    // Utiliser une transaction pour garantir la cohérence
    const result = await this.prisma.$transaction(async (tx) => {
      // Débiter la Caisse Épargne
      await this.caissesService.debiter(
        tenantId,
        'EPARGNE',
        montantTotal,
        `Redistribution épargne ${dto.type} - Cycle ${epargne.cycleActuel}`,
        responsableId,
      );

      // Clôturer l'épargne actuelle
      await tx.epargne.update({
        where: { id: epargne.id },
        data: { statut: 'CLOTURE', dateFin: new Date() },
      });

      // Créer une nouvelle épargne pour le prochain cycle
      const dateDebut = new Date();
      const dateFin = new Date();
      
      if (dto.type === 'ANNUELLE') {
        dateFin.setFullYear(dateFin.getFullYear() + 1);
      } else if (dto.type === 'SCOLAIRE') {
        dateFin.setMonth(5);
        dateFin.setDate(30);
        if (dateDebut.getMonth() > 5) {
          dateFin.setFullYear(dateFin.getFullYear() + 1);
        }
      }

      await tx.epargne.create({
        data: {
          tenantId,
          type: dto.type,
          dateDebut,
          dateFin,
          cycleActuel: epargne.cycleActuel + 1,
          statut: 'ACTIF',
        },
      });

      return {
        epargneId: epargne.id,
        type: dto.type,
        cycleActuel: epargne.cycleActuel,
        totalCollecte,
        tauxInteret,
        interetsGeneres,
        montantTotal,
        nombreBeneficiaires: redistributions.length,
        redistributions,
      };
    });

    return result;
  }

  /**
   * Calculer les intérêts générés pour une période
   */
  async calculerInteretsGeneres(
    tenantId: string,
    type: TypeEpargne,
    tauxInteret: number,
  ) {
    const epargne = await this.prisma.epargne.findFirst({
      where: {
        tenantId,
        type,
        statut: 'ACTIF',
      },
      include: {
        cotisations: true,
      },
    });

    if (!epargne) {
      return {
        type,
        totalCollecte: 0,
        tauxInteret,
        interetsGeneres: 0,
        montantTotal: 0,
      };
    }

    const totalCollecte = epargne.cotisations.reduce(
      (sum, c) => sum + Number(c.montant),
      0,
    );

    const interetsGeneres = (totalCollecte * tauxInteret) / 100;
    const montantTotal = totalCollecte + interetsGeneres;

    return {
      type,
      cycleActuel: epargne.cycleActuel,
      dateDebut: epargne.dateDebut,
      dateFin: epargne.dateFin,
      totalCollecte,
      tauxInteret,
      interetsGeneres,
      montantTotal,
      nombreCotisations: epargne.cotisations.length,
    };
  }

  /**
   * Obtenir toutes les épargnes
   */
  async findAll(tenantId: string, type?: TypeEpargne) {
    const where: any = { tenantId };
    if (type) {
      where.type = type;
    }

    const epargnes = await this.prisma.epargne.findMany({
      where,
      include: {
        cotisations: {
          include: {
            membre: {
              select: {
                numeroMembre: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
        _count: {
          select: {
            cotisations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculer le total collecté pour chaque épargne
    return epargnes.map((epargne) => {
      const totalCollecte = epargne.cotisations.reduce(
        (sum, c) => sum + Number(c.montant),
        0,
      );

      return {
        ...epargne,
        totalCollecte,
      };
    });
  }

  /**
   * Obtenir une épargne par ID
   */
  async findOne(tenantId: string, id: string) {
    const epargne = await this.prisma.epargne.findFirst({
      where: { id, tenantId },
      include: {
        cotisations: {
          include: {
            membre: {
              select: {
                numeroMembre: true,
                nom: true,
                prenom: true,
              },
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!epargne) {
      throw new NotFoundException('Épargne non trouvée');
    }

    const totalCollecte = epargne.cotisations.reduce(
      (sum, c) => sum + Number(c.montant),
      0,
    );

    return {
      ...epargne,
      totalCollecte,
    };
  }

  /**
   * Obtenir les statistiques des épargnes
   */
  async getStatistiques(tenantId: string) {
    const epargnes = await this.prisma.epargne.findMany({
      where: { tenantId },
      include: {
        cotisations: true,
      },
    });

    const epargnesActives = epargnes.filter((e) => e.statut === 'ACTIF');
    const epargnesCloturees = epargnes.filter((e) => e.statut === 'CLOTURE');

    const totalCollecteAnnuelle = epargnes
      .filter((e) => e.type === 'ANNUELLE')
      .reduce((sum, e) => {
        return (
          sum +
          e.cotisations.reduce((s, c) => s + Number(c.montant), 0)
        );
      }, 0);

    const totalCollecteScolaire = epargnes
      .filter((e) => e.type === 'SCOLAIRE')
      .reduce((sum, e) => {
        return (
          sum +
          e.cotisations.reduce((s, c) => s + Number(c.montant), 0)
        );
      }, 0);

    return {
      total: epargnes.length,
      actives: epargnesActives.length,
      cloturees: epargnesCloturees.length,
      totalCollecteAnnuelle,
      totalCollecteScolaire,
      totalCollecte: totalCollecteAnnuelle + totalCollecteScolaire,
    };
  }
}
