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
exports.MembresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let MembresService = class MembresService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        const count = await this.prisma.membre.count({ where: { tenantId } });
        const numeroMembre = `M${(count + 1).toString().padStart(4, '0')}`;
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
    async calculateKitEntree(tenantId) {
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
        return 50000;
    }
    async findAll(tenantId, options = {}) {
        const { statut, search, limit = 50, offset = 0 } = options;
        const where = { tenantId };
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
    async findOne(tenantId, id) {
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
            throw new common_1.NotFoundException('Membre non trouvé');
        }
        return membre;
    }
    async findByUserId(tenantId, userId) {
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
            throw new common_1.NotFoundException('Profil membre non trouvé pour cet utilisateur');
        }
        return membre;
    }
    async update(tenantId, id, data) {
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
    async changeStatus(tenantId, id, nouveauStatut, motif) {
        const membre = await this.findOne(tenantId, id);
        this.validateStatusTransition(membre.statut, nouveauStatut);
        const membreUpdated = await this.prisma.membre.update({
            where: { id },
            data: { statut: nouveauStatut },
        });
        return {
            membre: membreUpdated,
            motif,
            montantsDus: 0,
            montantsARestituer: 0,
        };
    }
    validateStatusTransition(statutActuel, nouveauStatut) {
        const transitionsInterdites = [
            ['DECEDE', 'ACTIF'],
            ['DECEDE', 'OBSERVATION'],
            ['DECEDE', 'DEMISSIONNAIRE'],
            ['DECEDE', 'MUTE'],
        ];
        const transition = [statutActuel, nouveauStatut];
        const interdit = transitionsInterdites.some((t) => t[0] === transition[0] && t[1] === transition[1]);
        if (interdit) {
            throw new common_1.BadRequestException(`Transition de ${statutActuel} vers ${nouveauStatut} non autorisée`);
        }
    }
    async getSituationNette(tenantId, membreId) {
        const membre = await this.findOne(tenantId, membreId);
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
            const soldeRestant = pret.echeances.reduce((s, e) => s + e.montantTotal.toNumber(), 0);
            return sum + soldeRestant;
        }, 0);
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
    async getStatistiques(tenantId) {
        const [total, actifs, observation, demissionnaires, decedes, mutes] = await Promise.all([
            this.prisma.membre.count({ where: { tenantId } }),
            this.prisma.membre.count({ where: { tenantId, statut: 'ACTIF' } }),
            this.prisma.membre.count({ where: { tenantId, statut: 'OBSERVATION' } }),
            this.prisma.membre.count({ where: { tenantId, statut: 'DEMISSIONNAIRE' } }),
            this.prisma.membre.count({ where: { tenantId, statut: 'DECEDE' } }),
            this.prisma.membre.count({ where: { tenantId, statut: 'MUTE' } }),
        ]);
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
};
exports.MembresService = MembresService;
exports.MembresService = MembresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], MembresService);
//# sourceMappingURL=membres.service.js.map