import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class MembresService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouveau membre
   */
  async create(
    tenantId: string,
    data: {
      nom: string;
      prenom: string;
      telephone: string;
      email?: string;
      dateNaissance?: Date;
      adresse?: string;
      situationMatrimoniale?: string;
      nombreEnfants?: number;
      parrainId?: string;
      userId?: string;
    },
  ) {
    // Générer le numéro de membre automatiquement
    const count = await this.prisma.membre.count({ where: { tenantId } });
    const numeroMembre = `M${(count + 1).toString().padStart(4, '0')}`;

    // Calculer le kit d'entrée (à configurer par tenant)
    const kitEntree = await this.calculateKitEntree(tenantId);

    const membre = await this.prisma.membre.create({
      data: {
        tenantId,
        numeroMembre,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        email: data.email,
        dateNaissance: data.dateNaissance,
        adresse: data.adresse,
        situationMatrimoniale: data.situationMatrimoniale,
        nombreEnfants: data.nombreEnfants || 0,
        parrainId: data.parrainId,
        userId: data.userId,
        statut: 'ACTIF',
      },
      include: {
        parrain: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroMembre: true,
          },
        },
      },
    });

    return {
      membre,
      kitEntree,
    };
  }

  /**
   * Calculer le kit d'entrée selon la configuration du tenant
   */
  async calculateKitEntree(tenantId: string): Promise<number> {
    // Récupérer la configuration du kit d'entrée
    const config = await this.prisma.configuration.findUnique({
      where: {
        tenantId_cle: {
          tenantId,
          cle: 'KIT_ENTREE',
        },
      },
    });

    if (config) {
      return parseFloat(config.valeur);
    }

    // Valeur par défaut si pas de configuration
    return 50000; // 50,000 FCFA par défaut
  }

  /**
   * Obtenir tous les membres avec pagination et filtres
   */
  async findAll(
    tenantId: string,
    options: {
      statut?: string;
      search?: string;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const { statut, search, limit = 50, offset = 0 } = options;

    const where: any = { tenantId };

    if (statut) {
      where.statut = statut;
    }

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { telephone: { contains: search } },
        { numeroMembre: { contains: search } },
      ];
    }

    const [membres, total] = await Promise.all([
      this.prisma.membre.findMany({
        where,
        include: {
          parrain: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              numeroMembre: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.membre.count({ where }),
    ]);

    return {
      membres,
      total,
      limit,
      offset,
    };
  }

  /**
   * Obtenir un membre par ID
   */
  async findOne(tenantId: string, id: string) {
    const membre = await this.prisma.membre.findFirst({
      where: { id, tenantId },
      include: {
        parrain: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroMembre: true,
          },
        },
        filleuls: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroMembre: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!membre) {
      throw new NotFoundException('Membre non trouvé');
    }

    return membre;
  }

  /**
   * Obtenir un membre par userId
   */
  async findByUserId(tenantId: string, userId: string) {
    const membre = await this.prisma.membre.findFirst({
      where: { userId, tenantId },
      include: {
        parrain: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroMembre: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!membre) {
      throw new NotFoundException('Profil membre non trouvé pour cet utilisateur');
    }

    return membre;
  }

  /**
   * Mettre à jour un membre
   */
  async update(
    tenantId: string,
    id: string,
    data: {
      nom?: string;
      prenom?: string;
      telephone?: string;
      email?: string;
      dateNaissance?: Date;
      adresse?: string;
      photoUrl?: string;
      cniUrl?: string;
    },
  ) {
    // Vérifier que le membre existe
    await this.findOne(tenantId, id);

    const membre = await this.prisma.membre.update({
      where: { id },
      data,
      include: {
        parrain: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroMembre: true,
          },
        },
      },
    });

    return membre;
  }

  /**
   * Changer le statut d'un membre
   */
  async changeStatus(
    tenantId: string,
    id: string,
    nouveauStatut: 'ACTIF' | 'OBSERVATION' | 'DEMISSIONNAIRE' | 'DECEDE' | 'MUTE',
    motif: string,
  ) {
    const membre = await this.findOne(tenantId, id);

    // Valider les transitions de statut
    this.validateStatusTransition(membre.statut, nouveauStatut);

    // Mettre à jour le statut
    const membreUpdated = await this.prisma.membre.update({
      where: { id },
      data: { statut: nouveauStatut },
    });

    // TODO: Calculer les montants dus/à restituer selon le statut
    // TODO: Déclencher les événements appropriés (ex: aide décès)

    return {
      membre: membreUpdated,
      motif,
      montantsDus: 0, // À calculer
      montantsARestituer: 0, // À calculer
    };
  }

  /**
   * Valider les transitions de statut
   */
  private validateStatusTransition(
    statutActuel: string,
    nouveauStatut: string,
  ) {
    // Transitions interdites
    const transitionsInterdites = [
      ['DECEDE', 'ACTIF'],
      ['DECEDE', 'OBSERVATION'],
      ['DECEDE', 'DEMISSIONNAIRE'],
      ['DECEDE', 'MUTE'],
    ];

    const transition = [statutActuel, nouveauStatut];
    const interdit = transitionsInterdites.some(
      (t) => t[0] === transition[0] && t[1] === transition[1],
    );

    if (interdit) {
      throw new BadRequestException(
        `Transition de ${statutActuel} vers ${nouveauStatut} non autorisée`,
      );
    }
  }

  /**
   * Calculer la situation nette d'un membre
   */
  async getSituationNette(tenantId: string, membreId: string) {
    const membre = await this.findOne(tenantId, membreId);

    // Cotisations tontines
    const partsTontine = await this.prisma.partTontine.findMany({
      where: { membreId },
      include: {
        tontine: {
          select: {
            nom: true,
            montantCotisation: true,
            statut: true,
          },
        },
      },
    });

    const cotisationsTontine = partsTontine
      .filter((p) => p.tontine.statut === 'ACTIVE')
      .reduce((sum, p) => {
        return sum + p.nombreParts * p.tontine.montantCotisation.toNumber();
      }, 0);

    // Cotisations épargne
    const cotisationsEpargne = await this.prisma.cotisationEpargne.aggregate({
      where: {
        membreId,
        epargne: {
          statut: 'ACTIF',
        },
      },
      _sum: {
        montant: true,
      },
    });

    const totalEpargne = cotisationsEpargne._sum.montant?.toNumber() || 0;

    // Prêts en cours
    const prets = await this.prisma.pret.findMany({
      where: {
        emprunteurId: membreId,
        statut: {
          in: ['EN_COURS', 'EN_RETARD'],
        },
      },
      include: {
        echeances: {
          where: {
            statut: {
              in: ['A_VENIR', 'EN_RETARD'],
            },
          },
        },
      },
    });

    const totalPrets = prets.reduce((sum, pret) => {
      const soldeRestant = pret.echeances.reduce(
        (s, e) => s + e.montantTotal.toNumber(),
        0,
      );
      return sum + soldeRestant;
    }, 0);

    // Sanctions impayées
    const sanctions = await this.prisma.sanction.aggregate({
      where: {
        membreId,
        statut: 'IMPAYEE',
      },
      _sum: {
        montant: true,
      },
      _count: true,
    });

    const totalSanctions = sanctions._sum.montant?.toNumber() || 0;

    // Contributions projets
    const contributionsProjets = await this.prisma.contributionProjet.aggregate({
      where: {
        membreId,
        projet: {
          statut: 'ACTIF',
        },
      },
      _sum: {
        montant: true,
      },
    });

    const totalProjets = contributionsProjets._sum.montant?.toNumber() || 0;

    // Calcul du solde net
    const creances = totalEpargne + totalProjets;
    const dettes = totalPrets + totalSanctions;
    const soldeNet = creances - dettes;

    return {
      membre: {
        id: membre.id,
        nom: membre.nom,
        prenom: membre.prenom,
        numeroMembre: membre.numeroMembre,
        statut: membre.statut,
      },
      cotisations: {
        tontine: cotisationsTontine,
        epargne: totalEpargne,
        projets: totalProjets,
      },
      dettes: {
        prets: totalPrets,
        sanctions: totalSanctions,
      },
      soldeNet,
      details: {
        nombrePartsTontine: partsTontine.length,
        nombrePrets: prets.length,
        nombreSanctions: sanctions._count || 0,
      },
    };
  }

  /**
   * Obtenir les statistiques des membres
   */
  async getStatistiques(tenantId: string) {
    const [total, actifs, observation, demissionnaires, decedes, mutes] =
      await Promise.all([
        this.prisma.membre.count({ where: { tenantId } }),
        this.prisma.membre.count({ where: { tenantId, statut: 'ACTIF' } }),
        this.prisma.membre.count({ where: { tenantId, statut: 'OBSERVATION' } }),
        this.prisma.membre.count({ where: { tenantId, statut: 'DEMISSIONNAIRE' } }),
        this.prisma.membre.count({ where: { tenantId, statut: 'DECEDE' } }),
        this.prisma.membre.count({ where: { tenantId, statut: 'MUTE' } }),
      ]);

    // Nouveaux membres ce mois
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const nouveauxCeMois = await this.prisma.membre.count({
      where: {
        tenantId,
        createdAt: {
          gte: debutMois,
        },
      },
    });

    return {
      total,
      parStatut: {
        actifs,
        observation,
        demissionnaires,
        decedes,
        mutes,
      },
      nouveauxCeMois,
    };
  }
}
