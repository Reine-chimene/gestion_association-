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
exports.PretsController = void 0;
const common_1 = require("@nestjs/common");
const prets_service_js_1 = require("./prets.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const create_pret_dto_js_1 = require("./dto/create-pret.dto.js");
const enregistrer_paiement_dto_js_1 = require("./dto/enregistrer-paiement.dto.js");
const reconduire_pret_dto_js_1 = require("./dto/reconduire-pret.dto.js");
let PretsController = class PretsController {
    pretsService;
    constructor(pretsService) {
        this.pretsService = pretsService;
    }
    async create(dto, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.pretsService.create(tenantId, responsableId, dto);
    }
    async findAll(statut, type, emprunteurId, limit, offset, req) {
        const tenantId = req.user.tenantId;
        return this.pretsService.findAll(tenantId, {
            statut,
            type,
            emprunteurId,
            limit,
            offset,
        });
    }
    async findOne(id, req) {
        const tenantId = req.user.tenantId;
        return this.pretsService.findOne(tenantId, id);
    }
    async enregistrerPaiement(id, dto, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.pretsService.enregistrerPaiement(tenantId, id, responsableId, dto);
    }
    async reconduire(id, dto, req) {
        const tenantId = req.user.tenantId;
        return this.pretsService.reconduire(tenantId, id, dto);
    }
    async declencherRecouvrementForce(id, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.pretsService.declencherRecouvrementForce(tenantId, id, responsableId);
    }
    async getEcheancier(id, req) {
        const tenantId = req.user.tenantId;
        return this.pretsService.getEcheancier(tenantId, id);
    }
    async getSoldeRestant(id, req) {
        const tenantId = req.user.tenantId;
        return this.pretsService.getSoldeRestant(tenantId, id);
    }
    async getStatistiques(req) {
        const tenantId = req.user.tenantId;
        return this.pretsService.getStatistiques(tenantId);
    }
};
exports.PretsController = PretsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pret_dto_js_1.CreatePretDto, Object]),
    __metadata("design:returntype", Promise)
], PretsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Query)('statut')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('emprunteurId')),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(4, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(5, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PretsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PretsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/paiement'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, enregistrer_paiement_dto_js_1.EnregistrerPaiementDto, Object]),
    __metadata("design:returntype", Promise)
], PretsController.prototype, "enregistrerPaiement", null);
__decorate([
    (0, common_1.Post)(':id/reconduire'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reconduire_pret_dto_js_1.ReconduirePretDto, Object]),
    __metadata("design:returntype", Promise)
], PretsController.prototype, "reconduire", null);
__decorate([
    (0, common_1.Post)(':id/recouvrement-force'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PretsController.prototype, "declencherRecouvrementForce", null);
__decorate([
    (0, common_1.Get)(':id/echeancier'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PretsController.prototype, "getEcheancier", null);
__decorate([
    (0, common_1.Get)(':id/solde-restant'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PretsController.prototype, "getSoldeRestant", null);
__decorate([
    (0, common_1.Get)('statistiques/global'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PretsController.prototype, "getStatistiques", null);
exports.PretsController = PretsController = __decorate([
    (0, common_1.Controller)('prets'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [prets_service_js_1.PretsService])
], PretsController);
//# sourceMappingURL=prets.controller.js.map