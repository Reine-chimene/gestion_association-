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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TontinesController = void 0;
const common_1 = require("@nestjs/common");
const tontines_service_js_1 = require("./tontines.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const create_tontine_dto_js_1 = require("./dto/create-tontine.dto.js");
const collecter_cotisations_dto_js_1 = require("./dto/collecter-cotisations.dto.js");
const distribuer_cagnotte_dto_js_1 = require("./dto/distribuer-cagnotte.dto.js");
const vendre_tour_dto_js_1 = require("./dto/vendre-tour.dto.js");
const vendre_interets_dto_js_1 = require("./dto/vendre-interets.dto.js");
let TontinesController = class TontinesController {
    tontinesService;
    constructor(tontinesService) {
        this.tontinesService = tontinesService;
    }
    async create(dto, req) {
        const tenantId = req.user.tenantId;
        return this.tontinesService.create(tenantId, {
            nom: dto.nom,
            type: dto.type,
            montantCotisation: dto.montantCotisation,
            frequence: dto.frequence,
            dateDebut: new Date(dto.dateDebut),
            participants: dto.participants,
        });
    }
    async findAll(statut, type, limit, offset, req) {
        const tenantId = req.user.tenantId;
        return this.tontinesService.findAll(tenantId, {
            statut,
            type,
            limit,
            offset,
        });
    }
    async collecterCotisations(id, dto, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.tontinesService.collecterCotisations(tenantId, id, responsableId, dto.cotisations);
    }
    async distribuerCagnotte(id, dto, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.tontinesService.distribuerCagnotte(tenantId, id, responsableId, {
            prets: dto.retenuesPrets,
            sanctions: dto.retenuesSanctions,
            complementFonds: dto.retenuesComplementFonds,
        });
    }
    async sellTour(id, dto, req) {
        const tenantId = req.user.tenantId;
        return this.tontinesService.sellTour(tenantId, id, {
            acheteurId: dto.acheteurId,
            tourOriginal: dto.tourOriginal,
            montantOffre: dto.montantOffre,
        });
    }
    async sellInterets(id, dto, req) {
        const tenantId = req.user.tenantId;
        return this.tontinesService.sellInterets(tenantId, id, {
            vendeurId: dto.vendeurId,
            acheteurId: dto.acheteurId,
            montantInterets: dto.montantInterets,
            montantOffre: dto.montantOffre,
            modalite: dto.modalite,
        });
    }
    async attribuerTourGratuit(id, beneficiaireId, req) {
        const tenantId = req.user.tenantId;
        return this.tontinesService.attribuerTourGratuit(tenantId, id, beneficiaireId);
    }
    async getVentesTour(id, req) {
        const tenantId = req.user.tenantId;
        const tontine = await this.tontinesService.findOne(tenantId, id);
        return tontine.ventesTours || [];
    }
    async getToursGratuits(id, req) {
        const tenantId = req.user.tenantId;
        const tontine = await this.tontinesService.findOne(tenantId, id);
        return tontine.toursGratuits || [];
    }
    async getBeneficiaireActuel(id, req) {
        const tenantId = req.user.tenantId;
        return this.tontinesService.getBeneficiaireActuel(tenantId, id);
    }
    async verifierTourGratuit(id, membreId, req) {
        const tenantId = req.user.tenantId;
        return this.tontinesService.verifierTourGratuit(tenantId, id, membreId);
    }
    async findOne(id, req) {
        const tenantId = req.user.tenantId;
        return this.tontinesService.findOne(tenantId, id);
    }
};
exports.TontinesController = TontinesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tontine_dto_js_1.CreateTontineDto, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Query)('statut')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':id/collecter-cotisations'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, collecter_cotisations_dto_js_1.CollecterCotisationsDto, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "collecterCotisations", null);
__decorate([
    (0, common_1.Post)(':id/distribuer-cagnotte'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, distribuer_cagnotte_dto_js_1.DistribuerCagnotteDto, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "distribuerCagnotte", null);
__decorate([
    (0, common_1.Post)(':id/vendre-tour'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vendre_tour_dto_js_1.VendreTourDto, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "sellTour", null);
__decorate([
    (0, common_1.Post)(':id/vendre-interets'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vendre_interets_dto_js_1.VendreInteretsDto, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "sellInterets", null);
__decorate([
    (0, common_1.Post)(':id/attribuer-tour-gratuit/:beneficiaireId'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('beneficiaireId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "attribuerTourGratuit", null);
__decorate([
    (0, common_1.Get)(':id/ventes-tours'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "getVentesTour", null);
__decorate([
    (0, common_1.Get)(':id/tours-gratuits'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "getToursGratuits", null);
__decorate([
    (0, common_1.Get)(':id/beneficiaire-actuel'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "getBeneficiaireActuel", null);
__decorate([
    (0, common_1.Get)(':id/verifier-tour-gratuit/:membreId'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('membreId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "verifierTourGratuit", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "findOne", null);
exports.TontinesController = TontinesController = __decorate([
    (0, common_1.Controller)('tontines'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [tontines_service_js_1.TontinesService])
], TontinesController);
//# sourceMappingURL=tontines.controller.js.map