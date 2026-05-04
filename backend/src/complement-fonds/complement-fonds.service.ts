import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CaissesService } from '../caisses/caisses.service.js';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ComplementFondsService {
  constructor(
    private prisma: PrismaService,
    private caissesService: CaissesService,
  ) {}

  /**
   * Calculer le complément fonds annuel
   * Basé sur les dépenses prévisionnelles de l'année
   */
  async calculerComplementAnnuel(
    tenantId: string,
    annee: number,
    montantTotal: number,
  ) {
    // Vérifier qu'un complément n'existe pas déjà pour cette année
    const existant = await this.prisma.complementFonds.findUnique({
      where: {
        tenantId_annee: {
          tenantId,
          annee,
        },
      },
    });

    if (existant) {
      throw new BadRequestException(
        `Un complément fonds existe déjà pour l'année ${annee}`,
      );
    }

    // Compter les membres actifs
    const membresActifs = await this.prisma.membre.count({
      where: {
        tenantId,
        statut: 'ACTIF',
      },
    });

    if (membresActifs === 0) {
      throw new BadRequestException('Aucun membre actif trouvé');
    }

    // Calculer le montant par membre
    const montantParMembre = new Decimal(montantTotal).dividedBy(membresActifs);

    // Créer le complément fonds
    const complementFonds = await this.prisma.complementFonds.create({
      data: {
        tenantId,
        annee,
        montantTotal: new Decimal(montantTotal),
        montantParMembre,
        statut: 'ACTIF',
      },
    });

    return {
      ...complementFonds,
      montantTotal: complementFonds.montantTotal.toNumber(),
      montantParMembre: complementFonds.montantParMembre.toNumber(),
      nombreMembresActifs: membresActifs,
    };
  }

  /**
   * Obtenir tous les compléments fonds
   */
  async findAll(
    tenantId: string,
    options: {
      annee?: number;
      statut?: string;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const { annee, statut, limit = 50, offset = 0 } = options;

    const where: any = { tenantId };

    if (annee) {
      where.annee = annee;
    }

    if (statut) {
      where.statut = statut;
    }

    const [complementFonds, total] = await Promise.all([
      this.prisma.complementFonds.findMany({
        where,
        include: {
          paiements: {
            include: {
              membre: {
                select: {
                  id: true,
                  nom: true,
                  prenom: true,
                  numeroMembre: true,
                },
              },
            },
          },
          _count: {
            select: {
              paiements: true,
            },
          },
        },
        orderBy: { annee: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.complementFonds.count({ where }),
    ]);

    return {
      complementFonds: complementFonds.map((cf) => ({
        ...cf,
        montantTotal: cf.montantTotal.toNumber(),
        montantParMembre: cf.montantParMembre.toNumber(),
        nombrePaiements: cf._count.paiements,
        paiements: cf.paiements.map((p) => ({
          ...p,
          montant: p.montant.toNumber(),
        })),
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Obtenir un complément fonds par ID
   */
  async findOne(tenantId: string, id: string) {
    const complementFonds = await this.prisma.complementFonds.findFirst({
      where: { id, tenantId },
      include: {
        paiements: {
          include: {
            membre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                numeroMembre: true,
              },
            },
          },
          orderBy: {
            datePaiement: 'desc',
          },
        },
      },
    });

    if (!complementFonds) {
      throw new NotFoundException('Complément fonds non trouvé');
    }

    return {
      ...complementFonds,
      montantTotal: complementFonds.montantTotal.toNumber(),
      montantParMembre: complementFonds.montantParMembre.toNumber(),
      paiements: complementFonds.paiements.map((p) => ({
        ...p,
        montant: p.montant.toNumber(),
      })),
    };
  }

  /**
   * Obtenir le suivi des paiements pour un complément fonds
   */
  async getSuiviPaiements(tenantId: string, complementFondsId: string) {
    const complementFonds = await this.findOne(tenantId, complementFondsId);

    // Obtenir tous les membres actifs
    const membresActifs = await this.prisma.membre.findMany({
      where: {
        tenantId,
        statut: 'ACTIF',
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        numeroMembre: true,
      },
    });

    // Calculer le statut de paiement pour chaque membre
    const suiviPaiements = membresActifs.map((membre) => {
      const paiements = complementFonds.paiements.filter(
        (p) => p.membreId === membre.id,
      );

      const montantPaye = paiements.reduce(
        (sum, p) => sum + p.montant,
        0,
      );

      const montantDu = complementFonds.montantParMembre;
      const montantRestant = montantDu - montantPaye;

      return {
        membre,
        montantDu,
        montantPaye,
        montantRestant,
        statut: montantRestant <= 0 ? 'PAYE' : montantRestant < montantDu ? 'PARTIEL' : 'IMPAYE',
        nombrePaiements: paiements.length,
        dernierPaiement: paiements.length > 0 ? paiements[0].datePaiement : null,
      };
    });

    // Calculer les statistiques globales
    const totalPaye = suiviPaiements.reduce((sum, s) => sum + s.montantPaye, 0);
    const totalRestant = suiviPaiements.reduce((sum, s) => sum + s.montantRestant, 0);
    const nombrePayes = suiviPaiements.filter((s) => s.statut === 'PAYE').length;
    const nombrePartiels = suiviPaiements.filter((s) => s.statut === 'PARTIEL').length;
    const nombreImpayes = suiviPaiements.filter((s) => s.statut === 'IMPAYE').length;

    return {
      complementFonds: {
        id: complementFonds.id,
        annee: complementFonds.annee,
        montantTotal: complementFonds.montantTotal,
        montantParMembre: complementFonds.montantParMembre,
        statut: complementFonds.statut,
      },
      suiviPaiements,
      statistiques: {
        nombreMembres: membresActifs.length,
        totalPaye,
        totalRestant,
        tauxRecouvrement: (totalPaye / complementFonds.montantTotal) * 100,
        nombrePayes,
        nombrePartiels,
        nombreImpayes,
      },
    };
  }

  /**
   * Enregistrer un paiement de complément fonds
   */
  async enregistrerPaiement(
    tenantId: string,
    complementFondsId: string,
    responsableId: string,
    data: {
      membreId: string;
      montant: number;
      modePaiement?: 'PRELEVEMENT_AUTO' | 'PAIEMENT_MANUEL';
    },
  ) {
    const complementFonds = await this.findOne(tenantId, complementFondsId);

    if (complementFonds.statut === 'CASSE') {
      throw new BadRequestException('Ce complément fonds a été cassé');
    }

    // Vérifier que le membre existe et est actif
    const membre = await this.prisma.membre.findFirst({
      where: {
        id: data.membreId,
        tenantId,
        statut: 'ACTIF',
      },
    });

    if (!membre) {
      throw new NotFoundException('Membre non trouvé ou inactif');
    }

    // Calculer le montant déjà payé par ce membre
    const paiementsExistants = await this.prisma.paiementComplementFonds.findMany({
      where: {
        complementFondsId,
        membreId: data.membreId,
      },
    });

    const montantDejaPaye = paiementsExistants.reduce(
      (sum, p) => sum + p.montant.toNumber(),
      0,
    );

    const montantRestant = complementFonds.montantParMembre - montantDejaPaye;

    if (montantRestant <= 0) {
      throw new BadRequestException('Ce membre a déjà payé son complément fonds');
    }

    if (data.montant > montantRestant) {
      throw new BadRequestException(
        `Le montant ne peut pas dépasser le montant restant (${montantRestant} FCFA)`,
      );
    }

    // Enregistrer le paiement
    const paiement = await this.prisma.paiementComplementFonds.create({
      data: {
        complementFondsId,
        membreId: data.membreId,
        montant: new Decimal(data.montant),
        modePaiement: data.modePaiement || 'PAIEMENT_MANUEL',
      },
      include: {
        membre: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroMembre: true,
          },
        },
      },
    });

    // Créditer la caisse fonds
    await this.caissesService.crediter(
      tenantId,
      'FONDS',
      data.montant,
      `Complément fonds ${complementFonds.annee} - ${membre.nom} ${membre.prenom}`,
      responsableId,
    );

    return {
      paiement: {
        ...paiement,
        montant: paiement.montant.toNumber(),
      },
      montantDejaPaye: montantDejaPaye + data.montant,
      montantRestant: montantRestant - data.montant,
    };
  }

  /**
   * Augmenter le complément fonds
   * Augmente le montant total et recalcule le montant par membre
   */
  async augmenter(
    tenantId: string,
    complementFondsId: string,
    nouveauMontantTotal: number,
  ) {
    const complementFonds = await this.findOne(tenantId, complementFondsId);

    if (complementFonds.statut === 'CASSE') {
      throw new BadRequestException('Ce complément fonds a été cassé');
    }

    if (nouveauMontantTotal <= complementFonds.montantTotal) {
      throw new BadRequestException(
        'Le nouveau montant doit être supérieur au montant actuel',
      );
    }

    // Compter les membres actifs
    const membresActifs = await this.prisma.membre.count({
      where: {
        tenantId,
        statut: 'ACTIF',
      },
    });

    // Calculer le nouveau montant par membre
    const nouveauMontantParMembre = new Decimal(nouveauMontantTotal).dividedBy(membresActifs);

    // Mettre à jour le complément fonds
    const updated = await this.prisma.complementFonds.update({
      where: { id: complementFondsId },
      data: {
        montantTotal: new Decimal(nouveauMontantTotal),
        montantParMembre: nouveauMontantParMembre,
        statut: 'AUGMENTE',
      },
    });

    return {
      ...updated,
      montantTotal: updated.montantTotal.toNumber(),
      montantParMembre: updated.montantParMembre.toNumber(),
      ancienMontantTotal: complementFonds.montantTotal,
      ancienMontantParMembre: complementFonds.montantParMembre,
      augmentation: nouveauMontantTotal - complementFonds.montantTotal,
    };
  }

  /**
   * Casser le complément fonds
   * Annule le complément fonds et rembourse les paiements déjà effectués
   */
  async casser(
    tenantId: string,
    complementFondsId: string,
    responsableId: string,
    motif: string,
  ) {
    const complementFonds = await this.findOne(tenantId, complementFondsId);

    if (complementFonds.statut === 'CASSE') {
      throw new BadRequestException('Ce complément fonds a déjà été cassé');
    }

    // Calculer le montant total des paiements
    const montantTotalPaiements = complementFonds.paiements.reduce(
      (sum, p) => sum + p.montant,
      0,
    );

    // Débiter la caisse fonds pour rembourser
    if (montantTotalPaiements > 0) {
      await this.caissesService.debiter(
        tenantId,
        'FONDS',
        montantTotalPaiements,
        `Remboursement complément fonds ${complementFonds.annee} cassé - ${motif}`,
        responsableId,
      );
    }

    // Mettre à jour le statut
    const updated = await this.prisma.complementFonds.update({
      where: { id: complementFondsId },
      data: {
        statut: 'CASSE',
      },
    });

    return {
      ...updated,
      montantTotal: updated.montantTotal.toNumber(),
      montantParMembre: updated.montantParMembre.toNumber(),
      montantRembourse: montantTotalPaiements,
      nombrePaiementsRembourses: complementFonds.paiements.length,
      motif,
    };
  }

  /**
   * Prélever automatiquement le complément fonds lors de la distribution de tontine
   * Cette méthode est appelée par le module Tontines
   */
  async preleverAutomatique(
    tenantId: string,
    membreId: string,
    annee: number,
  ): Promise<{ montant: number; complementFondsId: string } | null> {
    // Trouver le complément fonds actif pour cette année
    const complementFonds = await this.prisma.complementFonds.findUnique({
      where: {
        tenantId_annee: {
          tenantId,
          annee,
        },
      },
    });

    if (!complementFonds || complementFonds.statut === 'CASSE') {
      return null;
    }

    // Vérifier si le membre a déjà payé
    const paiementsExistants = await this.prisma.paiementComplementFonds.findMany({
      where: {
        complementFondsId: complementFonds.id,
        membreId,
      },
    });

    const montantDejaPaye = paiementsExistants.reduce(
      (sum, p) => sum + p.montant.toNumber(),
      0,
    );

    const montantRestant = complementFonds.montantParMembre.toNumber() - montantDejaPaye;

    if (montantRestant <= 0) {
      return null; // Déjà payé
    }

    // Enregistrer le prélèvement automatique
    await this.prisma.paiementComplementFonds.create({
      data: {
        complementFondsId: complementFonds.id,
        membreId,
        montant: new Decimal(montantRestant),
        modePaiement: 'PRELEVEMENT_AUTO',
      },
    });

    return {
      montant: montantRestant,
      complementFondsId: complementFonds.id,
    };
  }
}
