import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaissesService } from '../caisses/caisses.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TontinesService {
  constructor(private prisma: PrismaService, private caissesService: CaissesService) {}

  /**
   * Créer une nouvelle tontine
   */
  async create(tenantId: string, data: any) {
    const { nom, type, montantCotisation, frequence, dateDebut, participants } = data;

    if (montantCotisation <= 0) {
      throw new BadRequestException('Le montant de la cotisation doit être positif');
    }

    const tontine = await this.prisma.tontine.create({
      data: {
        tenantId,
        nom,
        type,
        montantCotisation: new Decimal(montantCotisation),
        frequence,
        dateDebut: new Date(dateDebut),
        cycleActuel: 1,
        statut: 'ACTIVE',
      },
    });

    const parts = [];
    for (let i = 0; i < participants.length; i++) {
      const membreId = participants[i];
      const part = await this.prisma.partTontine.create({
        data: {
          tontineId: tontine.id,
          membreId,
          nombreParts: 1,
          ordre: i + 1,
          aBeneficie: false,
        },
      });
      parts.push(part);
    }

    const tontineAvecParts = await this.prisma.tontine.findUnique({
      where: { id: tontine.id },
      include: {
        parts: {
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
      },
    });

    return tontineAvecParts;
  }

  /**
   * Obtenir toutes les tontines avec filtres
   */
  async findAll(tenantId: string, filters?: any) {
    const { statut, type, limit = 50, offset = 0 } = filters || {};

    const where: any = { tenantId };

    if (statut) {
      where.statut = statut;
    }

    if (type) {
      where.type = type;
    }

    return this.prisma.tontine.findMany({
      where,
      include: {
        parts: {
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
          orderBy: { ordre: 'asc' },
        },
        ventesTours: true,
        ventesInterets: true,
        toursGratuits: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Obtenir une tontine par ID
   */
  async findOne(tenantId: string, id: string) {
    const tontine = await this.prisma.tontine.findFirst({
      where: { id, tenantId },
      include: {
        parts: {
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
          orderBy: { ordre: 'asc' },
        },
        ventesTours: {
          orderBy: { date: 'desc' },
        },
        ventesInterets: {
          orderBy: { date: 'desc' },
        },
        toursGratuits: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!tontine) {
      throw new NotFoundException('Tontine non trouvée');
    }

    return tontine;
  }

  /**
   * Collecter les cotisations et détecter les retards avec pénalités automatiques
   */
  async collecterCotisations(
    tenantId: string,
    tontineId: string,
    responsableId: string,
    cotisations: { membreId: string; paye: boolean }[],
  ) {
    const tontine = await this.prisma.tontine.findUnique({
      where: { id: tontineId },
      include: {
        parts: {
          include: { membre: true },
        },
      },
    });

    if (!tontine) {
      throw new NotFoundException('Tontine non trouvée');
    }

    const membresNonPayeurs: string[] = [];

    for (const cotisation of cotisations) {
      const part = tontine.parts.find((p: any) => p.membreId === cotisation.membreId);

      if (!part) {
        throw new BadRequestException(`Membre ${cotisation.membreId} non trouvé dans cette tontine`);
      }

      if (!cotisation.paye) {
        membresNonPayeurs.push(cotisation.membreId);
      }
    }

    if (membresNonPayeurs.length > 0) {
      await this.creerPenalitesRetard(tontine, membresNonPayeurs, responsableId);
    }

    return {
      succes: true,
      membresNonPayeurs,
      nombreNonPayeurs: membresNonPayeurs.length,
    };
  }

  /**
   * Détecter les retards de cotisation et créer des pénalités
   */
  private async creerPenalitesRetard(
    tontine: any,
    membresNonPayeurs: string[],
    responsableId: string,
  ) {
    const typeSanctionRetard = await this.prisma.typeSanction.findFirst({
      where: {
        tenantId: tontine.tenantId,
        nom: { contains: 'retard', mode: 'insensitive' as any },
        actif: true,
      },
    });

    if (!typeSanctionRetard) {
      const montantCotisation = new Decimal(tontine.montantCotisation.toString());
      const montantPenalite = montantCotisation.times(10).div(100);

      for (const membreId of membresNonPayeurs) {
        const penaliteExistante = await this.prisma.sanction.findFirst({
          where: {
            tenantId: tontine.tenantId,
            membreId,
            statut: 'PENDING',
          },
        });

        if (!penaliteExistante) {
          await this.prisma.sanction.create({
            data: {
              tenantId: tontine.tenantId,
              membreId,
              typeSanctionId: 'retard-cotisation',
              montant: montantPenalite.toNumber(),
              motif: `Retard de cotisation pour la tournée ${tontine.cycleActuel}`,
              statut: 'PENDING',
            },
          });
        }
      }
      return;
    }

    const montantCotisation = new Decimal(tontine.montantCotisation.toString());
    let montantPenalite = new Decimal(0);

    switch (typeSanctionRetard.modeCalcul) {
      case 'FIXE':
        montantPenalite = new Decimal(typeSanctionRetard.montantFixe || 0);
        break;
      case 'POURCENTAGE':
        montantPenalite = montantCotisation
          .times(new Decimal(typeSanctionRetard.pourcentage || 0))
          .div(100);
        break;
      case 'PROGRESSIF':
        montantPenalite = montantCotisation
          .times(new Decimal(typeSanctionRetard.pourcentage || 5))
          .div(100);
        break;
    }

    for (const membreId of membresNonPayeurs) {
      const penaliteExistante = await this.prisma.sanction.findFirst({
        where: {
          tenantId: tontine.tenantId,
          membreId,
          typeSanctionId: typeSanctionRetard.id,
          statut: 'PENDING',
        },
      });

      if (!penaliteExistante) {
        await this.prisma.sanction.create({
          data: {
            tenantId: tontine.tenantId,
            membreId,
            typeSanctionId: typeSanctionRetard.id,
            montant: montantPenalite.toNumber(),
            motif: `Retard de cotisation pour la tournée ${tontine.cycleActuel}`,
            statut: 'PENDING',
          },
        });
      }
    }
  }

  /**
   * Gérer les retenues lors de la distribution (déductions automatiques)
   */
  private async gererRetenuesDistribution(
    tenantId: string,
    retenues: {
      prets?: Decimal;
      sanctions?: Decimal;
      complementFonds?: Decimal;
    },
    responsableId: string,
  ) {
    if (retenues.prets?.greaterThan(0)) {
      await this.caissesService.crediter(
        tenantId,
        'FONDS',
        retenues.prets.toNumber(),
        `Retenue automatique - Prêts - Distribution tontine`,
        responsableId,
      );
    }

    if (retenues.sanctions?.greaterThan(0)) {
      await this.caissesService.crediter(
        tenantId,
        'SANCTION',
        retenues.sanctions.toNumber(),
        `Retenue automatique - Sanctions - Distribution tontine`,
        responsableId,
      );
    }

    if (retenues.complementFonds?.greaterThan(0)) {
      await this.caissesService.crediter(
        tenantId,
        'FONDS',
        retenues.complementFonds.toNumber(),
        `Retenue automatique - Complément Fonds - Distribution tontine`,
        responsableId,
      );
    }
  }

  /**
   * Distribuer la cagnotte avec suivi du bénéficiaire actuel pour tontines non-vendables
   */
  async distribuerCagnotte(
    tenantId: string,
    tontineId: string,
    responsableId: string,
    retenues: {
      prets?: number;
      sanctions?: number;
      complementFonds?: number;
    },
  ) {
    const tontine = await this.prisma.tontine.findUnique({
      where: { id: tontineId },
      include: {
        parts: {
          include: {
            membre: true,
          },
        },
      },
    });

    if (!tontine) {
      throw new NotFoundException('Tontine non trouvée');
    }

    if (tontine.tenantId !== tenantId) {
      throw new BadRequestException('Tontine non autorisée pour ce tenant');
    }

    const beneficiaire = tontine.parts.find((p: any) => !p.aBeneficie);

    if (!beneficiaire) {
      throw new BadRequestException('Tous les participants ont déjà bénéficié ce cycle');
    }

    const nombreParts = tontine.parts.reduce((sum: number, p: any) => sum + p.nombreParts, 0);
    const cagnotteTotal = new Decimal(tontine.montantCotisation.toString()).times(nombreParts);

    const retenuesPrets = new Decimal(retenues?.prets || 0);
    const retenuesSanctions = new Decimal(retenues?.sanctions || 0);
    const retenuesComplementFonds = new Decimal(retenues?.complementFonds || 0);
    const totalRetenues = retenuesPrets.plus(retenuesSanctions).plus(retenuesComplementFonds);

    const montantNet = cagnotteTotal.minus(totalRetenues);

    if (montantNet.lessThan(0)) {
      throw new BadRequestException('Les retenues ne peuvent pas dépasser la cagnotte');
    }

    await this.caissesService.debiter(
      tenantId,
      'FONDS',
      montantNet.toNumber(),
      `Distribution tontine: ${tontine.nom} - Bénéficiaire: ${beneficiaire.membre.nom} ${beneficiaire.membre.prenom}`,
      responsableId,
    );

    await this.prisma.partTontine.update({
      where: { id: beneficiaire.id },
      data: { aBeneficie: true },
    });

    const toutesLesParts = await this.prisma.partTontine.findMany({
      where: { tontineId },
      orderBy: { ordre: 'asc' },
    });

    const cycleTermine = toutesLesParts.every((p) => p.aBeneficie);

    if (cycleTermine) {
      await this.prisma.partTontine.updateMany({
        where: { tontineId },
        data: { aBeneficie: false },
      });

      await this.prisma.tontine.update({
        where: { id: tontineId },
        data: { cycleActuel: tontine.cycleActuel + 1 },
      });
    }

    return {
      beneficiaire: {
        id: beneficiaire.membre.id,
        nom: beneficiaire.membre.nom,
        prenom: beneficiaire.membre.prenom,
        numeroMembre: beneficiaire.membre.numeroMembre,
      },
      cagnotteTotal: cagnotteTotal.toNumber(),
      retenues: {
        prets: retenuesPrets.toNumber(),
        sanctions: retenuesSanctions.toNumber(),
        complementFonds: retenuesComplementFonds.toNumber(),
        total: totalRetenues.toNumber(),
      },
      montantNet: montantNet.toNumber(),
      cycleTermine,
      nouveauCycle: cycleTermine ? tontine.cycleActuel + 1 : tontine.cycleActuel,
    };
  }

  /**
   * Vendre un tour (cédé à un autre membre)
   */
  async sellTour(tenantId: string, tontineId: string, data: any) {
    const { acheteurId, tourOriginal, montantOffre } = data;

    const tontine = await this.findOne(tenantId, tontineId);

    const partOriginale = tontine.parts.find((p: any) => p.ordre === tourOriginal);
    if (!partOriginale) {
      throw new BadRequestException(`Tour ${tourOriginal} non trouvé`);
    }

    const partAcheteur = tontine.parts.find((p: any) => p.membreId === acheteurId);
    if (!partAcheteur) {
      throw new BadRequestException("L'acheteur doit être un participant de la tontine");
    }

    const vente = await this.prisma.venteTour.create({
      data: {
        tontineId,
        acheteurId,
        tourOriginal,
        montantOffre: new Decimal(montantOffre),
        interetsPrimaires: new Decimal(0),
      },
    });

    return vente;
  }

  /**
   * Vendre des intérêts
   */
  async sellInterets(tenantId: string, tontineId: string, data: any) {
    const { vendeurId, acheteurId, montantInterets, montantOffre, modalite } = data;

    const tontine = await this.findOne(tenantId, tontineId);

    const partVendeur = tontine.parts.find((p: any) => p.membreId === vendeurId);
    if (!partVendeur) {
      throw new BadRequestException('Le vendeur doit être un participant de la tontine');
    }

    const partAcheteur = tontine.parts.find((p: any) => p.membreId === acheteurId);
    if (!partAcheteur) {
      throw new BadRequestException("L'acheteur doit être un participant de la tontine");
    }

    const interetsSecondaires = new Decimal(montantOffre).minus(new Decimal(montantInterets));

    const vente = await this.prisma.venteInterets.create({
      data: {
        tontineId,
        vendeurId,
        acheteurId,
        montantInterets: new Decimal(montantInterets),
        montantOffre: new Decimal(montantOffre),
        interetsSecondaires,
        modalite,
      },
    });

    return vente;
  }

  /**
   * Obtenir le bénéficiaire actuel (pour tontines non-vendables)
   */
  async getBeneficiaireActuel(tenantId: string, tontineId: string) {
    const tontine = await this.findOne(tenantId, tontineId);

    const beneficiaire = tontine.parts.find((p: any) => !p.aBeneficie);

    if (!beneficiaire) {
      return null;
    }

    return {
      partId: beneficiaire.id,
      membre: beneficiaire.membre,
      ordre: beneficiaire.ordre,
      tourActuel: tontine.cycleActuel,
    };
  }

  /**
   * Vérifier si un membre a un tour gratuit
   */
  async verifierTourGratuit(tenantId: string, tontineId: string, membreId: string) {
    const tontine = await this.findOne(tenantId, tontineId);

    const tourGratuit = await this.prisma.tourGratuit.findFirst({
      where: {
        tontineId,
        beneficiaireId: membreId,
      },
      orderBy: { date: 'desc' },
    });

    return {
      aTourGratuit: !!tourGratuit,
      tourGratuit,
    };
  }

  /**
   * Attribuer un tour gratuit à un bénéficiaire
   */
  async attribuerTourGratuit(tenantId: string, tontineId: string, beneficiaireId: string) {
    const tontine = await this.findOne(tenantId, tontineId);

    const partBeneficiaire = tontine.parts.find((p: any) => p.membreId === beneficiaireId);
    if (!partBeneficiaire) {
      throw new BadRequestException('Le bénéficiaire doit être un participant de la tontine');
    }

    const nombreParts = tontine.parts.length;
    const montantTourGratuit = new Decimal(tontine.montantCotisation.toString()).times(nombreParts);

    const tourGratuit = await this.prisma.tourGratuit.create({
      data: {
        tontineId,
        beneficiaireId,
        montant: montantTourGratuit,
      },
    });

    return tourGratuit;
  }
}
