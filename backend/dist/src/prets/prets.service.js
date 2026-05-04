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
exports.PretsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const library_1 = require("@prisma/client/runtime/library");
let PretsService = class PretsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, responsableId, dto) {
        const emprunteur = await this.prisma.membre.findFirst({
            where: { id: dto.emprunteurId, tenantId },
        });
        if (!emprunteur) {
            throw new common_1.NotFoundException('Emprunteur non trouvé');
        }
        if (!dto.garanties || dto.garanties.length === 0) {
            throw new common_1.BadRequestException('Au moins une garantie est requise');
        }
        const caisseFonds = await this.prisma.caisse.findFirst({
            where: { tenantId, type: 'FONDS' },
        });
        if (!caisseFonds) {
            throw new common_1.NotFoundException('Caisse Fonds non trouvée');
        }
        if (Number(caisseFonds.solde) < dto.montant) {
            throw new common_1.BadRequestException('Solde insuffisant dans la Caisse Fonds');
        }
        const interetsTotal = this.calculerInteretsSimples(dto.montant, dto.tauxInteret, dto.dureeEnMois);
        const montantTotal = dto.montant + interetsTotal;
        const dateEcheance = new Date();
        dateEcheance.setMonth(dateEcheance.getMonth() + dto.dureeEnMois);
        return this.prisma.$transaction(async (tx) => {
            const pret = await tx.pret.create({
                data: {
                    tenantId,
                    emprunteurId: dto.emprunteurId,
                    type: dto.type,
                    montant: new library_1.Decimal(dto.montant),
                    tauxInteret: new library_1.Decimal(dto.tauxInteret),
                    dureeEnMois: dto.dureeEnMois,
                    montantTotal: new library_1.Decimal(montantTotal),
                    soldeRestant: new library_1.Decimal(montantTotal),
                    motif: dto.motif,
                    statut: 'EN_COURS',
                    dateOctroi: new Date(),
                    dateEcheance,
                    notes: dto.notes,
                    garanties: {
                        create: dto.garanties.map((g) => ({
                            tenantId,
                            type: g.type,
                            description: g.description,
                            valeurEstimee: new library_1.Decimal(g.valeurEstimee),
                            documentUrl: g.documentUrl,
                        })),
                    },
                    coEmprunteurs: dto.coEmprunteurs
                        ? {
                            create: dto.coEmprunteurs.map((ce) => ({
                                tenantId,
                                membreId: ce.membreId,
                                partResponsabilite: new library_1.Decimal(ce.partResponsabilite),
                            })),
                        }
                        : undefined,
                },
                include: {
                    emprunteur: {
                        select: {
                            numeroMembre: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                    garanties: true,
                    coEmprunteurs: {
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
                },
            });
            await this.genererEcheancier(tx, tenantId, pret.id, dto.montant, interetsTotal, dto.dureeEnMois);
            await tx.caisse.update({
                where: { id: caisseFonds.id },
                data: {
                    solde: { decrement: dto.montant },
                },
            });
            await tx.mouvement.create({
                data: {
                    caisseId: caisseFonds.id,
                    type: 'SORTIE',
                    montant: new library_1.Decimal(dto.montant),
                    motif: `Prêt ${dto.type} accordé à ${emprunteur.prenom} ${emprunteur.nom}`,
                    soldeApres: new library_1.Decimal(Number(caisseFonds.solde) - dto.montant),
                    date: new Date(),
                    responsableId,
                },
            });
            return pret;
        });
    }
    calculerInteretsSimples(montant, tauxAnnuel, dureeEnMois) {
        return (montant * tauxAnnuel * dureeEnMois) / (100 * 12);
    }
    async genererEcheancier(tx, tenantId, pretId, montantCapital, interetsTotal, dureeEnMois) {
        const montantMensuel = (montantCapital + interetsTotal) / dureeEnMois;
        const capitalMensuel = montantCapital / dureeEnMois;
        const interetsMensuel = interetsTotal / dureeEnMois;
        const echeances = [];
        const dateOctroi = new Date();
        for (let i = 1; i <= dureeEnMois; i++) {
            const dateEcheance = new Date(dateOctroi);
            dateEcheance.setMonth(dateEcheance.getMonth() + i);
            echeances.push({
                pretId,
                numeroEcheance: i,
                dateEcheance,
                montantCapital: new library_1.Decimal(capitalMensuel),
                montantInterets: new library_1.Decimal(interetsMensuel),
                montantTotal: new library_1.Decimal(montantMensuel),
                montantPaye: new library_1.Decimal(0),
                statut: 'EN_ATTENTE',
            });
        }
        await tx.echeance.createMany({
            data: echeances,
        });
    }
    async findAll(tenantId, filters) {
        const where = { tenantId };
        if (filters?.statut) {
            where.statut = filters.statut;
        }
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.emprunteurId) {
            where.emprunteurId = filters.emprunteurId;
        }
        return this.prisma.pret.findMany({
            where,
            include: {
                emprunteur: {
                    select: {
                        numeroMembre: true,
                        nom: true,
                        prenom: true,
                    },
                },
                garanties: true,
                coEmprunteurs: {
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
                        echeances: true,
                        paiements: true,
                    },
                },
            },
            orderBy: { dateOctroi: 'desc' },
            take: filters?.limit || 50,
            skip: filters?.offset || 0,
        });
    }
    async findOne(tenantId, id) {
        const pret = await this.prisma.pret.findFirst({
            where: { id, tenantId },
            include: {
                emprunteur: {
                    select: {
                        numeroMembre: true,
                        nom: true,
                        prenom: true,
                        telephone: true,
                        email: true,
                    },
                },
                garanties: true,
                coEmprunteurs: {
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
                echeances: {
                    orderBy: { numeroEcheance: 'asc' },
                },
                paiements: {
                    orderBy: { datePaiement: 'desc' },
                },
            },
        });
        if (!pret) {
            throw new common_1.NotFoundException('Prêt non trouvé');
        }
        return pret;
    }
    async enregistrerPaiement(tenantId, pretId, responsableId, dto) {
        const pret = await this.findOne(tenantId, pretId);
        const echeance = await this.prisma.echeance.findFirst({
            where: { id: dto.echeanceId, pretId },
        });
        if (!echeance) {
            throw new common_1.NotFoundException('Échéance non trouvée');
        }
        if (echeance.statut === 'PAYEE') {
            throw new common_1.BadRequestException('Cette échéance est déjà payée');
        }
        const caisseFonds = await this.prisma.caisse.findFirst({
            where: { tenantId, type: 'FONDS' },
        });
        if (!caisseFonds) {
            throw new common_1.NotFoundException('Caisse Fonds non trouvée');
        }
        return this.prisma.$transaction(async (tx) => {
            const paiement = await tx.paiement.create({
                data: {
                    tenantId,
                    pretId,
                    echeanceId: dto.echeanceId,
                    montant: new library_1.Decimal(dto.montant),
                    datePaiement: new Date(),
                    notes: dto.notes,
                },
            });
            const montantPaye = Number(echeance.montantPaye || 0) + dto.montant;
            const montantTotal = Number(echeance.montantTotal);
            await tx.echeance.update({
                where: { id: dto.echeanceId },
                data: {
                    montantPaye: new library_1.Decimal(montantPaye),
                    statut: montantPaye >= montantTotal ? 'PAYEE' : 'PARTIELLE',
                },
            });
            const nouveauSolde = Number(pret.soldeRestant) - dto.montant;
            await tx.pret.update({
                where: { id: pretId },
                data: {
                    soldeRestant: new library_1.Decimal(Math.max(0, nouveauSolde)),
                    statut: nouveauSolde <= 0 ? 'SOLDE' : 'EN_COURS',
                },
            });
            await tx.caisse.update({
                where: { id: caisseFonds.id },
                data: {
                    solde: { increment: dto.montant },
                },
            });
            await tx.mouvement.create({
                data: {
                    caisseId: caisseFonds.id,
                    type: 'ENTREE',
                    montant: new library_1.Decimal(dto.montant),
                    motif: `Remboursement prêt - ${pret.emprunteur.prenom} ${pret.emprunteur.nom}`,
                    soldeApres: new library_1.Decimal(Number(caisseFonds.solde) + dto.montant),
                    date: new Date(),
                    responsableId,
                },
            });
            return paiement;
        });
    }
    async reconduire(tenantId, pretId, dto) {
        const pret = await this.findOne(tenantId, pretId);
        if (pret.statut === 'SOLDE') {
            throw new common_1.BadRequestException('Ce prêt est déjà soldé');
        }
        if (pret.nombreReconductions >= 2) {
            throw new common_1.BadRequestException('Nombre maximum de reconductions atteint (2)');
        }
        const nouveauTaux = dto.nouveauTauxInteret ?? Number(pret.tauxInteret);
        const soldeRestant = Number(pret.soldeRestant);
        const nouveauxInterets = this.calculerInteretsSimples(soldeRestant, nouveauTaux, dto.nouvelledureeEnMois);
        const nouveauMontantTotal = soldeRestant + nouveauxInterets;
        return this.prisma.$transaction(async (tx) => {
            await tx.pret.update({
                where: { id: pretId },
                data: {
                    dureeEnMois: { increment: dto.nouvelledureeEnMois },
                    tauxInteret: new library_1.Decimal(nouveauTaux),
                    montantTotal: new library_1.Decimal(nouveauMontantTotal),
                    soldeRestant: new library_1.Decimal(nouveauMontantTotal),
                    nombreReconductions: { increment: 1 },
                    notes: pret.notes
                        ? `${pret.notes}\n\nReconduction: ${dto.motif || 'Aucun motif'}`
                        : `Reconduction: ${dto.motif || 'Aucun motif'}`,
                },
            });
            await tx.echeance.deleteMany({
                where: {
                    pretId,
                    statut: { in: ['EN_ATTENTE', 'EN_RETARD'] },
                },
            });
            await this.genererEcheancier(tx, tenantId, pretId, soldeRestant, nouveauxInterets, dto.nouvelledureeEnMois);
            return this.findOne(tenantId, pretId);
        });
    }
    async getEcheancier(tenantId, pretId) {
        await this.findOne(tenantId, pretId);
        return this.prisma.echeance.findMany({
            where: { pretId },
            orderBy: { numeroEcheance: 'asc' },
        });
    }
    async getSoldeRestant(tenantId, pretId) {
        const pret = await this.findOne(tenantId, pretId);
        return {
            pretId: pret.id,
            montantInitial: pret.montant,
            montantTotal: pret.montantTotal,
            soldeRestant: pret.soldeRestant,
            montantPaye: Number(pret.montantTotal) - Number(pret.soldeRestant),
            pourcentagePaye: ((Number(pret.montantTotal) - Number(pret.soldeRestant)) / Number(pret.montantTotal)) * 100,
            statut: pret.statut,
        };
    }
    async declencherRecouvrementForce(tenantId, pretId, responsableId) {
        const pret = await this.findOne(tenantId, pretId);
        if (pret.statut === 'SOLDE') {
            throw new common_1.BadRequestException('Ce prêt est déjà soldé');
        }
        const echeancesEnRetard = pret.echeances.filter((e) => e.statut === 'EN_RETARD' || (e.statut === 'EN_ATTENTE' && new Date(e.dateEcheance) < new Date()));
        if (echeancesEnRetard.length === 0) {
            throw new common_1.BadRequestException('Aucune échéance en retard');
        }
        await this.prisma.pret.update({
            where: { id: pretId },
            data: {
                statut: 'RECOUVREMENT',
                notes: pret.notes
                    ? `${pret.notes}\n\nRecouvrement forcé déclenché le ${new Date().toLocaleDateString('fr-FR')}`
                    : `Recouvrement forcé déclenché le ${new Date().toLocaleDateString('fr-FR')}`,
            },
        });
        return {
            message: 'Recouvrement forcé déclenché',
            pretId,
            echeancesEnRetard: echeancesEnRetard.length,
            montantDu: echeancesEnRetard.reduce((sum, e) => sum + Number(e.montantTotal) - Number(e.montantPaye || 0), 0),
        };
    }
    async getStatistiques(tenantId) {
        const [total, enCours, soldes, enRetard, montantPrete, montantRembourse] = await Promise.all([
            this.prisma.pret.count({ where: { tenantId } }),
            this.prisma.pret.count({ where: { tenantId, statut: 'EN_COURS' } }),
            this.prisma.pret.count({ where: { tenantId, statut: 'SOLDE' } }),
            this.prisma.pret.count({ where: { tenantId, statut: 'EN_RETARD' } }),
            this.prisma.pret.aggregate({
                where: { tenantId },
                _sum: { montant: true },
            }),
            this.prisma.paiement.aggregate({
                where: { tenantId },
                _sum: { montant: true },
            }),
        ]);
        const montantPreteTotal = Number(montantPrete._sum?.montant || 0);
        const montantRemb = Number(montantRembourse._sum?.montant || 0);
        return {
            total,
            enCours,
            soldes,
            enRetard,
            montantTotal: montantPreteTotal,
            montantRembourse: montantRemb,
            tauxRecouvrement: montantPreteTotal > 0 ? (montantRemb / montantPreteTotal) * 100 : 0,
        };
    }
};
exports.PretsService = PretsService;
exports.PretsService = PretsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], PretsService);
//# sourceMappingURL=prets.service.js.map