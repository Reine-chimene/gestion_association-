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
exports.MembresController = void 0;
const common_1 = require("@nestjs/common");
const membres_service_js_1 = require("./membres.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const create_membre_dto_js_1 = require("./dto/create-membre.dto.js");
const update_membre_dto_js_1 = require("./dto/update-membre.dto.js");
const change_status_dto_js_1 = require("./dto/change-status.dto.js");
let MembresController = class MembresController {
    membresService;
    constructor(membresService) {
        this.membresService = membresService;
    }
    async create(dto, req) {
        const tenantId = req.user.tenantId;
        return this.membresService.create(tenantId, {
            nom: dto.nom,
            prenom: dto.prenom,
            telephone: dto.telephone,
            email: dto.email,
            dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
            adresse: dto.adresse,
            situationMatrimoniale: dto.situationMatrimoniale,
            nombreEnfants: dto.nombreEnfants,
            parrainId: dto.parrainId,
            userId: dto.userId,
        });
    }
    async getMyProfile(req) {
        const tenantId = req.user.tenantId;
        const userId = req.user.userId;
        const membre = await this.membresService.findByUserId(tenantId, userId);
        return membre;
    }
    async findAll(statut, search, limit, offset, req) {
        const tenantId = req.user.tenantId;
        return this.membresService.findAll(tenantId, {
            statut,
            search,
            limit,
            offset,
        });
    }
    async getStatistiques(req) {
        const tenantId = req.user.tenantId;
        return this.membresService.getStatistiques(tenantId);
    }
    async getSituationNette(id, req) {
        const tenantId = req.user.tenantId;
        return this.membresService.getSituationNette(tenantId, id);
    }
    async changeStatus(id, dto, req) {
        const tenantId = req.user.tenantId;
        return this.membresService.changeStatus(tenantId, id, dto.statut, dto.motif);
    }
    async findOne(id, req) {
        const tenantId = req.user.tenantId;
        return this.membresService.findOne(tenantId, id);
    }
    async update(id, dto, req) {
        const tenantId = req.user.tenantId;
        return this.membresService.update(tenantId, id, {
            nom: dto.nom,
            prenom: dto.prenom,
            telephone: dto.telephone,
            email: dto.email,
            dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
            adresse: dto.adresse,
            photoUrl: dto.photoUrl,
            cniUrl: dto.cniUrl,
        });
    }
};
exports.MembresController = MembresController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'SECRETAIRE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_membre_dto_js_1.CreateMembreDto, Object]),
    __metadata("design:returntype", Promise)
], MembresController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me/profil'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembresController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'SECRETAIRE', 'TRESORIER', 'COMMISSAIRE'),
    __param(0, (0, common_1.Query)('statut')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], MembresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistiques'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'SECRETAIRE', 'TRESORIER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembresController.prototype, "getStatistiques", null);
__decorate([
    (0, common_1.Get)(':id/situation-nette'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'COMMISSAIRE', 'MEMBRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MembresController.prototype, "getSituationNette", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_status_dto_js_1.ChangeStatusDto, Object]),
    __metadata("design:returntype", Promise)
], MembresController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'SECRETAIRE', 'TRESORIER', 'COMMISSAIRE', 'MEMBRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MembresController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'SECRETAIRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_membre_dto_js_1.UpdateMembreDto, Object]),
    __metadata("design:returntype", Promise)
], MembresController.prototype, "update", null);
exports.MembresController = MembresController = __decorate([
    (0, common_1.Controller)('membres'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [membres_service_js_1.MembresService])
], MembresController);
//# sourceMappingURL=membres.controller.js.map