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
exports.ComplementFondsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const caisses_service_js_1 = require("../caisses/caisses.service.js");
const library_1 = require("@prisma/client/runtime/library");
let ComplementFondsService = class ComplementFondsService {
    prisma;
    caissesService;
    constructor(prisma, caissesService) {
        this.prisma = prisma;
        this.caissesService = caissesService;
    }
    async calculerComplementAnnuel(tenantId, annee, montantTotal) {
        const existant = await this.prisma.complementFonds.findUnique({
            where: {
                tenantId_annee: {
                    tenantId,
                    annee,
                },
            },
        });
        if (existant) {
            throw new common_1.BadRequestException(`Un complément fonds existe déjà pour l'année ${annee}`);
        }
        const membresActifs = await this.prisma.membre.count({
            where: {
                tenantId,
                statut: 'ACTIF',
            },
        });
        if (membresActifs === 0) {
            throw new common_1.BadRequestException('Aucun membre actif trouvé');
        }
        const montantParMembre = new library_1.Decimal(montantTotal).dividedBy(membresActifs);
        const complementFonds = await this.prisma.complementFonds.create({
            data: {
                tenantId,
                annee,
                montantTotal: new library_1.Decimal(montantTotal),
                montantParMembre,
                statut: 'ACTIF',
            },
        });
        return {
            ...complementFonds,
            montantTotal: complementFonds.montantTotal.toNumber(),
            montantParMembre: complementFonds.montantParMembre.toNumber(),
            nombreMembresActifs: membresActifs,
        };
    }
    async findAll(tenantId, options = {}) {
        const { annee, statut, limit = 50, offset = 0 } = options;
        const where = { tenantId };
        if (annee) {
            where.annee = annee;
        }
        if (statut) {
            where.statut = statut;
        }
        const [complementFonds, total] = await Promise.all([
            this.prisma.complementFonds.findMany({
                where,
                include: {
                    paiements: {
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
                    _count: {
                        select: {
                            paiements: true,
                        },
                    },
                },
                orderBy: { annee: 'desc' },
                take: limit,
                skip: offset,
            }),
            this.prisma.complementFonds.count({ where }),
        ]);
        return {
            complementFonds: complementFonds.map((cf) => ({
                ...cf,
                montantTotal: cf.montantTotal.toNumber(),
                montantParMembre: cf.montantParMembre.toNumber(),
                nombrePaiements: cf._count.paiements,
                paiements: cf.paiements.map((p) => ({
                    ...p,
                    montant: p.montant.toNumber(),
                })),
            })),
            total,
            limit,
            offset,
        };
    }
    async findOne(tenantId, id) {
        const complementFonds = await this.prisma.complementFonds.findFirst({
            where: { id, tenantId },
            include: {
                paiements: {
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
                    orderBy: {
                        datePaiement: 'desc',
                    },
                },
            },
        });
        if (!complementFonds) {
            throw new common_1.NotFoundException('Complément fonds non trouvé');
        }
        return {
            ...complementFonds,
            montantTotal: complementFonds.montantTotal.toNumber(),
            montantParMembre: complementFonds.montantParMembre.toNumber(),
            paiements: complementFonds.paiements.map((p) => ({
                ...p,
                montant: p.montant.toNumber(),
            })),
        };
    }
    async getSuiviPaiements(tenantId, complementFondsId) {
        const complementFonds = await this.findOne(tenantId, complementFondsId);
        const membresActifs = await this.prisma.membre.findMany({
            where: {
                tenantId,
                statut: 'ACTIF',
            },
            select: {
                id: true,
                nom: true,
                prenom: true,
                numeroMembre: true,
            },
        });
        const suiviPaiements = membresActifs.map((membre) => {
            const paiements = complementFonds.paiements.filter((p) => p.membreId === membre.id);
            const montantPaye = paiements.reduce((sum, p) => sum + p.montant, 0);
            const montantDu = complementFonds.montantParMembre;
            const montantRestant = montantDu - montantPaye;
            return {
                membre,
                montantDu,
                montantPaye,
                montantRestant,
                statut: montantRestant <= 0 ? 'PAYE' : montantRestant < montantDu ? 'PARTIEL' : 'IMPAYE',
                nombrePaiements: paiements.length,
                dernierPaiement: paiements.length > 0 ? paiements[0].datePaiement : null,
            };
        });
        const totalPaye = suiviPaiements.reduce((sum, s) => sum + s.montantPaye, 0);
        const totalRestant = suiviPaiements.reduce((sum, s) => sum + s.montantRestant, 0);
        const nombrePayes = suiviPaiements.filter((s) => s.statut === 'PAYE').length;
        const nombrePartiels = suiviPaiements.filter((s) => s.statut === 'PARTIEL').length;
        const nombreImpayes = suiviPaiements.filter((s) => s.statut === 'IMPAYE').length;
        return {
            complementFonds: {
                id: complementFonds.id,
                annee: complementFonds.annee,
                montantTotal: complementFonds.montantTotal,
                montantParMembre: complementFonds.montantParMembre,
                statut: complementFonds.statut,
            },
            suiviPaiements,
            statistiques: {
                nombreMembres: membresActifs.length,
                totalPaye,
                totalRestant,
                tauxRecouvrement: (totalPaye / complementFonds.montantTotal) * 100,
                nombrePayes,
                nombrePartiels,
                nombreImpayes,
            },
        };
    }
    async enregistrerPaiement(tenantId, complementFondsId, responsableId, data) {
        const complementFonds = await this.findOne(tenantId, complementFondsId);
        if (complementFonds.statut === 'CASSE') {
            throw new common_1.BadRequestException('Ce complément fonds a été cassé');
        }
        const membre = await this.prisma.membre.findFirst({
            where: {
                id: data.membreId,
                tenantId,
                statut: 'ACTIF',
            },
        });
        if (!membre) {
            throw new common_1.NotFoundException('Membre non trouvé ou inactif');
        }
        const paiementsExistants = await this.prisma.paiementComplementFonds.findMany({
            where: {
                complementFondsId,
                membreId: data.membreId,
            },
        });
        const montantDejaPaye = paiementsExistants.reduce((sum, p) => sum + p.montant.toNumber(), 0);
        const montantRestant = complementFonds.montantParMembre - montantDejaPaye;
        if (montantRestant <= 0) {
            throw new common_1.BadRequestException('Ce membre a déjà payé son complément fonds');
        }
        if (data.montant > montantRestant) {
            throw new common_1.BadRequestException(`Le montant ne peut pas dépasser le montant restant (${montantRestant} FCFA)`);
        }
        const paiement = await this.prisma.paiementComplementFonds.create({
            data: {
                complementFondsId,
                membreId: data.membreId,
                montant: new library_1.Decimal(data.montant),
                modePaiement: data.modePaiement || 'PAIEMENT_MANUEL',
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
            },
        });
        await this.caissesService.crediter(tenantId, 'FONDS', data.montant, `Complément fonds ${complementFonds.annee} - ${membre.nom} ${membre.prenom}`, responsableId);
        return {
            paiement: {
                ...paiement,
                montant: paiement.montant.toNumber(),
            },
            montantDejaPaye: montantDejaPaye + data.montant,
            montantRestant: montantRestant - data.montant,
        };
    }
    async augmenter(tenantId, complementFondsId, nouveauMontantTotal) {
        const complementFonds = await this.findOne(tenantId, complementFondsId);
        if (complementFonds.statut === 'CASSE') {
            throw new common_1.BadRequestException('Ce complément fonds a été cassé');
        }
        if (nouveauMontantTotal <= complementFonds.montantTotal) {
            throw new common_1.BadRequestException('Le nouveau montant doit être supérieur au montant actuel');
        }
        const membresActifs = await this.prisma.membre.count({
            where: {
                tenantId,
                statut: 'ACTIF',
            },
        });
        const nouveauMontantParMembre = new library_1.Decimal(nouveauMontantTotal).dividedBy(membresActifs);
        const updated = await this.prisma.complementFonds.update({
            where: { id: complementFondsId },
            data: {
                montantTotal: new library_1.Decimal(nouveauMontantTotal),
                montantParMembre: nouveauMontantParMembre,
                statut: 'AUGMENTE',
            },
        });
        return {
            ...updated,
            montantTotal: updated.montantTotal.toNumber(),
            montantParMembre: updated.montantParMembre.toNumber(),
            ancienMontantTotal: complementFonds.montantTotal,
            ancienMontantParMembre: complementFonds.montantParMembre,
            augmentation: nouveauMontantTotal - complementFonds.montantTotal,
        };
    }
    async casser(tenantId, complementFondsId, responsableId, motif) {
        const complementFonds = await this.findOne(tenantId, complementFondsId);
        if (complementFonds.statut === 'CASSE') {
            throw new common_1.BadRequestException('Ce complément fonds a déjà été cassé');
        }
        const montantTotalPaiements = complementFonds.paiements.reduce((sum, p) => sum + p.montant, 0);
        if (montantTotalPaiements > 0) {
            await this.caissesService.debiter(tenantId, 'FONDS', montantTotalPaiements, `Remboursement complément fonds ${complementFonds.annee} cassé - ${motif}`, responsableId);
        }
        const updated = await this.prisma.complementFonds.update({
            where: { id: complementFondsId },
            data: {
                statut: 'CASSE',
            },
        });
        return {
            ...updated,
            montantTotal: updated.montantTotal.toNumber(),
            montantParMembre: updated.montantParMembre.toNumber(),
            montantRembourse: montantTotalPaiements,
            nombrePaiementsRembourses: complementFonds.paiements.length,
            motif,
        };
    }
    async preleverAutomatique(tenantId, membreId, annee) {
        const complementFonds = await this.prisma.complementFonds.findUnique({
            where: {
                tenantId_annee: {
                    tenantId,
                    annee,
                },
            },
        });
        if (!complementFonds || complementFonds.statut === 'CASSE') {
            return null;
        }
        const paiementsExistants = await this.prisma.paiementComplementFonds.findMany({
            where: {
                complementFondsId: complementFonds.id,
                membreId,
            },
        });
        const montantDejaPaye = paiementsExistants.reduce((sum, p) => sum + p.montant.toNumber(), 0);
        const montantRestant = complementFonds.montantParMembre.toNumber() - montantDejaPaye;
        if (montantRestant <= 0) {
            return null;
        }
        await this.prisma.paiementComplementFonds.create({
            data: {
                complementFondsId: complementFonds.id,
                membreId,
                montant: new library_1.Decimal(montantRestant),
                modePaiement: 'PRELEVEMENT_AUTO',
            },
        });
        return {
            montant: montantRestant,
            complementFondsId: complementFonds.id,
        };
    }
};
exports.ComplementFondsService = ComplementFondsService;
exports.ComplementFondsService = ComplementFondsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        caisses_service_js_1.CaissesService])
], ComplementFondsService);
//# sourceMappingURL=complement-fonds.service.js.map