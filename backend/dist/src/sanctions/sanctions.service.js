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
exports.SanctionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const client_1 = require("@prisma/client");
let SanctionsService = class SanctionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTypeSanction(tenantId, createTypeSanctionDto) {
        if (createTypeSanctionDto.modeCalcul === client_1.ModeCalcul.FIXE) {
            if (!createTypeSanctionDto.montantFixe) {
                throw new common_1.BadRequestException('Le montant fixe est requis pour le mode FIXE');
            }
        }
        else if (createTypeSanctionDto.modeCalcul === client_1.ModeCalcul.POURCENTAGE) {
            if (!createTypeSanctionDto.pourcentage) {
                throw new common_1.BadRequestException('Le pourcentage est requis pour le mode POURCENTAGE');
            }
            if (createTypeSanctionDto.pourcentage < 0 || createTypeSanctionDto.pourcentage > 100) {
                throw new common_1.BadRequestException('Le pourcentage doit être entre 0 et 100');
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
    async findAllTypesSanctions(tenantId) {
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
    async findOneTypeSanction(tenantId, id) {
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
            throw new common_1.NotFoundException('Type de sanction non trouvé');
        }
        return typeSanction;
    }
    async updateTypeSanction(tenantId, id, updateTypeSanctionDto) {
        await this.findOneTypeSanction(tenantId, id);
        if (updateTypeSanctionDto.modeCalcul) {
            if (updateTypeSanctionDto.modeCalcul === client_1.ModeCalcul.FIXE) {
                if (!updateTypeSanctionDto.montantFixe) {
                    throw new common_1.BadRequestException('Le montant fixe est requis pour le mode FIXE');
                }
            }
            else if (updateTypeSanctionDto.modeCalcul === client_1.ModeCalcul.POURCENTAGE) {
                if (!updateTypeSanctionDto.pourcentage) {
                    throw new common_1.BadRequestException('Le pourcentage est requis pour le mode POURCENTAGE');
                }
                if (updateTypeSanctionDto.pourcentage < 0 || updateTypeSanctionDto.pourcentage > 100) {
                    throw new common_1.BadRequestException('Le pourcentage doit être entre 0 et 100');
                }
            }
        }
        return this.prisma.typeSanction.update({
            where: { id },
            data: updateTypeSanctionDto,
        });
    }
    async removeTypeSanction(tenantId, id) {
        const typeSanction = await this.findOneTypeSanction(tenantId, id);
        const sanctionsCount = await this.prisma.sanction.count({
            where: { typeSanctionId: id },
        });
        if (sanctionsCount > 0) {
            throw new common_1.BadRequestException('Impossible de supprimer un type de sanction avec des sanctions associées');
        }
        await this.prisma.typeSanction.delete({
            where: { id },
        });
        return { message: 'Type de sanction supprimé avec succès' };
    }
    async appliquerSanction(tenantId, appliquerSanctionDto) {
        const membre = await this.prisma.membre.findFirst({
            where: {
                id: appliquerSanctionDto.membreId,
                tenantId,
            },
        });
        if (!membre) {
            throw new common_1.NotFoundException('Membre non trouvé');
        }
        const typeSanction = await this.prisma.typeSanction.findFirst({
            where: {
                id: appliquerSanctionDto.typeSanctionId,
                tenantId,
                actif: true,
            },
        });
        if (!typeSanction) {
            throw new common_1.NotFoundException('Type de sanction non trouvé ou inactif');
        }
        return this.prisma.$transaction(async (tx) => {
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
    async calculerMontantSanction(tenantId, typeSanctionId, montantBase, nombreJoursRetard) {
        const typeSanction = await this.findOneTypeSanction(tenantId, typeSanctionId);
        switch (typeSanction.modeCalcul) {
            case client_1.ModeCalcul.FIXE:
                return typeSanction.montantFixe?.toNumber() || 0;
            case client_1.ModeCalcul.POURCENTAGE:
                if (!montantBase) {
                    throw new common_1.BadRequestException('Le montant de base est requis pour le calcul en pourcentage');
                }
                const pourcentage = typeSanction.pourcentage?.toNumber() || 0;
                return (montantBase * pourcentage) / 100;
            case client_1.ModeCalcul.PROGRESSIF:
                if (!nombreJoursRetard) {
                    throw new common_1.BadRequestException('Le nombre de jours de retard est requis pour le calcul progressif');
                }
                const montantFixe = typeSanction.montantFixe?.toNumber() || 0;
                return montantFixe * nombreJoursRetard;
            default:
                return 0;
        }
    }
    async findAllSanctions(tenantId, membreId, statut) {
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
    async findOneSanction(tenantId, id) {
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
            throw new common_1.NotFoundException('Sanction non trouvée');
        }
        return sanction;
    }
    async annulerSanction(tenantId, id, annulerSanctionDto) {
        const sanction = await this.findOneSanction(tenantId, id);
        if (sanction.statut === 'ANNULEE') {
            throw new common_1.BadRequestException('La sanction est déjà annulée');
        }
        return this.prisma.$transaction(async (tx) => {
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
    async marquerPayee(tenantId, id) {
        const sanction = await this.findOneSanction(tenantId, id);
        if (sanction.statut === 'PAYEE') {
            throw new common_1.BadRequestException('La sanction est déjà payée');
        }
        if (sanction.statut === 'ANNULEE') {
            throw new common_1.BadRequestException('Impossible de marquer comme payée une sanction annulée');
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
    async getSanctionsByMembre(tenantId, membreId) {
        return this.findAllSanctions(tenantId, membreId);
    }
    async getTotalSanctionsImpayees(tenantId, membreId) {
        const sanctions = await this.prisma.sanction.findMany({
            where: {
                tenantId,
                membreId,
                statut: 'IMPAYEE',
            },
        });
        return sanctions.reduce((total, sanction) => total + sanction.montant.toNumber(), 0);
    }
};
exports.SanctionsService = SanctionsService;
exports.SanctionsService = SanctionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], SanctionsService);
//# sourceMappingURL=sanctions.service.js.map