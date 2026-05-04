import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CaissesService } from '../caisses/caisses.service.js';
import { DemanderAideMaladieDto } from './dto/demander-aide-maladie.dto.js';
import { DeclarerDecesDto } from './dto/declarer-deces.dto.js';
import { ApprouverAideDto } from './dto/approuver-aide.dto.js';
import { RejeterAideDto } from './dto/rejeter-aide.dto.js';
import { TypeAide, TypeBeneficiaire, Prisma } from '@prisma/client';

@Injectable()
export class AidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly caissesService: CaissesService,
  ) {}

  /**
   * Demander une aide maladie
   */
  async demanderAideMaladie(tenantId: string, dto: DemanderAideMaladieDto) {
    // Vérifier que le bénéficiaire existe et est actif
    const beneficiaire = await this.prisma.membre.findFirst({
      where: { id: dto.beneficiaireId, tenantId },
    });

    if (!beneficiaire) {
      throw new NotFoundException('Bénéficiaire non trouvé');
    }

    if (beneficiaire.statut !== 'ACTIF') {
      throw new BadRequestException('Le bénéficiaire doit être actif');
    }

    // Vérifier le nombre d'aides maladie déjà reçues cette année
    const debutAnnee = new Date(new Date().getFullYear(), 0, 1);
    const aidesAnnee = await this.prisma.aide.count({
      where: {
        tenantId,
        beneficiaireId: dto.beneficiaireId,
        type: 'MALADIE',
        dateDeclaration: { gte: debutAnnee },
        statut: { in: ['APPROUVEE', 'VERSEE'] },
      },
    });

    // Limite configurable (par défaut 2 aides maladie par an)
    const limiteAidesParAn = 2;
    if (aidesAnnee >= limiteAidesParAn) {
      throw new BadRequestException(
        `Limite d'aides maladie atteinte pour cette année (${limiteAidesParAn})`,
      );
    }

    // Récupérer le montant configuré pour l'aide maladie
    const montantConfig = await this.prisma.configuration.findFirst({
      where: { tenantId, cle: 'MONTANT_AIDE_MALADIE' },
    });

    const montant = montantConfig
      ? parseFloat(montantConfig.valeur)
      : 50000; // Montant par défaut

    // Créer la demande d'aide
    const aide = await this.prisma.aide.create({
      data: {
        tenantId,
        type: 'MALADIE',
        beneficiaireId: dto.beneficiaireId,
        typeBeneficiaire: 'MEMBRE',
        montant: new Prisma.Decimal(montant),
        justificatifs: dto.justificatifs,
        statut: 'EN_ATTENTE',
      },
      include: {
        beneficiaire: {
          select: {
            numeroMembre: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return aide;
  }

  /**
   * Déclarer un décès
   */
  async declarerDeces(tenantId: string, dto: DeclarerDecesDto) {
    // Vérifier que le membre déclarant existe
    const membre = await this.prisma.membre.findFirst({
      where: { id: dto.membreId, tenantId },
    });

    if (!membre) {
      throw new NotFoundException('Membre non trouvé');
    }

    // Calculer le montant selon le type de bénéficiaire
    const montants = {
      MEMBRE: 200000, // Décès d'un membre
      CONJOINT: 150000, // Décès du conjoint d'un membre
      PARENT: 100000, // Décès d'un parent d'un membre
      ENFANT: 100000, // Décès d'un enfant d'un membre
    };

    const montantAide = montants[dto.typeBeneficiaire];

    // Frais de visite du commissionnaire
    const fraisVisite = 50000;
    const montantTotal = montantAide + fraisVisite;

    // Désigner automatiquement un commissionnaire à tour de rôle
    const commissionnaire = await this.designerCommissionnaire(tenantId);

    // Utiliser une transaction pour garantir la cohérence
    const result = await this.prisma.$transaction(async (tx) => {
      // Créer l'aide décès
      const aide = await tx.aide.create({
        data: {
          tenantId,
          type: 'DECES',
          beneficiaireId: dto.membreId,
          typeBeneficiaire: dto.typeBeneficiaire,
          montant: new Prisma.Decimal(montantTotal),
          justificatifs: dto.justificatifs,
          statut: 'APPROUVEE', // Approuvée automatiquement
          commissionnaireId: commissionnaire.id,
          dateApprobation: new Date(),
        },
        include: {
          beneficiaire: {
            select: {
              numeroMembre: true,
              nom: true,
              prenom: true,
            },
          },
        },
      });

      // Débiter la Caisse Fonds
      await this.caissesService.debiter(
        tenantId,
        'FONDS',
        montantTotal,
        `Aide décès ${dto.typeBeneficiaire} - ${dto.nomDefunt}`,
        dto.membreId,
      );

      return {
        aide,
        commissionnaire: {
          numeroMembre: commissionnaire.numeroMembre,
          nom: commissionnaire.nom,
          prenom: commissionnaire.prenom,
        },
        montantAide,
        fraisVisite,
        montantTotal,
      };
    });

    // TODO: Déclencher la collecte de cotisation décès auprès de tous les membres
    // TODO: Notifier tous les membres du décès

    return result;
  }

  /**
   * Désigner un commissionnaire à tour de rôle
   */
  private async designerCommissionnaire(tenantId: string) {
    // Récupérer tous les membres actifs
    const membresActifs = await this.prisma.membre.findMany({
      where: { tenantId, statut: 'ACTIF' },
      orderBy: { numeroMembre: 'asc' },
    });

    if (membresActifs.length === 0) {
      throw new BadRequestException('Aucun membre actif disponible');
    }

    // Trouver le dernier commissionnaire désigné
    const derniereAide = await this.prisma.aide.findFirst({
      where: {
        tenantId,
        type: 'DECES',
        commissionnaireId: { not: null },
      },
      orderBy: { dateDeclaration: 'desc' },
      include: {
        beneficiaire: true,
      },
    });

    if (!derniereAide || !derniereAide.commissionnaireId) {
      // Premier décès, désigner le premier membre
      return membresActifs[0];
    }

    // Trouver l'index du dernier commissionnaire
    const indexDernier = membresActifs.findIndex(
      (m) => m.id === derniereAide.commissionnaireId,
    );

    // Désigner le suivant (rotation circulaire)
    const indexSuivant = (indexDernier + 1) % membresActifs.length;
    return membresActifs[indexSuivant];
  }

  /**
   * Approuver une aide
   */
  async approuver(
    tenantId: string,
    aideId: string,
    approbateurId: string,
    dto: ApprouverAideDto,
  ) {
    // Vérifier que l'aide existe
    const aide = await this.prisma.aide.findFirst({
      where: { id: aideId, tenantId },
      include: {
        beneficiaire: {
          select: {
            numeroMembre: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    if (!aide) {
      throw new NotFoundException('Aide non trouvée');
    }

    if (aide.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Cette aide a déjà été traitée');
    }

    // Utiliser une transaction pour garantir la cohérence
    const result = await this.prisma.$transaction(async (tx) => {
      // Mettre à jour l'aide
      const aideApprouvee = await tx.aide.update({
        where: { id: aideId },
        data: {
          statut: 'APPROUVEE',
          dateApprobation: new Date(),
          approbateurId,
        },
        include: {
          beneficiaire: {
            select: {
              numeroMembre: true,
              nom: true,
              prenom: true,
            },
          },
        },
      });

      // Débiter la Caisse Fonds
      await this.caissesService.debiter(
        tenantId,
        'FONDS',
        Number(aide.montant),
        `Aide ${aide.type} - ${aide.beneficiaire.prenom} ${aide.beneficiaire.nom}`,
        approbateurId,
      );

      return aideApprouvee;
    });

    // TODO: Notifier le bénéficiaire

    return result;
  }

  /**
   * Rejeter une aide
   */
  async rejeter(tenantId: string, aideId: string, dto: RejeterAideDto) {
    // Vérifier que l'aide existe
    const aide = await this.prisma.aide.findFirst({
      where: { id: aideId, tenantId },
    });

    if (!aide) {
      throw new NotFoundException('Aide non trouvée');
    }

    if (aide.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Cette aide a déjà été traitée');
    }

    // Mettre à jour l'aide
    const aideRejetee = await this.prisma.aide.update({
      where: { id: aideId },
      data: {
        statut: 'REJETEE',
      },
      include: {
        beneficiaire: {
          select: {
            numeroMembre: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    // TODO: Notifier le bénéficiaire du rejet avec le motif

    return aideRejetee;
  }

  /**
   * Obtenir toutes les aides
   */
  async findAll(
    tenantId: string,
    filters: {
      type?: TypeAide;
      statut?: string;
      beneficiaireId?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: any = { tenantId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.statut) {
      where.statut = filters.statut;
    }

    if (filters.beneficiaireId) {
      where.beneficiaireId = filters.beneficiaireId;
    }

    const aides = await this.prisma.aide.findMany({
      where,
      include: {
        beneficiaire: {
          select: {
            numeroMembre: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: { dateDeclaration: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });

    return aides;
  }

  /**
   * Obtenir une aide par ID
   */
  async findOne(tenantId: string, id: string) {
    const aide = await this.prisma.aide.findFirst({
      where: { id, tenantId },
      include: {
        beneficiaire: {
          select: {
            numeroMembre: true,
            nom: true,
            prenom: true,
            telephone: true,
            email: true,
          },
        },
      },
    });

    if (!aide) {
      throw new NotFoundException('Aide non trouvée');
    }

    return aide;
  }

  /**
   * Obtenir les statistiques des aides
   */
  async getStatistiques(tenantId: string) {
    const aides = await this.prisma.aide.findMany({
      where: { tenantId },
    });

    const total = aides.length;
    const enAttente = aides.filter((a) => a.statut === 'EN_ATTENTE').length;
    const approuvees = aides.filter((a) => a.statut === 'APPROUVEE').length;
    const rejetees = aides.filter((a) => a.statut === 'REJETEE').length;

    const totalMaladie = aides.filter((a) => a.type === 'MALADIE').length;
    const totalDeces = aides.filter((a) => a.type === 'DECES').length;

    const montantTotal = aides
      .filter((a) => a.statut === 'APPROUVEE' || a.statut === 'VERSEE')
      .reduce((sum, a) => sum + Number(a.montant), 0);

    return {
      total,
      enAttente,
      approuvees,
      rejetees,
      totalMaladie,
      totalDeces,
      montantTotal,
    };
  }
}
