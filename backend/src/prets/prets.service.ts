import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePretDto, TypePret } from './dto/create-pret.dto.js';
import { EnregistrerPaiementDto } from './dto/enregistrer-paiement.dto.js';
import { ReconduirePretDto } from './dto/reconduire-pret.dto.js';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PretsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouveau prêt
   */
  async create(tenantId: string, responsableId: string, dto: CreatePretDto) {
    // Vérifier que l'emprunteur existe
    const emprunteur = await this.prisma.membre.findFirst({
      where: { id: dto.emprunteurId, tenantId },
    });

    if (!emprunteur) {
      throw new NotFoundException('Emprunteur non trouvé');
    }

    // Vérifier qu'il y a au moins une garantie
    if (!dto.garanties || dto.garanties.length === 0) {
      throw new BadRequestException('Au moins une garantie est requise');
    }

    // Vérifier la caisse fonds
    const caisseFonds = await this.prisma.caisse.findFirst({
      where: { tenantId, type: 'FONDS' },
    });

    if (!caisseFonds) {
      throw new NotFoundException('Caisse Fonds non trouvée');
    }

    if (Number(caisseFonds.solde) < dto.montant) {
      throw new BadRequestException('Solde insuffisant dans la Caisse Fonds');
    }

    // Calculer les intérêts totaux
    const interetsTotal = this.calculerInteretsSimples(
      dto.montant,
      dto.tauxInteret,
      dto.dureeEnMois,
    );

    const montantTotal = dto.montant + interetsTotal;

    // Calculer la date d'échéance finale
    const dateEcheance = new Date();
    dateEcheance.setMonth(dateEcheance.getMonth() + dto.dureeEnMois);

    return this.prisma.$transaction(async (tx) => {
      // Créer le prêt
      const pret = await tx.pret.create({
        data: {
          tenantId,
          emprunteurId: dto.emprunteurId,
          type: dto.type,
          montant: new Decimal(dto.montant),
          tauxInteret: new Decimal(dto.tauxInteret),
          dureeEnMois: dto.dureeEnMois,
          montantTotal: new Decimal(montantTotal),
          soldeRestant: new Decimal(montantTotal),
          motif: dto.motif,
          statut: 'EN_COURS',
          dateOctroi: new Date(),
          dateEcheance,
          notes: dto.notes,
          garanties: {
            create: dto.garanties.map((g) => ({
              tenantId,
              type: g.type,
              description: g.description,
              valeurEstimee: new Decimal(g.valeurEstimee),
              documentUrl: g.documentUrl,
            })),
          },
          coEmprunteurs: dto.coEmprunteurs
            ? {
                create: dto.coEmprunteurs.map((ce) => ({
                  tenantId,
                  membreId: ce.membreId,
                  partResponsabilite: new Decimal(ce.partResponsabilite),
                })),
              }
            : undefined,
        },
        include: {
          emprunteur: {
            select: {
              numeroMembre: true,
              nom: true,
              prenom: true,
            },
          },
          garanties: true,
          coEmprunteurs: {
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
        },
      });

      // Générer l'échéancier
      await this.genererEcheancier(tx, tenantId, pret.id, dto.montant, interetsTotal, dto.dureeEnMois);

      // Débiter la Caisse Fonds
      await tx.caisse.update({
        where: { id: caisseFonds.id },
        data: {
          solde: { decrement: dto.montant },
        },
      });

      // Enregistrer le mouvement
      await tx.mouvement.create({
        data: {
          caisseId: caisseFonds.id,
          type: 'SORTIE',
          montant: new Decimal(dto.montant),
          motif: `Prêt ${dto.type} accordé à ${emprunteur.prenom} ${emprunteur.nom}`,
          soldeApres: new Decimal(Number(caisseFonds.solde) - dto.montant),
          date: new Date(),
          responsableId,
        },
      });

      return pret;
    });
  }

  /**
   * Calculer les intérêts simples
   */
  private calculerInteretsSimples(montant: number, tauxAnnuel: number, dureeEnMois: number): number {
    return (montant * tauxAnnuel * dureeEnMois) / (100 * 12);
  }

  /**
   * Générer l'échéancier mensuel
   */
  private async genererEcheancier(
    tx: any,
    tenantId: string,
    pretId: string,
    montantCapital: number,
    interetsTotal: number,
    dureeEnMois: number,
  ) {
    const montantMensuel = (montantCapital + interetsTotal) / dureeEnMois;
    const capitalMensuel = montantCapital / dureeEnMois;
    const interetsMensuel = interetsTotal / dureeEnMois;

    const echeances = [];
    const dateOctroi = new Date();

    for (let i = 1; i <= dureeEnMois; i++) {
      const dateEcheance = new Date(dateOctroi);
      dateEcheance.setMonth(dateEcheance.getMonth() + i);

      echeances.push({
        pretId,
        numeroEcheance: i,
        dateEcheance,
        montantCapital: new Decimal(capitalMensuel),
        montantInterets: new Decimal(interetsMensuel),
        montantTotal: new Decimal(montantMensuel),
        montantPaye: new Decimal(0),
        statut: 'EN_ATTENTE',
      });
    }

    await tx.echeance.createMany({
      data: echeances,
    });
  }

  /**
   * Obtenir tous les prêts
   */
  async findAll(
    tenantId: string,
    filters?: {
      statut?: string;
      type?: string;
      emprunteurId?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: any = { tenantId };

    if (filters?.statut) {
      where.statut = filters.statut;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.emprunteurId) {
      where.emprunteurId = filters.emprunteurId;
    }

    return this.prisma.pret.findMany({
      where,
      include: {
        emprunteur: {
          select: {
            numeroMembre: true,
            nom: true,
            prenom: true,
          },
        },
        garanties: true,
        coEmprunteurs: {
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
            echeances: true,
            paiements: true,
          },
        },
      },
      orderBy: { dateOctroi: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  }

  /**
   * Obtenir un prêt par ID
   */
  async findOne(tenantId: string, id: string) {
    const pret = await this.prisma.pret.findFirst({
      where: { id, tenantId },
      include: {
        emprunteur: {
          select: {
            numeroMembre: true,
            nom: true,
            prenom: true,
            telephone: true,
            email: true,
          },
        },
        garanties: true,
        coEmprunteurs: {
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
        echeances: {
          orderBy: { numeroEcheance: 'asc' },
        },
        paiements: {
          orderBy: { datePaiement: 'desc' },
        },
      },
    });

    if (!pret) {
      throw new NotFoundException('Prêt non trouvé');
    }

    return pret;
  }

  /**
   * Enregistrer un paiement
   */
  async enregistrerPaiement(
    tenantId: string,
    pretId: string,
    responsableId: string,
    dto: EnregistrerPaiementDto,
  ) {
    const pret = await this.findOne(tenantId, pretId);

    const echeance = await this.prisma.echeance.findFirst({
      where: { id: dto.echeanceId, pretId },
    });

    if (!echeance) {
      throw new NotFoundException('Échéance non trouvée');
    }

    if (echeance.statut === 'PAYEE') {
      throw new BadRequestException('Cette échéance est déjà payée');
    }

    // Vérifier la caisse fonds
    const caisseFonds = await this.prisma.caisse.findFirst({
      where: { tenantId, type: 'FONDS' },
    });

    if (!caisseFonds) {
      throw new NotFoundException('Caisse Fonds non trouvée');
    }

    return this.prisma.$transaction(async (tx) => {
      // Enregistrer le paiement
      const paiement = await tx.paiement.create({
        data: {
          tenantId,
          pretId,
          echeanceId: dto.echeanceId,
          montant: new Decimal(dto.montant),
          datePaiement: new Date(),
          notes: dto.notes,
        },
      });

      // Mettre à jour l'échéance
      const montantPaye = Number(echeance.montantPaye || 0) + dto.montant;
      const montantTotal = Number(echeance.montantTotal);

      await tx.echeance.update({
        where: { id: dto.echeanceId },
        data: {
          montantPaye: new Decimal(montantPaye),
          statut: montantPaye >= montantTotal ? 'PAYEE' : 'PARTIELLE',
        },
      });

      // Mettre à jour le solde restant du prêt
      const nouveauSolde = Number(pret.soldeRestant) - dto.montant;
      await tx.pret.update({
        where: { id: pretId },
        data: {
          soldeRestant: new Decimal(Math.max(0, nouveauSolde)),
          statut: nouveauSolde <= 0 ? 'SOLDE' : 'EN_COURS',
        },
      });

      // Créditer la Caisse Fonds
      await tx.caisse.update({
        where: { id: caisseFonds.id },
        data: {
          solde: { increment: dto.montant },
        },
      });

      // Enregistrer le mouvement
      await tx.mouvement.create({
        data: {
          caisseId: caisseFonds.id,
          type: 'ENTREE',
          montant: new Decimal(dto.montant),
          motif: `Remboursement prêt - ${pret.emprunteur.prenom} ${pret.emprunteur.nom}`,
          soldeApres: new Decimal(Number(caisseFonds.solde) + dto.montant),
          date: new Date(),
          responsableId,
        },
      });

      return paiement;
    });
  }

  /**
   * Reconduire un prêt
   */
  async reconduire(tenantId: string, pretId: string, dto: ReconduirePretDto) {
    const pret = await this.findOne(tenantId, pretId);

    if (pret.statut === 'SOLDE') {
      throw new BadRequestException('Ce prêt est déjà soldé');
    }

    if (pret.nombreReconductions >= 2) {
      throw new BadRequestException('Nombre maximum de reconductions atteint (2)');
    }

    const nouveauTaux = dto.nouveauTauxInteret ?? Number(pret.tauxInteret);
    const soldeRestant = Number(pret.soldeRestant);

    // Calculer les nouveaux intérêts
    const nouveauxInterets = this.calculerInteretsSimples(
      soldeRestant,
      nouveauTaux,
      dto.nouvelledureeEnMois,
    );

    const nouveauMontantTotal = soldeRestant + nouveauxInterets;

    return this.prisma.$transaction(async (tx) => {
      // Mettre à jour le prêt
      await tx.pret.update({
        where: { id: pretId },
        data: {
          dureeEnMois: { increment: dto.nouvelledureeEnMois },
          tauxInteret: new Decimal(nouveauTaux),
          montantTotal: new Decimal(nouveauMontantTotal),
          soldeRestant: new Decimal(nouveauMontantTotal),
          nombreReconductions: { increment: 1 },
          notes: pret.notes
            ? `${pret.notes}\n\nReconduction: ${dto.motif || 'Aucun motif'}`
            : `Reconduction: ${dto.motif || 'Aucun motif'}`,
        },
      });

      // Supprimer les anciennes échéances non payées
      await tx.echeance.deleteMany({
        where: {
          pretId,
          statut: { in: ['EN_ATTENTE', 'EN_RETARD'] },
        },
      });

      // Générer le nouvel échéancier
      await this.genererEcheancier(
        tx,
        tenantId,
        pretId,
        soldeRestant,
        nouveauxInterets,
        dto.nouvelledureeEnMois,
      );

      return this.findOne(tenantId, pretId);
    });
  }

  /**
   * Obtenir l'échéancier d'un prêt
   */
  async getEcheancier(tenantId: string, pretId: string) {
    await this.findOne(tenantId, pretId); // Vérifier que le prêt existe

    return this.prisma.echeance.findMany({
      where: { pretId },
      orderBy: { numeroEcheance: 'asc' },
    });
  }

  /**
   * Obtenir le solde restant d'un prêt
   */
  async getSoldeRestant(tenantId: string, pretId: string) {
    const pret = await this.findOne(tenantId, pretId);

    return {
      pretId: pret.id,
      montantInitial: pret.montant,
      montantTotal: pret.montantTotal,
      soldeRestant: pret.soldeRestant,
      montantPaye: Number(pret.montantTotal) - Number(pret.soldeRestant),
      pourcentagePaye: ((Number(pret.montantTotal) - Number(pret.soldeRestant)) / Number(pret.montantTotal)) * 100,
      statut: pret.statut,
    };
  }

  /**
   * Déclencher le recouvrement forcé
   */
  async declencherRecouvrementForce(tenantId: string, pretId: string, responsableId: string) {
    const pret = await this.findOne(tenantId, pretId);

    if (pret.statut === 'SOLDE') {
      throw new BadRequestException('Ce prêt est déjà soldé');
    }

    // Vérifier s'il y a des échéances en retard
    const echeancesEnRetard = pret.echeances.filter(
      (e: any) => e.statut === 'EN_RETARD' || (e.statut === 'EN_ATTENTE' && new Date(e.dateEcheance) < new Date()),
    );

    if (echeancesEnRetard.length === 0) {
      throw new BadRequestException('Aucune échéance en retard');
    }

    // Marquer le prêt comme en recouvrement
    await this.prisma.pret.update({
      where: { id: pretId },
      data: {
        statut: 'RECOUVREMENT',
        notes: pret.notes
          ? `${pret.notes}\n\nRecouvrement forcé déclenché le ${new Date().toLocaleDateString('fr-FR')}`
          : `Recouvrement forcé déclenché le ${new Date().toLocaleDateString('fr-FR')}`,
      },
    });

    // TODO: Implémenter la logique de prélèvement automatique sur tontine/épargne
    // TODO: Envoyer des notifications

    return {
      message: 'Recouvrement forcé déclenché',
      pretId,
      echeancesEnRetard: echeancesEnRetard.length,
      montantDu: echeancesEnRetard.reduce((sum: number, e: any) => sum + Number(e.montantTotal) - Number(e.montantPaye || 0), 0),
    };
  }

  /**
   * Obtenir les statistiques des prêts
   */
  async getStatistiques(tenantId: string) {
    const [total, enCours, soldes, enRetard, montantPrete, montantRembourse] = await Promise.all([
      this.prisma.pret.count({ where: { tenantId } }),
      this.prisma.pret.count({ where: { tenantId, statut: 'EN_COURS' } }),
      this.prisma.pret.count({ where: { tenantId, statut: 'SOLDE' } }),
      this.prisma.pret.count({ where: { tenantId, statut: 'EN_RETARD' } }),
      this.prisma.pret.aggregate({
        where: { tenantId },
        _sum: { montant: true },
      }),
      this.prisma.paiement.aggregate({
        where: { tenantId },
        _sum: { montant: true },
      }),
    ]);

    const montantPreteTotal = Number(montantPrete._sum?.montant || 0);
    const montantRemb = Number(montantRembourse._sum?.montant || 0);

    return {
      total,
      enCours,
      soldes,
      enRetard,
      montantTotal: montantPreteTotal,
      montantRembourse: montantRemb,
      tauxRecouvrement: montantPreteTotal > 0 ? (montantRemb / montantPreteTotal) * 100 : 0,
    };
  }
}
