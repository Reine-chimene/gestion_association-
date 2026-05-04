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
exports.AidesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const caisses_service_js_1 = require("../caisses/caisses.service.js");
const client_1 = require("@prisma/client");
let AidesService = class AidesService {
    prisma;
    caissesService;
    constructor(prisma, caissesService) {
        this.prisma = prisma;
        this.caissesService = caissesService;
    }
    async demanderAideMaladie(tenantId, dto) {
        const beneficiaire = await this.prisma.membre.findFirst({
            where: { id: dto.beneficiaireId, tenantId },
        });
        if (!beneficiaire) {
            throw new common_1.NotFoundException('Bénéficiaire non trouvé');
        }
        if (beneficiaire.statut !== 'ACTIF') {
            throw new common_1.BadRequestException('Le bénéficiaire doit être actif');
        }
        const debutAnnee = new Date(new Date().getFullYear(), 0, 1);
        const aidesAnnee = await this.prisma.aide.count({
            where: {
                tenantId,
                beneficiaireId: dto.beneficiaireId,
                type: 'MALADIE',
                dateDeclaration: { gte: debutAnnee },
                statut: { in: ['APPROUVEE', 'VERSEE'] },
            },
        });
        const limiteAidesParAn = 2;
        if (aidesAnnee >= limiteAidesParAn) {
            throw new common_1.BadRequestException(`Limite d'aides maladie atteinte pour cette année (${limiteAidesParAn})`);
        }
        const montantConfig = await this.prisma.configuration.findFirst({
            where: { tenantId, cle: 'MONTANT_AIDE_MALADIE' },
        });
        const montant = montantConfig
            ? parseFloat(montantConfig.valeur)
            : 50000;
        const aide = await this.prisma.aide.create({
            data: {
                tenantId,
                type: 'MALADIE',
                beneficiaireId: dto.beneficiaireId,
                typeBeneficiaire: 'MEMBRE',
                montant: new client_1.Prisma.Decimal(montant),
                justificatifs: dto.justificatifs,
                statut: 'EN_ATTENTE',
            },
            include: {
                beneficiaire: {
                    select: {
                        numeroMembre: true,
                        nom: true,
                        prenom: true,
                    },
                },
            },
        });
        return aide;
    }
    async declarerDeces(tenantId, dto) {
        const membre = await this.prisma.membre.findFirst({
            where: { id: dto.membreId, tenantId },
        });
        if (!membre) {
            throw new common_1.NotFoundException('Membre non trouvé');
        }
        const montants = {
            MEMBRE: 200000,
            CONJOINT: 150000,
            PARENT: 100000,
            ENFANT: 100000,
        };
        const montantAide = montants[dto.typeBeneficiaire];
        const fraisVisite = 50000;
        const montantTotal = montantAide + fraisVisite;
        const commissionnaire = await this.designerCommissionnaire(tenantId);
        const result = await this.prisma.$transaction(async (tx) => {
            const aide = await tx.aide.create({
                data: {
                    tenantId,
                    type: 'DECES',
                    beneficiaireId: dto.membreId,
                    typeBeneficiaire: dto.typeBeneficiaire,
                    montant: new client_1.Prisma.Decimal(montantTotal),
                    justificatifs: dto.justificatifs,
                    statut: 'APPROUVEE',
                    commissionnaireId: commissionnaire.id,
                    dateApprobation: new Date(),
                },
                include: {
                    beneficiaire: {
                        select: {
                            numeroMembre: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                },
            });
            await this.caissesService.debiter(tenantId, 'FONDS', montantTotal, `Aide décès ${dto.typeBeneficiaire} - ${dto.nomDefunt}`, dto.membreId);
            return {
                aide,
                commissionnaire: {
                    numeroMembre: commissionnaire.numeroMembre,
                    nom: commissionnaire.nom,
                    prenom: commissionnaire.prenom,
                },
                montantAide,
                fraisVisite,
                montantTotal,
            };
        });
        return result;
    }
    async designerCommissionnaire(tenantId) {
        const membresActifs = await this.prisma.membre.findMany({
            where: { tenantId, statut: 'ACTIF' },
            orderBy: { numeroMembre: 'asc' },
        });
        if (membresActifs.length === 0) {
            throw new common_1.BadRequestException('Aucun membre actif disponible');
        }
        const derniereAide = await this.prisma.aide.findFirst({
            where: {
                tenantId,
                type: 'DECES',
                commissionnaireId: { not: null },
            },
            orderBy: { dateDeclaration: 'desc' },
            include: {
                beneficiaire: true,
            },
        });
        if (!derniereAide || !derniereAide.commissionnaireId) {
            return membresActifs[0];
        }
        const indexDernier = membresActifs.findIndex((m) => m.id === derniereAide.commissionnaireId);
        const indexSuivant = (indexDernier + 1) % membresActifs.length;
        return membresActifs[indexSuivant];
    }
    async approuver(tenantId, aideId, approbateurId, dto) {
        const aide = await this.prisma.aide.findFirst({
            where: { id: aideId, tenantId },
            include: {
                beneficiaire: {
                    select: {
                        numeroMembre: true,
                        nom: true,
                        prenom: true,
                    },
                },
            },
        });
        if (!aide) {
            throw new common_1.NotFoundException('Aide non trouvée');
        }
        if (aide.statut !== 'EN_ATTENTE') {
            throw new common_1.BadRequestException('Cette aide a déjà été traitée');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const aideApprouvee = await tx.aide.update({
                where: { id: aideId },
                data: {
                    statut: 'APPROUVEE',
                    dateApprobation: new Date(),
                    approbateurId,
                },
                include: {
                    beneficiaire: {
                        select: {
                            numeroMembre: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                },
            });
            await this.caissesService.debiter(tenantId, 'FONDS', Number(aide.montant), `Aide ${aide.type} - ${aide.beneficiaire.prenom} ${aide.beneficiaire.nom}`, approbateurId);
            return aideApprouvee;
        });
        return result;
    }
    async rejeter(tenantId, aideId, dto) {
        const aide = await this.prisma.aide.findFirst({
            where: { id: aideId, tenantId },
        });
        if (!aide) {
            throw new common_1.NotFoundException('Aide non trouvée');
        }
        if (aide.statut !== 'EN_ATTENTE') {
            throw new common_1.BadRequestException('Cette aide a déjà été traitée');
        }
        const aideRejetee = await this.prisma.aide.update({
            where: { id: aideId },
            data: {
                statut: 'REJETEE',
            },
            include: {
                beneficiaire: {
                    select: {
                        numeroMembre: true,
                        nom: true,
                        prenom: true,
                    },
                },
            },
        });
        return aideRejetee;
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.statut) {
            where.statut = filters.statut;
        }
        if (filters.beneficiaireId) {
            where.beneficiaireId = filters.beneficiaireId;
        }
        const aides = await this.prisma.aide.findMany({
            where,
            include: {
                beneficiaire: {
                    select: {
                        numeroMembre: true,
                        nom: true,
                        prenom: true,
                    },
                },
            },
            orderBy: { dateDeclaration: 'desc' },
            take: filters.limit || 50,
            skip: filters.offset || 0,
        });
        return aides;
    }
    async findOne(tenantId, id) {
        const aide = await this.prisma.aide.findFirst({
            where: { id, tenantId },
            include: {
                beneficiaire: {
                    select: {
                        numeroMembre: true,
                        nom: true,
                        prenom: true,
                        telephone: true,
                        email: true,
                    },
                },
            },
        });
        if (!aide) {
            throw new common_1.NotFoundException('Aide non trouvée');
        }
        return aide;
    }
    async getStatistiques(tenantId) {
        const aides = await this.prisma.aide.findMany({
            where: { tenantId },
        });
        const total = aides.length;
        const enAttente = aides.filter((a) => a.statut === 'EN_ATTENTE').length;
        const approuvees = aides.filter((a) => a.statut === 'APPROUVEE').length;
        const rejetees = aides.filter((a) => a.statut === 'REJETEE').length;
        const totalMaladie = aides.filter((a) => a.type === 'MALADIE').length;
        const totalDeces = aides.filter((a) => a.type === 'DECES').length;
        const montantTotal = aides
            .filter((a) => a.statut === 'APPROUVEE' || a.statut === 'VERSEE')
            .reduce((sum, a) => sum + Number(a.montant), 0);
        return {
            total,
            enAttente,
            approuvees,
            rejetees,
            totalMaladie,
            totalDeces,
            montantTotal,
        };
    }
};
exports.AidesService = AidesService;
exports.AidesService = AidesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        caisses_service_js_1.CaissesService])
], AidesService);
//# sourceMappingURL=aides.service.js.map