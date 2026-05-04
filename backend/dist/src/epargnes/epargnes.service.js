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
exports.EpargnesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const caisses_service_js_1 = require("../caisses/caisses.service.js");
const client_1 = require("@prisma/client");
let EpargnesService = class EpargnesService {
    prisma;
    caissesService;
    constructor(prisma, caissesService) {
        this.prisma = prisma;
        this.caissesService = caissesService;
    }
    async cotiser(tenantId, responsableId, dto) {
        const membre = await this.prisma.membre.findFirst({
            where: { id: dto.membreId, tenantId },
        });
        if (!membre) {
            throw new common_1.NotFoundException('Membre non trouvé');
        }
        if (membre.statut !== 'ACTIF') {
            throw new common_1.BadRequestException('Le membre doit être actif pour cotiser');
        }
        let epargne = await this.prisma.epargne.findFirst({
            where: {
                tenantId,
                type: dto.type,
                statut: 'ACTIF',
            },
        });
        if (!epargne) {
            const dateDebut = new Date();
            const dateFin = new Date();
            if (dto.type === 'ANNUELLE') {
                dateFin.setFullYear(dateFin.getFullYear() + 1);
            }
            else if (dto.type === 'SCOLAIRE') {
                dateFin.setMonth(5);
                dateFin.setDate(30);
                if (dateDebut.getMonth() > 5) {
                    dateFin.setFullYear(dateFin.getFullYear() + 1);
                }
            }
            epargne = await this.prisma.epargne.create({
                data: {
                    tenantId,
                    type: dto.type,
                    dateDebut,
                    dateFin,
                    cycleActuel: 1,
                    statut: 'ACTIF',
                },
            });
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const cotisation = await tx.cotisationEpargne.create({
                data: {
                    epargneId: epargne.id,
                    membreId: dto.membreId,
                    montant: new client_1.Prisma.Decimal(dto.montant),
                    date: new Date(),
                },
                include: {
                    membre: {
                        select: {
                            numeroMembre: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                },
            });
            await this.caissesService.crediter(tenantId, 'EPARGNE', dto.montant, `Cotisation épargne ${dto.type} - ${membre.prenom} ${membre.nom} (${membre.numeroMembre})`, responsableId);
            return cotisation;
        });
        return result;
    }
    async calculerSolde(tenantId, membreId, type) {
        const membre = await this.prisma.membre.findFirst({
            where: { id: membreId, tenantId },
        });
        if (!membre) {
            throw new common_1.NotFoundException('Membre non trouvé');
        }
        const epargne = await this.prisma.epargne.findFirst({
            where: {
                tenantId,
                type,
                statut: 'ACTIF',
            },
        });
        if (!epargne) {
            return {
                membreId,
                type,
                solde: 0,
                nombreCotisations: 0,
                cycleActuel: 0,
            };
        }
        const cotisations = await this.prisma.cotisationEpargne.findMany({
            where: {
                epargneId: epargne.id,
                membreId,
            },
        });
        const solde = cotisations.reduce((sum, c) => sum + Number(c.montant), 0);
        return {
            membreId,
            type,
            solde,
            nombreCotisations: cotisations.length,
            cycleActuel: epargne.cycleActuel,
            dateDebut: epargne.dateDebut,
            dateFin: epargne.dateFin,
        };
    }
    async redistribuer(tenantId, responsableId, dto) {
        const epargne = await this.prisma.epargne.findFirst({
            where: {
                tenantId,
                type: dto.type,
                statut: 'ACTIF',
            },
            include: {
                cotisations: {
                    include: {
                        membre: {
                            select: {
                                id: true,
                                numeroMembre: true,
                                nom: true,
                                prenom: true,
                                statut: true,
                            },
                        },
                    },
                },
            },
        });
        if (!epargne) {
            throw new common_1.NotFoundException(`Aucune épargne ${dto.type} active trouvée`);
        }
        const totalCollecte = epargne.cotisations.reduce((sum, c) => sum + Number(c.montant), 0);
        if (totalCollecte === 0) {
            throw new common_1.BadRequestException('Aucune cotisation à redistribuer');
        }
        const tauxInteret = dto.tauxInteret || 0;
        const interetsGeneres = (totalCollecte * tauxInteret) / 100;
        const montantTotal = totalCollecte + interetsGeneres;
        const contributionsParMembre = new Map();
        epargne.cotisations.forEach((c) => {
            const current = contributionsParMembre.get(c.membreId) || 0;
            contributionsParMembre.set(c.membreId, current + Number(c.montant));
        });
        const redistributions = [];
        for (const [membreId, contribution] of contributionsParMembre.entries()) {
            const membre = epargne.cotisations.find((c) => c.membreId === membreId)?.membre;
            if (!membre)
                continue;
            const partInterets = (contribution / totalCollecte) * interetsGeneres;
            const montantBrut = contribution + partInterets;
            const retenues = 0;
            const montantNet = montantBrut - retenues;
            redistributions.push({
                membreId,
                membre,
                contribution,
                partInterets,
                montantTotal: montantBrut,
                retenues,
                montantNet,
            });
        }
        const result = await this.prisma.$transaction(async (tx) => {
            await this.caissesService.debiter(tenantId, 'EPARGNE', montantTotal, `Redistribution épargne ${dto.type} - Cycle ${epargne.cycleActuel}`, responsableId);
            await tx.epargne.update({
                where: { id: epargne.id },
                data: { statut: 'CLOTURE', dateFin: new Date() },
            });
            const dateDebut = new Date();
            const dateFin = new Date();
            if (dto.type === 'ANNUELLE') {
                dateFin.setFullYear(dateFin.getFullYear() + 1);
            }
            else if (dto.type === 'SCOLAIRE') {
                dateFin.setMonth(5);
                dateFin.setDate(30);
                if (dateDebut.getMonth() > 5) {
                    dateFin.setFullYear(dateFin.getFullYear() + 1);
                }
            }
            await tx.epargne.create({
                data: {
                    tenantId,
                    type: dto.type,
                    dateDebut,
                    dateFin,
                    cycleActuel: epargne.cycleActuel + 1,
                    statut: 'ACTIF',
                },
            });
            return {
                epargneId: epargne.id,
                type: dto.type,
                cycleActuel: epargne.cycleActuel,
                totalCollecte,
                tauxInteret,
                interetsGeneres,
                montantTotal,
                nombreBeneficiaires: redistributions.length,
                redistributions,
            };
        });
        return result;
    }
    async calculerInteretsGeneres(tenantId, type, tauxInteret) {
        const epargne = await this.prisma.epargne.findFirst({
            where: {
                tenantId,
                type,
                statut: 'ACTIF',
            },
            include: {
                cotisations: true,
            },
        });
        if (!epargne) {
            return {
                type,
                totalCollecte: 0,
                tauxInteret,
                interetsGeneres: 0,
                montantTotal: 0,
            };
        }
        const totalCollecte = epargne.cotisations.reduce((sum, c) => sum + Number(c.montant), 0);
        const interetsGeneres = (totalCollecte * tauxInteret) / 100;
        const montantTotal = totalCollecte + interetsGeneres;
        return {
            type,
            cycleActuel: epargne.cycleActuel,
            dateDebut: epargne.dateDebut,
            dateFin: epargne.dateFin,
            totalCollecte,
            tauxInteret,
            interetsGeneres,
            montantTotal,
            nombreCotisations: epargne.cotisations.length,
        };
    }
    async findAll(tenantId, type) {
        const where = { tenantId };
        if (type) {
            where.type = type;
        }
        const epargnes = await this.prisma.epargne.findMany({
            where,
            include: {
                cotisations: {
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
                        cotisations: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return epargnes.map((epargne) => {
            const totalCollecte = epargne.cotisations.reduce((sum, c) => sum + Number(c.montant), 0);
            return {
                ...epargne,
                totalCollecte,
            };
        });
    }
    async findOne(tenantId, id) {
        const epargne = await this.prisma.epargne.findFirst({
            where: { id, tenantId },
            include: {
                cotisations: {
                    include: {
                        membre: {
                            select: {
                                numeroMembre: true,
                                nom: true,
                                prenom: true,
                            },
                        },
                    },
                    orderBy: { date: 'desc' },
                },
            },
        });
        if (!epargne) {
            throw new common_1.NotFoundException('Épargne non trouvée');
        }
        const totalCollecte = epargne.cotisations.reduce((sum, c) => sum + Number(c.montant), 0);
        return {
            ...epargne,
            totalCollecte,
        };
    }
    async getStatistiques(tenantId) {
        const epargnes = await this.prisma.epargne.findMany({
            where: { tenantId },
            include: {
                cotisations: true,
            },
        });
        const epargnesActives = epargnes.filter((e) => e.statut === 'ACTIF');
        const epargnesCloturees = epargnes.filter((e) => e.statut === 'CLOTURE');
        const totalCollecteAnnuelle = epargnes
            .filter((e) => e.type === 'ANNUELLE')
            .reduce((sum, e) => {
            return (sum +
                e.cotisations.reduce((s, c) => s + Number(c.montant), 0));
        }, 0);
        const totalCollecteScolaire = epargnes
            .filter((e) => e.type === 'SCOLAIRE')
            .reduce((sum, e) => {
            return (sum +
                e.cotisations.reduce((s, c) => s + Number(c.montant), 0));
        }, 0);
        return {
            total: epargnes.length,
            actives: epargnesActives.length,
            cloturees: epargnesCloturees.length,
            totalCollecteAnnuelle,
            totalCollecteScolaire,
            totalCollecte: totalCollecteAnnuelle + totalCollecteScolaire,
        };
    }
};
exports.EpargnesService = EpargnesService;
exports.EpargnesService = EpargnesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        caisses_service_js_1.CaissesService])
], EpargnesService);
//# sourceMappingURL=epargnes.service.js.map