"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeancesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const client_1 = require("@prisma/client");
let SeancesService = class SeancesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async creer(tenantId, createSeanceDto) {
        const seanceExistante = await this.prisma.seance.findFirst({
            where: {
                tenantId,
                date: new Date(createSeanceDto.date),
            },
        });
        if (seanceExistante) {
            throw new common_1.BadRequestException('Une séance existe déjà pour cette date');
        }
        const membresActifs = await this.prisma.membre.findMany({
            where: {
                tenantId,
                statut: client_1.StatutMembre.ACTIF,
            },
            select: {
                id: true,
            },
        });
        const seance = await this.prisma.seance.create({
            data: {
                tenantId,
                date: new Date(createSeanceDto.date),
                rapportSeance: createSeanceDto.rapportSeance,
                statut: client_1.StatutSeance.EN_COURS,
                presences: {
                    create: membresActifs.map((membre) => ({
                        membreId: membre.id,
                        present: false,
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
    async findAll(tenantId) {
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
    async findOne(tenantId, id) {
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
            throw new common_1.NotFoundException('Séance non trouvée');
        }
        return seance;
    }
    async enregistrerPresences(tenantId, seanceId, enregistrerPresencesDto) {
        const seance = await this.prisma.seance.findFirst({
            where: {
                id: seanceId,
                tenantId,
            },
        });
        if (!seance) {
            throw new common_1.NotFoundException('Séance non trouvée');
        }
        if (seance.statut === client_1.StatutSeance.CLOTUREE) {
            throw new common_1.BadRequestException('Impossible de modifier une séance clôturée');
        }
        const updatePromises = enregistrerPresencesDto.presences.map((presence) => this.prisma.presence.updateMany({
            where: {
                seanceId,
                membreId: presence.membreId,
            },
            data: {
                present: presence.present,
                justification: presence.justification,
            },
        }));
        await Promise.all(updatePromises);
        return this.findOne(tenantId, seanceId);
    }
    async collecterCotisations(tenantId, seanceId, collecterCotisationsDto) {
        const seance = await this.prisma.seance.findFirst({
            where: {
                id: seanceId,
                tenantId,
            },
        });
        if (!seance) {
            throw new common_1.NotFoundException('Séance non trouvée');
        }
        if (seance.statut === client_1.StatutSeance.CLOTUREE) {
            throw new common_1.BadRequestException('Impossible de modifier une séance clôturée');
        }
        await this.prisma.$transaction(async (tx) => {
            for (const cotisation of collecterCotisationsDto.cotisations) {
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
            }
        });
        return { message: 'Cotisations collectées avec succès' };
    }
    async genererProcesVerbal(tenantId, seanceId) {
        const seance = await this.findOne(tenantId, seanceId);
        const totalMembres = seance.presences.length;
        const presents = seance.presences.filter((p) => p.present).length;
        const absents = totalMembres - presents;
        const tauxPresence = totalMembres > 0 ? ((presents / totalMembres) * 100).toFixed(2) : '0';
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
    async cloturerSeance(tenantId, seanceId, cloturerSeanceDto) {
        const seance = await this.prisma.seance.findFirst({
            where: {
                id: seanceId,
                tenantId,
            },
        });
        if (!seance) {
            throw new common_1.NotFoundException('Séance non trouvée');
        }
        if (seance.statut === client_1.StatutSeance.CLOTUREE) {
            throw new common_1.BadRequestException('La séance est déjà clôturée');
        }
        await this.genererProcesVerbal(tenantId, seanceId);
        const seanceCloturee = await this.prisma.seance.update({
            where: { id: seanceId },
            data: {
                statut: client_1.StatutSeance.CLOTUREE,
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
};
exports.SeancesService = SeancesService;
exports.SeancesService = SeancesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], SeancesService);
//# sourceMappingURL=seances.service.js.map