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
exports.DepotsEnLigneService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const valider_depot_dto_js_1 = require("./dto/valider-depot.dto.js");
const library_1 = require("@prisma/client/runtime/library");
let DepotsEnLigneService = class DepotsEnLigneService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDepotDto, tenantId) {
        const membre = await this.prisma.membre.findFirst({
            where: {
                id: createDepotDto.membreId,
                tenantId,
            },
        });
        if (!membre) {
            throw new common_1.NotFoundException('Membre non trouvé');
        }
        const depot = await this.prisma.depotEnLigne.create({
            data: {
                membreId: createDepotDto.membreId,
                type: createDepotDto.type,
                montant: new library_1.Decimal(createDepotDto.montant),
                preuveUrl: createDepotDto.preuveUrl,
                motifAbsence: createDepotDto.motifAbsence,
                statut: 'EN_ATTENTE_VALIDATION',
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
        return depot;
    }
    async getDepotsEnAttente(tenantId) {
        return this.prisma.depotEnLigne.findMany({
            where: {
                statut: 'EN_ATTENTE_VALIDATION',
                membre: {
                    tenantId,
                },
            },
            include: {
                membre: {
                    select: {
                        numeroMembre: true,
                        nom: true,
                        prenom: true,
                        telephone: true,
                    },
                },
            },
            orderBy: {
                dateDepot: 'desc',
            },
        });
    }
    async getDepotsByMembre(membreId, tenantId) {
        const membre = await this.prisma.membre.findFirst({
            where: {
                id: membreId,
                tenantId,
            },
        });
        if (!membre) {
            throw new common_1.NotFoundException('Membre non trouvé');
        }
        return this.prisma.depotEnLigne.findMany({
            where: {
                membreId,
            },
            orderBy: {
                dateDepot: 'desc',
            },
        });
    }
    async validerDepot(depotId, validerDepotDto, tenantId) {
        const depot = await this.prisma.depotEnLigne.findFirst({
            where: {
                id: depotId,
                membre: {
                    tenantId,
                },
            },
            include: {
                membre: true,
            },
        });
        if (!depot) {
            throw new common_1.NotFoundException('Dépôt non trouvé');
        }
        if (depot.statut !== 'EN_ATTENTE_VALIDATION') {
            throw new common_1.BadRequestException('Ce dépôt a déjà été traité');
        }
        const nouveauStatut = validerDepotDto.action === valider_depot_dto_js_1.ActionValidation.VALIDER ? 'VALIDE' : 'REJETE';
        const depotMisAJour = await this.prisma.depotEnLigne.update({
            where: { id: depotId },
            data: {
                statut: nouveauStatut,
                dateValidation: new Date(),
                validateurId: validerDepotDto.validateurId,
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
        if (nouveauStatut === 'VALIDE') {
        }
        return depotMisAJour;
    }
    async getStatistiques(tenantId) {
        const [enAttente, valides, rejetes, totalMontant] = await Promise.all([
            this.prisma.depotEnLigne.count({
                where: {
                    statut: 'EN_ATTENTE_VALIDATION',
                    membre: { tenantId },
                },
            }),
            this.prisma.depotEnLigne.count({
                where: {
                    statut: 'VALIDE',
                    membre: { tenantId },
                },
            }),
            this.prisma.depotEnLigne.count({
                where: {
                    statut: 'REJETE',
                    membre: { tenantId },
                },
            }),
            this.prisma.depotEnLigne.aggregate({
                where: {
                    statut: 'VALIDE',
                    membre: { tenantId },
                },
                _sum: {
                    montant: true,
                },
            }),
        ]);
        return {
            enAttente,
            valides,
            rejetes,
            totalMontant: totalMontant._sum.montant || 0,
        };
    }
};
exports.DepotsEnLigneService = DepotsEnLigneService;
exports.DepotsEnLigneService = DepotsEnLigneService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], DepotsEnLigneService);
//# sourceMappingURL=depots-en-ligne.service.js.map