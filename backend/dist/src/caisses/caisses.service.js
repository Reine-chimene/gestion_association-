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
exports.CaissesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const library_1 = require("@prisma/client/runtime/library");
let CaissesService = class CaissesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCaisse(tenantId, type) {
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
                    solde: new library_1.Decimal(0),
                },
            });
        }
        return caisse;
    }
    async crediter(tenantId, type, montant, motif, responsableId, reference) {
        if (montant <= 0) {
            throw new common_1.BadRequestException('Le montant doit être positif');
        }
        const caisse = await this.getCaisse(tenantId, type);
        const nouveauSolde = new library_1.Decimal(caisse.solde.toString()).plus(montant);
        const result = await this.prisma.$transaction(async (tx) => {
            const caisseUpdated = await tx.caisse.update({
                where: { id: caisse.id },
                data: { solde: nouveauSolde },
            });
            const mouvement = await tx.mouvement.create({
                data: {
                    caisseId: caisse.id,
                    type: 'ENTREE',
                    montant: new library_1.Decimal(montant),
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
    async debiter(tenantId, type, montant, motif, responsableId, reference) {
        if (montant <= 0) {
            throw new common_1.BadRequestException('Le montant doit être positif');
        }
        const caisse = await this.getCaisse(tenantId, type);
        const soldeActuel = new library_1.Decimal(caisse.solde.toString());
        if (soldeActuel.lessThan(montant)) {
            throw new common_1.BadRequestException('Solde insuffisant dans la caisse');
        }
        const nouveauSolde = soldeActuel.minus(montant);
        const result = await this.prisma.$transaction(async (tx) => {
            const caisseUpdated = await tx.caisse.update({
                where: { id: caisse.id },
                data: { solde: nouveauSolde },
            });
            const mouvement = await tx.mouvement.create({
                data: {
                    caisseId: caisse.id,
                    type: 'SORTIE',
                    montant: new library_1.Decimal(montant),
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
    async decharge(tenantId, type, montant, motif, justification, responsableId) {
        if (!justification || justification.trim().length === 0) {
            throw new common_1.BadRequestException('La justification est obligatoire pour une décharge');
        }
        if (montant <= 0) {
            throw new common_1.BadRequestException('Le montant doit être positif');
        }
        const caisse = await this.getCaisse(tenantId, type);
        const soldeActuel = new library_1.Decimal(caisse.solde.toString());
        if (soldeActuel.lessThan(montant)) {
            throw new common_1.BadRequestException('Solde insuffisant dans la caisse');
        }
        const nouveauSolde = soldeActuel.minus(montant);
        const result = await this.prisma.$transaction(async (tx) => {
            const caisseUpdated = await tx.caisse.update({
                where: { id: caisse.id },
                data: { solde: nouveauSolde },
            });
            const mouvement = await tx.mouvement.create({
                data: {
                    caisseId: caisse.id,
                    type: 'SORTIE',
                    montant: new library_1.Decimal(montant),
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
    async versementBancaire(tenantId, type, montant, motif, reference, responsableId) {
        if (!reference || reference.trim().length === 0) {
            throw new common_1.BadRequestException('La référence bancaire est obligatoire');
        }
        if (montant <= 0) {
            throw new common_1.BadRequestException('Le montant doit être positif');
        }
        const caisse = await this.getCaisse(tenantId, type);
        const nouveauSolde = new library_1.Decimal(caisse.solde.toString()).plus(montant);
        const result = await this.prisma.$transaction(async (tx) => {
            const caisseUpdated = await tx.caisse.update({
                where: { id: caisse.id },
                data: { solde: nouveauSolde },
            });
            const mouvement = await tx.mouvement.create({
                data: {
                    caisseId: caisse.id,
                    type: 'ENTREE',
                    montant: new library_1.Decimal(montant),
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
    async getSolde(tenantId, type) {
        const caisse = await this.getCaisse(tenantId, type);
        return {
            type: caisse.type,
            solde: caisse.solde.toNumber(),
            updatedAt: caisse.updatedAt,
        };
    }
    async getHistorique(tenantId, type, dateDebut, dateFin, limit = 50, offset = 0) {
        const caisse = await this.getCaisse(tenantId, type);
        const where = {
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
    async verifierCoherence(tenantId, type) {
        const caisse = await this.getCaisse(tenantId, type);
        const mouvements = await this.prisma.mouvement.findMany({
            where: { caisseId: caisse.id },
        });
        let soldeCalcule = new library_1.Decimal(0);
        for (const mouvement of mouvements) {
            if (mouvement.type === 'ENTREE') {
                soldeCalcule = soldeCalcule.plus(mouvement.montant);
            }
            else {
                soldeCalcule = soldeCalcule.minus(mouvement.montant);
            }
        }
        const soldeActuel = new library_1.Decimal(caisse.solde.toString());
        const coherent = soldeCalcule.equals(soldeActuel);
        return {
            coherent,
            soldeActuel: soldeActuel.toNumber(),
            soldeCalcule: soldeCalcule.toNumber(),
            difference: soldeActuel.minus(soldeCalcule).toNumber(),
            nombreMouvements: mouvements.length,
        };
    }
    async getAllCaisses(tenantId) {
        const types = ['FONDS', 'SANCTION', 'EPARGNE'];
        const caisses = await Promise.all(types.map(async (type) => {
            const caisse = await this.getCaisse(tenantId, type);
            return {
                type: caisse.type,
                solde: caisse.solde.toNumber(),
                updatedAt: caisse.updatedAt,
            };
        }));
        return caisses;
    }
};
exports.CaissesService = CaissesService;
exports.CaissesService = CaissesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], CaissesService);
//# sourceMappingURL=caisses.service.js.map