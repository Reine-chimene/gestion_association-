import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTypeSanctionDto } from './dto/create-type-sanction.dto.js';
import { UpdateTypeSanctionDto } from './dto/update-type-sanction.dto.js';
import { AppliquerSanctionDto } from './dto/appliquer-sanction.dto.js';
import { AnnulerSanctionDto } from './dto/annuler-sanction.dto.js';
import { ModeCalcul } from '@prisma/client';

@Injectable()
export class SanctionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouveau type de sanction
   */
  async createTypeSanction(tenantId: string, createTypeSanctionDto: CreateTypeSanctionDto) {
    // Valider les champs selon le mode de calcul
    if (createTypeSanctionDto.modeCalcul === ModeCalcul.FIXE) {
      if (!createTypeSanctionDto.montantFixe) {
        throw new BadRequestException('Le montant fixe est requis pour le mode FIXE');
      }
    } else if (createTypeSanctionDto.modeCalcul === ModeCalcul.POURCENTAGE) {
      if (!createTypeSanctionDto.pourcentage) {
        throw new BadRequestException('Le pourcentage est requis pour le mode POURCENTAGE');
      }
      if (createTypeSanctionDto.pourcentage < 0 || createTypeSanctionDto.pourcentage > 100) {
        throw new BadRequestException('Le pourcentage doit être entre 0 et 100');
      }
    }

    return this.prisma.typeSanction.create({
      data: {
        tenantId,
        nom: createTypeSanctionDto.nom,
        modeCalcul: createTypeSanctionDto.modeCalcul,
        montantFixe: createTypeSanctionDto.montantFixe,
        pourcentage: createTypeSanctionDto.pourcentage,
        joursDeGrace: createTypeSanctionDto.joursDeGrace,
        actif: createTypeSanctionDto.actif ?? true,
      },
    });
  }

  /**
   * Récupérer tous les types de sanctions
   */
  async findAllTypesSanctions(tenantId: string) {
    return this.prisma.typeSanction.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { sanctions: true },
        },
      },
      orderBy: {
        nom: 'asc',
      },
    });
  }

  /**
   * Récupérer un type de sanction par ID
   */
  async findOneTypeSanction(tenantId: string, id: string) {
    const typeSanction = await this.prisma.typeSanction.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        _count: {
          select: { sanctions: true },
        },
      },
    });

    if (!typeSanction) {
      throw new NotFoundException('Type de sanction non trouvé');
    }

    return typeSanction;
  }

  /**
   * Mettre à jour un type de sanction
   */
  async updateTypeSanction(
    tenantId: string,
    id: string,
    updateTypeSanctionDto: UpdateTypeSanctionDto,
  ) {
    // Vérifier que le type existe
    await this.findOneTypeSanction(tenantId, id);

    // Valider les champs selon le mode de calcul si fourni
    if (updateTypeSanctionDto.modeCalcul) {
      if (updateTypeSanctionDto.modeCalcul === ModeCalcul.FIXE) {
        if (!updateTypeSanctionDto.montantFixe) {
          throw new BadRequestException('Le montant fixe est requis pour le mode FIXE');
        }
      } else if (updateTypeSanctionDto.modeCalcul === ModeCalcul.POURCENTAGE) {
        if (!updateTypeSanctionDto.pourcentage) {
          throw new BadRequestException('Le pourcentage est requis pour le mode POURCENTAGE');
        }
        if (updateTypeSanctionDto.pourcentage < 0 || updateTypeSanctionDto.pourcentage > 100) {
          throw new BadRequestException('Le pourcentage doit être entre 0 et 100');
        }
      }
    }

    return this.prisma.typeSanction.update({
      where: { id },
      data: updateTypeSanctionDto,
    });
  }

  /**
   * Supprimer un type de sanction
   */
  async removeTypeSanction(tenantId: string, id: string) {
    // Vérifier que le type existe
    const typeSanction = await this.findOneTypeSanction(tenantId, id);

    // Vérifier qu'il n'y a pas de sanctions associées
    const sanctionsCount = await this.prisma.sanction.count({
      where: { typeSanctionId: id },
    });

    if (sanctionsCount > 0) {
      throw new BadRequestException(
        'Impossible de supprimer un type de sanction avec des sanctions associées',
      );
    }

    await this.prisma.typeSanction.delete({
      where: { id },
    });

    return { message: 'Type de sanction supprimé avec succès' };
  }

  /**
   * Appliquer une sanction à un membre
   */
  async appliquerSanction(tenantId: string, appliquerSanctionDto: AppliquerSanctionDto) {
    // Vérifier que le membre existe
    const membre = await this.prisma.membre.findFirst({
      where: {
        id: appliquerSanctionDto.membreId,
        tenantId,
      },
    });

    if (!membre) {
      throw new NotFoundException('Membre non trouvé');
    }

    // Vérifier que le type de sanction existe et est actif
    const typeSanction = await this.prisma.typeSanction.findFirst({
      where: {
        id: appliquerSanctionDto.typeSanctionId,
        tenantId,
        actif: true,
      },
    });

    if (!typeSanction) {
      throw new NotFoundException('Type de sanction non trouvé ou inactif');
    }

    // Créer la sanction et créditer la Caisse Sanction
    return this.prisma.$transaction(async (tx) => {
      // Créer la sanction
      const sanction = await tx.sanction.create({
        data: {
          tenantId,
          membreId: appliquerSanctionDto.membreId,
          typeSanctionId: appliquerSanctionDto.typeSanctionId,
          montant: appliquerSanctionDto.montant,
          motif: appliquerSanctionDto.motif,
          statut: 'IMPAYEE',
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
          typeSanction: true,
        },
      });

      // Créditer la Caisse Sanction
      const caisseSanction = await tx.caisse.findFirst({
        where: {
          tenantId,
          type: 'SANCTION',
        },
      });

      if (caisseSanction) {
        const nouveauSolde = caisseSanction.solde.toNumber() + appliquerSanctionDto.montant;

        await tx.mouvement.create({
          data: {
            caisseId: caisseSanction.id,
            type: 'ENTREE',
            montant: appliquerSanctionDto.montant,
            soldeApres: nouveauSolde,
            motif: `Sanction: ${appliquerSanctionDto.motif}`,
            responsableId: appliquerSanctionDto.membreId,
            date: new Date(),
          },
        });

        await tx.caisse.update({
          where: { id: caisseSanction.id },
          data: { solde: nouveauSolde },
        });
      }

      return sanction;
    });
  }

  /**
   * Calculer le montant d'une sanction selon le type
   */
  async calculerMontantSanction(
    tenantId: string,
    typeSanctionId: string,
    montantBase?: number,
    nombreJoursRetard?: number,
  ): Promise<number> {
    const typeSanction = await this.findOneTypeSanction(tenantId, typeSanctionId);

    switch (typeSanction.modeCalcul) {
      case ModeCalcul.FIXE:
        return typeSanction.montantFixe?.toNumber() || 0;

      case ModeCalcul.POURCENTAGE:
        if (!montantBase) {
          throw new BadRequestException('Le montant de base est requis pour le calcul en pourcentage');
        }
        const pourcentage = typeSanction.pourcentage?.toNumber() || 0;
        return (montantBase * pourcentage) / 100;

      case ModeCalcul.PROGRESSIF:
        if (!nombreJoursRetard) {
          throw new BadRequestException('Le nombre de jours de retard est requis pour le calcul progressif');
        }
        // Calcul progressif: montant fixe × nombre de jours de retard
        const montantFixe = typeSanction.montantFixe?.toNumber() || 0;
        return montantFixe * nombreJoursRetard;

      default:
        return 0;
    }
  }

  /**
   * Récupérer toutes les sanctions
   */
  async findAllSanctions(tenantId: string, membreId?: string, statut?: string) {
    return this.prisma.sanction.findMany({
      where: {
        tenantId,
        ...(membreId && { membreId }),
        ...(statut && { statut }),
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
        typeSanction: true,
      },
      orderBy: {
        dateApplication: 'desc',
      },
    });
  }

  /**
   * Récupérer une sanction par ID
   */
  async findOneSanction(tenantId: string, id: string) {
    const sanction = await this.prisma.sanction.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        membre: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            numeroMembre: true,
            telephone: true,
          },
        },
        typeSanction: true,
      },
    });

    if (!sanction) {
      throw new NotFoundException('Sanction non trouvée');
    }

    return sanction;
  }

  /**
   * Annuler une sanction
   */
  async annulerSanction(
    tenantId: string,
    id: string,
    annulerSanctionDto: AnnulerSanctionDto,
  ) {
    // Vérifier que la sanction existe
    const sanction = await this.findOneSanction(tenantId, id);

    if (sanction.statut === 'ANNULEE') {
      throw new BadRequestException('La sanction est déjà annulée');
    }

    // Annuler la sanction et débiter la Caisse Sanction si déjà payée
    return this.prisma.$transaction(async (tx) => {
      // Mettre à jour la sanction
      const sanctionAnnulee = await tx.sanction.update({
        where: { id },
        data: {
          statut: 'ANNULEE',
          motif: `${sanction.motif} - ANNULÉE: ${annulerSanctionDto.justification}`,
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
          typeSanction: true,
        },
      });

      // Si la sanction était payée, rembourser
      if (sanction.statut === 'PAYEE') {
        const caisseSanction = await tx.caisse.findFirst({
          where: {
            tenantId,
            type: 'SANCTION',
          },
        });

        if (caisseSanction) {
          const nouveauSolde = caisseSanction.solde.toNumber() - sanction.montant.toNumber();

          await tx.mouvement.create({
            data: {
              caisseId: caisseSanction.id,
              type: 'SORTIE',
              montant: sanction.montant.toNumber(),
              soldeApres: nouveauSolde,
              motif: `Remboursement sanction annulée: ${annulerSanctionDto.justification}`,
              responsableId: sanction.membreId,
              date: new Date(),
            },
          });

          await tx.caisse.update({
            where: { id: caisseSanction.id },
            data: { solde: nouveauSolde },
          });
        }
      }

      return sanctionAnnulee;
    });
  }

  /**
   * Marquer une sanction comme payée
   */
  async marquerPayee(tenantId: string, id: string) {
    // Vérifier que la sanction existe
    const sanction = await this.findOneSanction(tenantId, id);

    if (sanction.statut === 'PAYEE') {
      throw new BadRequestException('La sanction est déjà payée');
    }

    if (sanction.statut === 'ANNULEE') {
      throw new BadRequestException('Impossible de marquer comme payée une sanction annulée');
    }

    return this.prisma.sanction.update({
      where: { id },
      data: {
        statut: 'PAYEE',
        datePaiement: new Date(),
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
        typeSanction: true,
      },
    });
  }

  /**
   * Récupérer les sanctions d'un membre
   */
  async getSanctionsByMembre(tenantId: string, membreId: string) {
    return this.findAllSanctions(tenantId, membreId);
  }

  /**
   * Calculer le total des sanctions impayées d'un membre
   */
  async getTotalSanctionsImpayees(tenantId: string, membreId: string): Promise<number> {
    const sanctions = await this.prisma.sanction.findMany({
      where: {
        tenantId,
        membreId,
        statut: 'IMPAYEE',
      },
    });

    return sanctions.reduce((total, sanction) => total + sanction.montant.toNumber(), 0);
  }
}
