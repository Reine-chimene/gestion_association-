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
exports.ComplementFondsController = void 0;
const common_1 = require("@nestjs/common");
const complement_fonds_service_js_1 = require("./complement-fonds.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const create_complement_fonds_dto_js_1 = require("./dto/create-complement-fonds.dto.js");
const enregistrer_paiement_dto_js_1 = require("./dto/enregistrer-paiement.dto.js");
let ComplementFondsController = class ComplementFondsController {
    complementFondsService;
    constructor(complementFondsService) {
        this.complementFondsService = complementFondsService;
    }
    async calculerComplementAnnuel(dto, req) {
        const tenantId = req.user.tenantId;
        return this.complementFondsService.calculerComplementAnnuel(tenantId, dto.annee, dto.montantTotal);
    }
    async findAll(annee, statut, limit, offset, req) {
        const tenantId = req.user.tenantId;
        return this.complementFondsService.findAll(tenantId, {
            annee: annee && annee > 0 ? annee : undefined,
            statut,
            limit,
            offset,
        });
    }
    async getSuiviPaiements(id, req) {
        const tenantId = req.user.tenantId;
        return this.complementFondsService.getSuiviPaiements(tenantId, id);
    }
    async findOne(id, req) {
        const tenantId = req.user.tenantId;
        return this.complementFondsService.findOne(tenantId, id);
    }
    async enregistrerPaiement(id, dto, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.complementFondsService.enregistrerPaiement(tenantId, id, responsableId, {
            membreId: dto.membreId,
            montant: dto.montant,
            modePaiement: dto.modePaiement,
        });
    }
    async augmenter(id, nouveauMontantTotal, req) {
        const tenantId = req.user.tenantId;
        return this.complementFondsService.augmenter(tenantId, id, nouveauMontantTotal);
    }
    async casser(id, motif, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.complementFondsService.casser(tenantId, id, responsableId, motif);
    }
};
exports.ComplementFondsController = ComplementFondsController;
__decorate([
    (0, common_1.Post)('calculer'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_complement_fonds_dto_js_1.CreateComplementFondsDto, Object]),
    __metadata("design:returntype", Promise)
], ComplementFondsController.prototype, "calculerComplementAnnuel", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Query)('annee', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('statut')),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ComplementFondsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/suivi-paiements'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplementFondsController.prototype, "getSuiviPaiements", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplementFondsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/paiements'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, enregistrer_paiement_dto_js_1.EnregistrerPaiementDto, Object]),
    __metadata("design:returntype", Promise)
], ComplementFondsController.prototype, "enregistrerPaiement", null);
__decorate([
    (0, common_1.Put)(':id/augmenter'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('nouveauMontantTotal')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], ComplementFondsController.prototype, "augmenter", null);
__decorate([
    (0, common_1.Put)(':id/casser'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('motif')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ComplementFondsController.prototype, "casser", null);
exports.ComplementFondsController = ComplementFondsController = __decorate([
    (0, common_1.Controller)('complement-fonds'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [complement_fonds_service_js_1.ComplementFondsService])
], ComplementFondsController);
//# sourceMappingURL=complement-fonds.controller.js.map