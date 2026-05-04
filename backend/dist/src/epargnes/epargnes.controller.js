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
exports.EpargnesController = void 0;
const common_1 = require("@nestjs/common");
const epargnes_service_js_1 = require("./epargnes.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const cotiser_dto_js_1 = require("./dto/cotiser.dto.js");
const redistribuer_dto_js_1 = require("./dto/redistribuer.dto.js");
const client_1 = require("@prisma/client");
let EpargnesController = class EpargnesController {
    epargnesService;
    constructor(epargnesService) {
        this.epargnesService = epargnesService;
    }
    async cotiser(dto, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.epargnesService.cotiser(tenantId, responsableId, dto);
    }
    async getSolde(membreId, type, req) {
        const tenantId = req.user.tenantId;
        return this.epargnesService.calculerSolde(tenantId, membreId, type);
    }
    async redistribuer(dto, req) {
        const tenantId = req.user.tenantId;
        const responsableId = req.user.userId;
        return this.epargnesService.redistribuer(tenantId, responsableId, dto);
    }
    async getInteretsGeneres(type, tauxInteret, req) {
        const tenantId = req.user.tenantId;
        const taux = parseFloat(tauxInteret) || 0;
        return this.epargnesService.calculerInteretsGeneres(tenantId, type, taux);
    }
    async findAll(type, req) {
        const tenantId = req.user.tenantId;
        return this.epargnesService.findAll(tenantId, type);
    }
    async findOne(id, req) {
        const tenantId = req.user.tenantId;
        return this.epargnesService.findOne(tenantId, id);
    }
    async getStatistiques(req) {
        const tenantId = req.user.tenantId;
        return this.epargnesService.getStatistiques(tenantId);
    }
};
exports.EpargnesController = EpargnesController;
__decorate([
    (0, common_1.Post)('cotiser'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cotiser_dto_js_1.CotiserDto, Object]),
    __metadata("design:returntype", Promise)
], EpargnesController.prototype, "cotiser", null);
__decorate([
    (0, common_1.Get)('solde/:membreId'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE'),
    __param(0, (0, common_1.Param)('membreId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EpargnesController.prototype, "getSolde", null);
__decorate([
    (0, common_1.Post)('redistribuer'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [redistribuer_dto_js_1.RedistribuerDto, Object]),
    __metadata("design:returntype", Promise)
], EpargnesController.prototype, "redistribuer", null);
__decorate([
    (0, common_1.Get)('interets-generes'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('tauxInteret')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EpargnesController.prototype, "getInteretsGeneres", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EpargnesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EpargnesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('statistiques/global'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EpargnesController.prototype, "getStatistiques", null);
exports.EpargnesController = EpargnesController = __decorate([
    (0, common_1.Controller)('epargnes'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [epargnes_service_js_1.EpargnesService])
], EpargnesController);
//# sourceMappingURL=epargnes.controller.js.map