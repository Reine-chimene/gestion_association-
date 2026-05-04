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
exports.ProjetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const library_1 = require("@prisma/client/runtime/library");
let ProjetsService = class ProjetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, createProjetDto, phases) {
        const { nom, description, duree, objectif, ephemere, obligatoire, dateDebut, dateFin } = createProjetDto;
        const projet = await this.prisma.projet.create({
            data: {
                tenantId,
                nom,
                description,
                duree,
                objectif: new library_1.Decimal(objectif),
                ephemere: ephemere ?? false,
                obligatoire: obligatoire ?? true,
                dateDebut: dateDebut ? new Date(dateDebut) : new Date(),
                dateFin: dateFin ? new Date(dateFin) : null,
                phases: phases ? {
                    create: phases.map(phase => ({
                        nom: phase.nom,
                        objectif: new library_1.Decimal(phase.objectif),
                        dateLimite: new Date(phase.dateLimite),
                        ordre: phase.ordre,
                    })),
                } : undefined,
            },
            include: {
                phases: {
                    orderBy: { ordre: 'asc' },
                },
            },
        });
        return projet;
    }
    async findAll(tenantId) {
        const projets = await this.prisma.projet.findMany({
            where: { tenantId },
            include: {
                phases: {
                    orderBy: { ordre: 'asc' },
                },
                contributions: {
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
            orderBy: { createdAt: 'desc' },
        });
        return projets.map(projet => ({
            ...projet,
            pourcentageAvancement: this.calculatePourcentageAvancement(projet.montantCollecte, projet.objectif),
            nombreContributeurs: new Set(projet.contributions.map(c => c.membreId)).size,
        }));
    }
    async findOne(tenantId, id) {
        const projet = await this.prisma.projet.findFirst({
            where: { id, tenantId },
            include: {
                phases: {
                    orderBy: { ordre: 'asc' },
                },
                contributions: {
                    include: {
                        membre: {
                            select: {
                                id: true,
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
        if (!projet) {
            throw new common_1.NotFoundException(`Projet avec l'ID ${id} introuvable`);
        }
        return {
            ...projet,
            pourcentageAvancement: this.calculatePourcentageAvancement(projet.montantCollecte, projet.objectif),
            nombreContributeurs: new Set(projet.contributions.map(c => c.membreId)).size,
        };
    }
    async contribuer(tenantId, projetId, contribuerDto) {
        const { membreId, montant, volontaire } = contribuerDto;
        const projet = await this.prisma.projet.findFirst({
            where: { id: projetId, tenantId },
        });
        if (!projet) {
            throw new common_1.NotFoundException(`Projet avec l'ID ${projetId} introuvable`);
        }
        const membre = await this.prisma.membre.findFirst({
            where: { id: membreId, tenantId },
        });
        if (!membre) {
            throw new common_1.NotFoundException(`Membre avec l'ID ${membreId} introuvable`);
        }
        if (projet.ephemere) {
            const isExempte = membre.dateAdhesion > projet.dateDebut;
            if (isExempte && !volontaire) {
                throw new common_1.BadRequestException('Ce membre est exempté de ce projet éphémère. Seules les contributions volontaires sont acceptées.');
            }
        }
        const contribution = await this.prisma.$transaction(async (tx) => {
            const newContribution = await tx.contributionProjet.create({
                data: {
                    projetId,
                    membreId,
                    montant: new library_1.Decimal(montant),
                    volontaire: volontaire ?? false,
                },
                include: {
                    membre: {
                        select: {
                            id: true,
                            numeroMembre: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                },
            });
            await tx.projet.update({
                where: { id: projetId },
                data: {
                    montantCollecte: {
                        increment: new library_1.Decimal(montant),
                    },
                },
            });
            return newContribution;
        });
        return contribution;
    }
    async getAvancement(tenantId, projetId) {
        const projet = await this.prisma.projet.findFirst({
            where: { id: projetId, tenantId },
            include: {
                phases: {
                    orderBy: { ordre: 'asc' },
                },
                contributions: {
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
        if (!projet) {
            throw new common_1.NotFoundException(`Projet avec l'ID ${projetId} introuvable`);
        }
        const pourcentageGlobal = this.calculatePourcentageAvancement(projet.montantCollecte, projet.objectif);
        const avancementPhases = await Promise.all(projet.phases.map(async (phase) => {
            const montantPhase = new library_1.Decimal(0);
            return {
                id: phase.id,
                nom: phase.nom,
                objectif: phase.objectif,
                montantCollecte: montantPhase,
                pourcentage: this.calculatePourcentageAvancement(montantPhase, phase.objectif),
                dateLimite: phase.dateLimite,
            };
        }));
        const contributeurs = new Map();
        projet.contributions.forEach(contrib => {
            const existing = contributeurs.get(contrib.membreId);
            if (existing) {
                existing.total = existing.total.add(contrib.montant);
            }
            else {
                contributeurs.set(contrib.membreId, {
                    membre: contrib.membre,
                    total: contrib.montant,
                });
            }
        });
        return {
            projet: {
                id: projet.id,
                nom: projet.nom,
                description: projet.description,
                objectif: projet.objectif,
                montantCollecte: projet.montantCollecte,
                pourcentageGlobal,
                statut: projet.statut,
            },
            phases: avancementPhases,
            contributeurs: Array.from(contributeurs.values()).map(c => ({
                membre: c.membre,
                montantTotal: c.total,
            })),
            statistiques: {
                nombreContributeurs: contributeurs.size,
                montantMoyen: contributeurs.size > 0
                    ? projet.montantCollecte.div(contributeurs.size)
                    : new library_1.Decimal(0),
                nombreContributions: projet.contributions.length,
            },
        };
    }
    async getStatistiques(tenantId) {
        const projets = await this.prisma.projet.findMany({
            where: { tenantId },
            include: {
                contributions: true,
            },
        });
        const total = projets.length;
        const actifs = projets.filter(p => p.statut === 'ACTIF').length;
        const termines = projets.filter(p => p.statut === 'TERMINE').length;
        const montantTotalObjectif = projets.reduce((sum, p) => sum.add(p.objectif), new library_1.Decimal(0));
        const montantTotalCollecte = projets.reduce((sum, p) => sum.add(p.montantCollecte), new library_1.Decimal(0));
        const nombreContributions = projets.reduce((sum, p) => sum + p.contributions.length, 0);
        return {
            total,
            actifs,
            termines,
            montantTotalObjectif,
            montantTotalCollecte,
            nombreContributions,
            tauxReussite: montantTotalObjectif.gt(0)
                ? montantTotalCollecte.div(montantTotalObjectif).mul(100).toNumber()
                : 0,
        };
    }
    calculatePourcentageAvancement(montantCollecte, objectif) {
        if (objectif.lte(0))
            return 0;
        const pourcentage = montantCollecte.div(objectif).mul(100);
        return Math.min(pourcentage.toNumber(), 100);
    }
};
exports.ProjetsService = ProjetsService;
exports.ProjetsService = ProjetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], ProjetsService);
//# sourceMappingURL=projets.service.js.map