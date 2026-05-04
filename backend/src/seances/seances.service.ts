import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSeanceDto } from './dto/create-seance.dto.js';
import { EnregistrerPresencesDto } from './dto/enregistrer-presences.dto.js';
import { CollecterCotisationsDto } from './dto/collecter-cotisations.dto.js';
import { CloturerSeanceDto } from './dto/cloturer-seance.dto.js';
import { StatutSeance, StatutMembre } from '@prisma/client';

@Injectable()
export class SeancesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer une nouvelle séance hebdomadaire
   */
  async creer(tenantId: string, createSeanceDto: CreateSeanceDto) {
    // Vérifier qu'il n'existe pas déjà une séance pour cette date
    const seanceExistante = await this.prisma.seance.findFirst({
      where: {
        tenantId,
        date: new Date(createSeanceDto.date),
      },
    });

    if (seanceExistante) {
      throw new BadRequestException('Une séance existe déjà pour cette date');
    }

    // Récupérer tous les membres actifs
    const membresActifs = await this.prisma.membre.findMany({
      where: {
        tenantId,
        statut: StatutMembre.ACTIF,
      },
      select: {
        id: true,
      },
    });

    // Créer la séance avec les présences initialisées
    const seance = await this.prisma.seance.create({
      data: {
        tenantId,
        date: new Date(createSeanceDto.date),
        rapportSeance: createSeanceDto.rapportSeance,
        statut: StatutSeance.EN_COURS,
        presences: {
          create: membresActifs.map((membre) => ({
            membreId: membre.id,
            present: false, // Par défaut absent, sera mis à jour lors de l'enregistrement
          })),
        },
      },
      include: {
        presences: {
          include: {
            membre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
    });

    return seance;
  }

  /**
   * Récupérer toutes les séances
   */
  async findAll(tenantId: string) {
    return this.prisma.seance.findMany({
      where: { tenantId },
      include: {
        presences: {
          include: {
            membre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
        procesVerbal: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Récupérer une séance par ID
   */
  async findOne(tenantId: string, id: string) {
    const seance = await this.prisma.seance.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        presences: {
          include: {
            membre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                telephone: true,
              },
            },
          },
        },
        procesVerbal: true,
      },
    });

    if (!seance) {
      throw new NotFoundException('Séance non trouvée');
    }

    return seance;
  }

  /**
   * Enregistrer les présences pour une séance
   */
  async enregistrerPresences(
    tenantId: string,
    seanceId: string,
    enregistrerPresencesDto: EnregistrerPresencesDto,
  ) {
    // Vérifier que la séance existe et n'est pas clôturée
    const seance = await this.prisma.seance.findFirst({
      where: {
        id: seanceId,
        tenantId,
      },
    });

    if (!seance) {
      throw new NotFoundException('Séance non trouvée');
    }

    if (seance.statut === StatutSeance.CLOTUREE) {
      throw new BadRequestException('Impossible de modifier une séance clôturée');
    }

    // Mettre à jour les présences
    const updatePromises = enregistrerPresencesDto.presences.map((presence) =>
      this.prisma.presence.updateMany({
        where: {
          seanceId,
          membreId: presence.membreId,
        },
        data: {
          present: presence.present,
          justification: presence.justification,
        },
      }),
    );

    await Promise.all(updatePromises);

    // TODO: Déclencher les sanctions automatiques pour les absences non justifiées
    // Cela sera implémenté avec le Module Sanctions

    return this.findOne(tenantId, seanceId);
  }

  /**
   * Collecter les cotisations lors d'une séance
   */
  async collecterCotisations(
    tenantId: string,
    seanceId: string,
    collecterCotisationsDto: CollecterCotisationsDto,
  ) {
    // Vérifier que la séance existe et n'est pas clôturée
    const seance = await this.prisma.seance.findFirst({
      where: {
        id: seanceId,
        tenantId,
      },
    });

    if (!seance) {
      throw new NotFoundException('Séance non trouvée');
    }

    if (seance.statut === StatutSeance.CLOTUREE) {
      throw new BadRequestException('Impossible de modifier une séance clôturée');
    }

    // Traiter chaque cotisation dans une transaction
    await this.prisma.$transaction(async (tx) => {
      for (const cotisation of collecterCotisationsDto.cotisations) {
        // Cotisation Tontine -> Caisse Fonds
        if (cotisation.montantTontine > 0) {
          const caisseFonds = await tx.caisse.findFirst({
            where: {
              tenantId,
              type: 'FONDS',
            },
          });

          if (caisseFonds) {
            const nouveauSolde = caisseFonds.solde.toNumber() + cotisation.montantTontine;

            await tx.mouvement.create({
              data: {
                caisseId: caisseFonds.id,
                type: 'ENTREE',
                montant: cotisation.montantTontine,
                soldeApres: nouveauSolde,
                motif: `Cotisation tontine - Séance du ${seance.date.toLocaleDateString()}`,
                responsableId: cotisation.membreId,
                date: new Date(),
              },
            });

            await tx.caisse.update({
              where: { id: caisseFonds.id },
              data: { solde: nouveauSolde },
            });
          }
        }

        // Cotisation Épargne Annuelle -> Caisse Épargne
        if (cotisation.montantEpargneAnnuelle && cotisation.montantEpargneAnnuelle > 0) {
          const caisseEpargne = await tx.caisse.findFirst({
            where: {
              tenantId,
              type: 'EPARGNE',
            },
          });

          if (caisseEpargne) {
            const nouveauSolde = caisseEpargne.solde.toNumber() + cotisation.montantEpargneAnnuelle;

            await tx.mouvement.create({
              data: {
                caisseId: caisseEpargne.id,
                type: 'ENTREE',
                montant: cotisation.montantEpargneAnnuelle,
                soldeApres: nouveauSolde,
                motif: `Épargne annuelle - Séance du ${seance.date.toLocaleDateString()}`,
                responsableId: cotisation.membreId,
                date: new Date(),
              },
            });

            await tx.caisse.update({
              where: { id: caisseEpargne.id },
              data: { solde: nouveauSolde },
            });

            // Trouver ou créer l'épargne annuelle
            let epargneAnnuelle = await tx.epargne.findFirst({
              where: {
                tenantId,
                type: 'ANNUELLE',
                statut: 'ACTIF',
              },
            });

            if (!epargneAnnuelle) {
              epargneAnnuelle = await tx.epargne.create({
                data: {
                  tenantId,
                  type: 'ANNUELLE',
                  dateDebut: new Date(),
                  statut: 'ACTIF',
                },
              });
            }

            // Enregistrer la cotisation d'épargne
            await tx.cotisationEpargne.create({
              data: {
                epargneId: epargneAnnuelle.id,
                membreId: cotisation.membreId,
                montant: cotisation.montantEpargneAnnuelle,
                date: new Date(),
              },
            });
          }
        }

        // Cotisation Épargne Scolaire -> Caisse Épargne
        if (cotisation.montantEpargneScolaire && cotisation.montantEpargneScolaire > 0) {
          const caisseEpargne = await tx.caisse.findFirst({
            where: {
              tenantId,
              type: 'EPARGNE',
            },
          });

          if (caisseEpargne) {
            const nouveauSolde = caisseEpargne.solde.toNumber() + cotisation.montantEpargneScolaire;

            await tx.mouvement.create({
              data: {
                caisseId: caisseEpargne.id,
                type: 'ENTREE',
                montant: cotisation.montantEpargneScolaire,
                soldeApres: nouveauSolde,
                motif: `Épargne scolaire - Séance du ${seance.date.toLocaleDateString()}`,
                responsableId: cotisation.membreId,
                date: new Date(),
              },
            });

            await tx.caisse.update({
              where: { id: caisseEpargne.id },
              data: { solde: nouveauSolde },
            });

            // Trouver ou créer l'épargne scolaire
            let epargneScolaire = await tx.epargne.findFirst({
              where: {
                tenantId,
                type: 'SCOLAIRE',
                statut: 'ACTIF',
              },
            });

            if (!epargneScolaire) {
              epargneScolaire = await tx.epargne.create({
                data: {
                  tenantId,
                  type: 'SCOLAIRE',
                  dateDebut: new Date(),
                  statut: 'ACTIF',
                },
              });
            }

            // Enregistrer la cotisation d'épargne
            await tx.cotisationEpargne.create({
              data: {
                epargneId: epargneScolaire.id,
                membreId: cotisation.membreId,
                montant: cotisation.montantEpargneScolaire,
                date: new Date(),
              },
            });
          }
        }

        // Remboursement Prêt -> Caisse Fonds
        if (cotisation.montantRemboursementPret && cotisation.montantRemboursementPret > 0) {
          const caisseFonds = await tx.caisse.findFirst({
            where: {
              tenantId,
              type: 'FONDS',
            },
          });

          if (caisseFonds) {
            const nouveauSolde = caisseFonds.solde.toNumber() + cotisation.montantRemboursementPret;

            await tx.mouvement.create({
              data: {
                caisseId: caisseFonds.id,
                type: 'ENTREE',
                montant: cotisation.montantRemboursementPret,
                soldeApres: nouveauSolde,
                motif: `Remboursement prêt - Séance du ${seance.date.toLocaleDateString()}`,
                responsableId: cotisation.membreId,
                date: new Date(),
              },
            });

            await tx.caisse.update({
              where: { id: caisseFonds.id },
              data: { solde: nouveauSolde },
            });
          }
        }

        // TODO: Contributions Projets
        // Sera implémenté avec l'intégration du Module Projets
      }
    });

    return { message: 'Cotisations collectées avec succès' };
  }

  /**
   * Générer le procès-verbal d'une séance
   */
  async genererProcesVerbal(tenantId: string, seanceId: string) {
    const seance = await this.findOne(tenantId, seanceId);

    // Calculer les statistiques de présence
    const totalMembres = seance.presences.length;
    const presents = seance.presences.filter((p) => p.present).length;
    const absents = totalMembres - presents;
    const tauxPresence = totalMembres > 0 ? ((presents / totalMembres) * 100).toFixed(2) : '0';

    // Générer le contenu du PV
    const contenu = `
PROCÈS-VERBAL DE SÉANCE
Date: ${seance.date.toLocaleDateString('fr-FR')}

1. PRÉSENCES
   - Membres présents: ${presents}/${totalMembres} (${tauxPresence}%)
   - Membres absents: ${absents}

2. LISTE DES PRÉSENTS
${seance.presences
  .filter((p) => p.present)
  .map((p) => `   - ${p.membre.nom} ${p.membre.prenom}`)
  .join('\n')}

3. LISTE DES ABSENTS
${seance.presences
  .filter((p) => !p.present)
  .map((p) => `   - ${p.membre.nom} ${p.membre.prenom}${p.justification ? ` (Justifié: ${p.justification})` : ''}`)
  .join('\n')}

4. RAPPORT DE SÉANCE
${seance.rapportSeance || 'Aucun rapport'}

5. DÉCISIONS PRISES
(À compléter manuellement)

Fait à [Lieu], le ${new Date().toLocaleDateString('fr-FR')}

Signatures:
- Le Président: _________________
- Le Secrétaire: _________________
- Le Trésorier: _________________
    `.trim();

    // Créer ou mettre à jour le PV
    const procesVerbal = await this.prisma.procesVerbal.upsert({
      where: {
        seanceId,
      },
      create: {
        seanceId,
        contenu,
        signatures: [],
      },
      update: {
        contenu,
      },
    });

    return procesVerbal;
  }

  /**
   * Clôturer une séance
   */
  async cloturerSeance(
    tenantId: string,
    seanceId: string,
    cloturerSeanceDto: CloturerSeanceDto,
  ) {
    // Vérifier que la séance existe
    const seance = await this.prisma.seance.findFirst({
      where: {
        id: seanceId,
        tenantId,
      },
    });

    if (!seance) {
      throw new NotFoundException('Séance non trouvée');
    }

    if (seance.statut === StatutSeance.CLOTUREE) {
      throw new BadRequestException('La séance est déjà clôturée');
    }

    // Générer le PV si pas encore fait
    await this.genererProcesVerbal(tenantId, seanceId);

    // Clôturer la séance
    const seanceCloturee = await this.prisma.seance.update({
      where: { id: seanceId },
      data: {
        statut: StatutSeance.CLOTUREE,
        rapportSeance: cloturerSeanceDto.rapportFinal || seance.rapportSeance,
      },
      include: {
        presences: {
          include: {
            membre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
              },
            },
          },
        },
        procesVerbal: true,
      },
    });

    return seanceCloturee;
  }
}
