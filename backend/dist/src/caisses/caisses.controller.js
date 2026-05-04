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
exports.CaissesController = void 0;
const common_1 = require("@nestjs/common");
const caisses_service_js_1 = require("./caisses.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const crediter_caisse_dto_js_1 = require("./dto/crediter-caisse.dto.js");
const debiter_caisse_dto_js_1 = require("./dto/debiter-caisse.dto.js");
const decharge_caisse_dto_js_1 = require("./dto/decharge-caisse.dto.js");
const versement_bancaire_dto_js_1 = require("./dto/versement-bancaire.dto.js");
let CaissesController = class CaissesController {
    caissesService;
    constructor(caissesService) {
        this.caissesService = caissesService;
    }
    async getAllCaisses(req) {
        const tenantId = req.user.tenantId;
        return this.caissesService.getAllCaisses(tenantId);
    }
    async crediter(type, dto, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.caissesService.crediter(tenantId, type, dto.montant, dto.motif, responsableId, dto.reference);
    }
    async debiter(type, dto, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.caissesService.debiter(tenantId, type, dto.montant, dto.motif, responsableId, dto.reference);
    }
    async decharge(type, dto, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.caissesService.decharge(tenantId, type, dto.montant, dto.motif, dto.justification, responsableId);
    }
    async versementBancaire(type, dto, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.caissesService.versementBancaire(tenantId, type, dto.montant, dto.motif, dto.reference, responsableId);
    }
    async getSolde(type, req) {
        const tenantId = req.user.tenantId;
        return this.caissesService.getSolde(tenantId, type);
    }
    async getHistorique(type, dateDebut, dateFin, limit, offset, req) {
        const tenantId = req.user.tenantId;
        return this.caissesService.getHistorique(tenantId, type, dateDebut ? new Date(dateDebut) : undefined, dateFin ? new Date(dateFin) : undefined, limit, offset);
    }
    async verifierCoherence(type, req) {
        const tenantId = req.user.tenantId;
        return this.caissesService.verifierCoherence(tenantId, type);
    }
};
exports.CaissesController = CaissesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CaissesController.prototype, "getAllCaisses", null);
__decorate([
    (0, common_1.Post)(':type/crediter'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crediter_caisse_dto_js_1.CrediterCaisseDto, Object]),
    __metadata("design:returntype", Promise)
], CaissesController.prototype, "crediter", null);
__decorate([
    (0, common_1.Post)(':type/debiter'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, debiter_caisse_dto_js_1.DebiterCaisseDto, Object]),
    __metadata("design:returntype", Promise)
], CaissesController.prototype, "debiter", null);
__decorate([
    (0, common_1.Post)(':type/decharge'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, decharge_caisse_dto_js_1.DechargeCaisseDto, Object]),
    __metadata("design:returntype", Promise)
], CaissesController.prototype, "decharge", null);
__decorate([
    (0, common_1.Post)(':type/versement-bancaire'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, versement_bancaire_dto_js_1.VersementBancaireDto, Object]),
    __metadata("design:returntype", Promise)
], CaissesController.prototype, "versementBancaire", null);
__decorate([
    (0, common_1.Get)(':type/solde'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CaissesController.prototype, "getSolde", null);
__decorate([
    (0, common_1.Get)(':type/historique'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'COMMISSAIRE'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Query)('dateDebut')),
    __param(2, (0, common_1.Query)('dateFin')),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(4, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(5, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], CaissesController.prototype, "getHistorique", null);
__decorate([
    (0, common_1.Get)(':type/verifier-coherence'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'COMMISSAIRE'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CaissesController.prototype, "verifierCoherence", null);
exports.CaissesController = CaissesController = __decorate([
    (0, common_1.Controller)('caisses'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [caisses_service_js_1.CaissesService])
], CaissesController);
//# sourceMappingURL=caisses.controller.js.map