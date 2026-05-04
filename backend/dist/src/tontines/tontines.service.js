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
exports.TontinesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const caisses_service_1 = require("../caisses/caisses.service");
const library_1 = require("@prisma/client/runtime/library");
let TontinesService = class TontinesService {
    prisma;
    caissesService;
    constructor(prisma, caissesService) {
        this.prisma = prisma;
        this.caissesService = caissesService;
    }
    async create(tenantId, data) {
        const { nom, type, montantCotisation, frequence, dateDebut, participants } = data;
        if (montantCotisation <= 0) {
            throw new common_1.BadRequestException('Le montant de la cotisation doit être positif');
        }
        const tontine = await this.prisma.tontine.create({
            data: {
                tenantId,
                nom,
                type,
                montantCotisation: new library_1.Decimal(montantCotisation),
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
    async findAll(tenantId, filters) {
        const { statut, type, limit = 50, offset = 0 } = filters || {};
        const where = { tenantId };
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
    async findOne(tenantId, id) {
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
            throw new common_1.NotFoundException('Tontine non trouvée');
        }
        return tontine;
    }
    async collecterCotisations(tenantId, tontineId, responsableId, cotisations) {
        const tontine = await this.prisma.tontine.findUnique({
            where: { id: tontineId },
            include: {
                parts: {
                    include: { membre: true },
                },
            },
        });
        if (!tontine) {
            throw new common_1.NotFoundException('Tontine non trouvée');
        }
        const membresNonPayeurs = [];
        for (const cotisation of cotisations) {
            const part = tontine.parts.find((p) => p.membreId === cotisation.membreId);
            if (!part) {
                throw new common_1.BadRequestException(`Membre ${cotisation.membreId} non trouvé dans cette tontine`);
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
    async creerPenalitesRetard(tontine, membresNonPayeurs, responsableId) {
        const typeSanctionRetard = await this.prisma.typeSanction.findFirst({
            where: {
                tenantId: tontine.tenantId,
                nom: { contains: 'retard', mode: 'insensitive' },
                actif: true,
            },
        });
        if (!typeSanctionRetard) {
            const montantCotisation = new library_1.Decimal(tontine.montantCotisation.toString());
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
        const montantCotisation = new library_1.Decimal(tontine.montantCotisation.toString());
        let montantPenalite = new library_1.Decimal(0);
        switch (typeSanctionRetard.modeCalcul) {
            case 'FIXE':
                montantPenalite = new library_1.Decimal(typeSanctionRetard.montantFixe || 0);
                break;
            case 'POURCENTAGE':
                montantPenalite = montantCotisation
                    .times(new library_1.Decimal(typeSanctionRetard.pourcentage || 0))
                    .div(100);
                break;
            case 'PROGRESSIF':
                montantPenalite = montantCotisation
                    .times(new library_1.Decimal(typeSanctionRetard.pourcentage || 5))
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
    async gererRetenuesDistribution(tenantId, retenues, responsableId) {
        if (retenues.prets?.greaterThan(0)) {
            await this.caissesService.crediter(tenantId, 'FONDS', retenues.prets.toNumber(), `Retenue automatique - Prêts - Distribution tontine`, responsableId);
        }
        if (retenues.sanctions?.greaterThan(0)) {
            await this.caissesService.crediter(tenantId, 'SANCTION', retenues.sanctions.toNumber(), `Retenue automatique - Sanctions - Distribution tontine`, responsableId);
        }
        if (retenues.complementFonds?.greaterThan(0)) {
            await this.caissesService.crediter(tenantId, 'FONDS', retenues.complementFonds.toNumber(), `Retenue automatique - Complément Fonds - Distribution tontine`, responsableId);
        }
    }
    async distribuerCagnotte(tenantId, tontineId, responsableId, retenues) {
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
            throw new common_1.NotFoundException('Tontine non trouvée');
        }
        if (tontine.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Tontine non autorisée pour ce tenant');
        }
        const beneficiaire = tontine.parts.find((p) => !p.aBeneficie);
        if (!beneficiaire) {
            throw new common_1.BadRequestException('Tous les participants ont déjà bénéficié ce cycle');
        }
        const nombreParts = tontine.parts.reduce((sum, p) => sum + p.nombreParts, 0);
        const cagnotteTotal = new library_1.Decimal(tontine.montantCotisation.toString()).times(nombreParts);
        const retenuesPrets = new library_1.Decimal(retenues?.prets || 0);
        const retenuesSanctions = new library_1.Decimal(retenues?.sanctions || 0);
        const retenuesComplementFonds = new library_1.Decimal(retenues?.complementFonds || 0);
        const totalRetenues = retenuesPrets.plus(retenuesSanctions).plus(retenuesComplementFonds);
        const montantNet = cagnotteTotal.minus(totalRetenues);
        if (montantNet.lessThan(0)) {
            throw new common_1.BadRequestException('Les retenues ne peuvent pas dépasser la cagnotte');
        }
        await this.caissesService.debiter(tenantId, 'FONDS', montantNet.toNumber(), `Distribution tontine: ${tontine.nom} - Bénéficiaire: ${beneficiaire.membre.nom} ${beneficiaire.membre.prenom}`, responsableId);
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
    async sellTour(tenantId, tontineId, data) {
        const { acheteurId, tourOriginal, montantOffre } = data;
        const tontine = await this.findOne(tenantId, tontineId);
        const partOriginale = tontine.parts.find((p) => p.ordre === tourOriginal);
        if (!partOriginale) {
            throw new common_1.BadRequestException(`Tour ${tourOriginal} non trouvé`);
        }
        const partAcheteur = tontine.parts.find((p) => p.membreId === acheteurId);
        if (!partAcheteur) {
            throw new common_1.BadRequestException("L'acheteur doit être un participant de la tontine");
        }
        const vente = await this.prisma.venteTour.create({
            data: {
                tontineId,
                acheteurId,
                tourOriginal,
                montantOffre: new library_1.Decimal(montantOffre),
                interetsPrimaires: new library_1.Decimal(0),
            },
        });
        return vente;
    }
    async sellInterets(tenantId, tontineId, data) {
        const { vendeurId, acheteurId, montantInterets, montantOffre, modalite } = data;
        const tontine = await this.findOne(tenantId, tontineId);
        const partVendeur = tontine.parts.find((p) => p.membreId === vendeurId);
        if (!partVendeur) {
            throw new common_1.BadRequestException('Le vendeur doit être un participant de la tontine');
        }
        const partAcheteur = tontine.parts.find((p) => p.membreId === acheteurId);
        if (!partAcheteur) {
            throw new common_1.BadRequestException("L'acheteur doit être un participant de la tontine");
        }
        const interetsSecondaires = new library_1.Decimal(montantOffre).minus(new library_1.Decimal(montantInterets));
        const vente = await this.prisma.venteInterets.create({
            data: {
                tontineId,
                vendeurId,
                acheteurId,
                montantInterets: new library_1.Decimal(montantInterets),
                montantOffre: new library_1.Decimal(montantOffre),
                interetsSecondaires,
                modalite,
            },
        });
        return vente;
    }
    async getBeneficiaireActuel(tenantId, tontineId) {
        const tontine = await this.findOne(tenantId, tontineId);
        const beneficiaire = tontine.parts.find((p) => !p.aBeneficie);
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
    async verifierTourGratuit(tenantId, tontineId, membreId) {
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
    async attribuerTourGratuit(tenantId, tontineId, beneficiaireId) {
        const tontine = await this.findOne(tenantId, tontineId);
        const partBeneficiaire = tontine.parts.find((p) => p.membreId === beneficiaireId);
        if (!partBeneficiaire) {
            throw new common_1.BadRequestException('Le bénéficiaire doit être un participant de la tontine');
        }
        const nombreParts = tontine.parts.length;
        const montantTourGratuit = new library_1.Decimal(tontine.montantCotisation.toString()).times(nombreParts);
        const tourGratuit = await this.prisma.tourGratuit.create({
            data: {
                tontineId,
                beneficiaireId,
                montant: montantTourGratuit,
            },
        });
        return tourGratuit;
    }
};
exports.TontinesService = TontinesService;
exports.TontinesService = TontinesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, caisses_service_1.CaissesService])
], TontinesService);
//# sourceMappingURL=tontines.service.js.map