import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CaissesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtenir ou créer une caisse pour un tenant
   */
  async getCaisse(tenantId: string, type: 'FONDS' | 'SANCTION' | 'EPARGNE') {
    let caisse = await this.prisma.caisse.findUnique({
      where: {
        tenantId_type: {
          tenantId,
          type,
        },
      },
    });

    if (!caisse) {
      caisse = await this.prisma.caisse.create({
        data: {
          tenantId,
          type,
          solde: new Decimal(0),
        },
      });
    }

    return caisse;
  }

  /**
   * Créditer une caisse
   */
  async crediter(
    tenantId: string,
    type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    montant: number,
    motif: string,
    responsableId: string,
    reference?: string,
  ) {
    if (montant <= 0) {
      throw new BadRequestException('Le montant doit être positif');
    }

    const caisse = await this.getCaisse(tenantId, type);

    const nouveauSolde = new Decimal(caisse.solde.toString()).plus(montant);

    // Mettre à jour la caisse et créer le mouvement dans une transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const caisseUpdated = await tx.caisse.update({
        where: { id: caisse.id },
        data: { solde: nouveauSolde },
      });

      const mouvement = await tx.mouvement.create({
        data: {
          caisseId: caisse.id,
          type: 'ENTREE',
          montant: new Decimal(montant),
          soldeApres: nouveauSolde,
          motif,
          reference,
          responsableId,
        },
      });

      return { caisse: caisseUpdated, mouvement };
    });

    return result;
  }

  /**
   * Débiter une caisse
   */
  async debiter(
    tenantId: string,
    type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    montant: number,
    motif: string,
    responsableId: string,
    reference?: string,
  ) {
    if (montant <= 0) {
      throw new BadRequestException('Le montant doit être positif');
    }

    const caisse = await this.getCaisse(tenantId, type);

    const soldeActuel = new Decimal(caisse.solde.toString());
    if (soldeActuel.lessThan(montant)) {
      throw new BadRequestException('Solde insuffisant dans la caisse');
    }

    const nouveauSolde = soldeActuel.minus(montant);

    // Mettre à jour la caisse et créer le mouvement dans une transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const caisseUpdated = await tx.caisse.update({
        where: { id: caisse.id },
        data: { solde: nouveauSolde },
      });

      const mouvement = await tx.mouvement.create({
        data: {
          caisseId: caisse.id,
          type: 'SORTIE',
          montant: new Decimal(montant),
          soldeApres: nouveauSolde,
          motif,
          reference,
          responsableId,
        },
      });

      return { caisse: caisseUpdated, mouvement };
    });

    return result;
  }

  /**
   * Décharge (sortie avec justification obligatoire)
   */
  async decharge(
    tenantId: string,
    type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    montant: number,
    motif: string,
    justification: string,
    responsableId: string,
  ) {
    if (!justification || justification.trim().length === 0) {
      throw new BadRequestException('La justification est obligatoire pour une décharge');
    }

    if (montant <= 0) {
      throw new BadRequestException('Le montant doit être positif');
    }

    const caisse = await this.getCaisse(tenantId, type);

    const soldeActuel = new Decimal(caisse.solde.toString());
    if (soldeActuel.lessThan(montant)) {
      throw new BadRequestException('Solde insuffisant dans la caisse');
    }

    const nouveauSolde = soldeActuel.minus(montant);

    // Mettre à jour la caisse et créer le mouvement dans une transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const caisseUpdated = await tx.caisse.update({
        where: { id: caisse.id },
        data: { solde: nouveauSolde },
      });

      const mouvement = await tx.mouvement.create({
        data: {
          caisseId: caisse.id,
          type: 'SORTIE',
          montant: new Decimal(montant),
          soldeApres: nouveauSolde,
          motif: `DÉCHARGE: ${motif}`,
          justification,
          responsableId,
        },
      });

      return { caisse: caisseUpdated, mouvement };
    });

    return result;
  }

  /**
   * Versement bancaire (entrée avec référence obligatoire)
   */
  async versementBancaire(
    tenantId: string,
    type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    montant: number,
    motif: string,
    reference: string,
    responsableId: string,
  ) {
    if (!reference || reference.trim().length === 0) {
      throw new BadRequestException('La référence bancaire est obligatoire');
    }

    if (montant <= 0) {
      throw new BadRequestException('Le montant doit être positif');
    }

    const caisse = await this.getCaisse(tenantId, type);

    const nouveauSolde = new Decimal(caisse.solde.toString()).plus(montant);

    // Mettre à jour la caisse et créer le mouvement dans une transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const caisseUpdated = await tx.caisse.update({
        where: { id: caisse.id },
        data: { solde: nouveauSolde },
      });

      const mouvement = await tx.mouvement.create({
        data: {
          caisseId: caisse.id,
          type: 'ENTREE',
          montant: new Decimal(montant),
          soldeApres: nouveauSolde,
          motif: `VERSEMENT BANCAIRE: ${motif}`,
          reference,
          responsableId,
        },
      });

      return { caisse: caisseUpdated, mouvement };
    });

    return result;
  }

  /**
   * Obtenir le solde d'une caisse
   */
  async getSolde(tenantId: string, type: 'FONDS' | 'SANCTION' | 'EPARGNE') {
    const caisse = await this.getCaisse(tenantId, type);
    return {
      type: caisse.type,
      solde: caisse.solde.toNumber(),
      updatedAt: caisse.updatedAt,
    };
  }

  /**
   * Obtenir l'historique des mouvements d'une caisse
   */
  async getHistorique(
    tenantId: string,
    type: 'FONDS' | 'SANCTION' | 'EPARGNE',
    dateDebut?: Date,
    dateFin?: Date,
    limit: number = 50,
    offset: number = 0,
  ) {
    const caisse = await this.getCaisse(tenantId, type);

    const where: any = {
      caisseId: caisse.id,
    };

    if (dateDebut || dateFin) {
      where.date = {};
      if (dateDebut) {
        where.date.gte = dateDebut;
      }
      if (dateFin) {
        where.date.lte = dateFin;
      }
    }

    const [mouvements, total] = await Promise.all([
      this.prisma.mouvement.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.mouvement.count({ where }),
    ]);

    return {
      mouvements: mouvements.map((m) => ({
        ...m,
        montant: m.montant.toNumber(),
        soldeApres: m.soldeApres.toNumber(),
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Vérifier la cohérence d'une caisse
   * Vérifie que solde = somme(entrées) - somme(sorties)
   */
  async verifierCoherence(tenantId: string, type: 'FONDS' | 'SANCTION' | 'EPARGNE') {
    const caisse = await this.getCaisse(tenantId, type);

    const mouvements = await this.prisma.mouvement.findMany({
      where: { caisseId: caisse.id },
    });

    let soldeCalcule = new Decimal(0);

    for (const mouvement of mouvements) {
      if (mouvement.type === 'ENTREE') {
        soldeCalcule = soldeCalcule.plus(mouvement.montant);
      } else {
        soldeCalcule = soldeCalcule.minus(mouvement.montant);
      }
    }

    const soldeActuel = new Decimal(caisse.solde.toString());
    const coherent = soldeCalcule.equals(soldeActuel);

    return {
      coherent,
      soldeActuel: soldeActuel.toNumber(),
      soldeCalcule: soldeCalcule.toNumber(),
      difference: soldeActuel.minus(soldeCalcule).toNumber(),
      nombreMouvements: mouvements.length,
    };
  }

  /**
   * Obtenir toutes les caisses d'un tenant
   */
  async getAllCaisses(tenantId: string) {
    const types: Array<'FONDS' | 'SANCTION' | 'EPARGNE'> = ['FONDS', 'SANCTION', 'EPARGNE'];
    
    const caisses = await Promise.all(
      types.map(async (type) => {
        const caisse = await this.getCaisse(tenantId, type);
        return {
          type: caisse.type,
          solde: caisse.solde.toNumber(),
          updatedAt: caisse.updatedAt,
        };
      }),
    );

    return caisses;
  }
}
