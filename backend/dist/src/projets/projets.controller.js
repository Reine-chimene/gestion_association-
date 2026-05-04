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
exports.ProjetsController = void 0;
const common_1 = require("@nestjs/common");
const projets_service_js_1 = require("./projets.service.js");
const create_projet_dto_js_1 = require("./dto/create-projet.dto.js");
const contribuer_projet_dto_js_1 = require("./dto/contribuer-projet.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const client_1 = require("@prisma/client");
let ProjetsController = class ProjetsController {
    projetsService;
    constructor(projetsService) {
        this.projetsService = projetsService;
    }
    create(req, createProjetDto) {
        const tenantId = req.user.tenantId;
        return this.projetsService.create(tenantId, createProjetDto);
    }
    findAll(req) {
        const tenantId = req.user.tenantId;
        return this.projetsService.findAll(tenantId);
    }
    getStatistiques(req) {
        const tenantId = req.user.tenantId;
        return this.projetsService.getStatistiques(tenantId);
    }
    getAvancement(req, id) {
        const tenantId = req.user.tenantId;
        return this.projetsService.getAvancement(tenantId, id);
    }
    findOne(req, id) {
        const tenantId = req.user.tenantId;
        return this.projetsService.findOne(tenantId, id);
    }
    contribuer(req, id, contribuerDto) {
        const tenantId = req.user.tenantId;
        return this.projetsService.contribuer(tenantId, id, contribuerDto);
    }
};
exports.ProjetsController = ProjetsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT, client_1.Role.TRESORIER, client_1.Role.SECRETAIRE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_projet_dto_js_1.CreateProjetDto]),
    __metadata("design:returntype", void 0)
], ProjetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProjetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistiques/global'),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT, client_1.Role.TRESORIER, client_1.Role.SECRETAIRE),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProjetsController.prototype, "getStatistiques", null);
__decorate([
    (0, common_1.Get)(':id/avancement'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProjetsController.prototype, "getAvancement", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProjetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/contribuer'),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT, client_1.Role.TRESORIER, client_1.Role.SECRETAIRE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, contribuer_projet_dto_js_1.ContribuerProjetDto]),
    __metadata("design:returntype", void 0)
], ProjetsController.prototype, "contribuer", null);
exports.ProjetsController = ProjetsController = __decorate([
    (0, common_1.Controller)('projets'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [projets_service_js_1.ProjetsService])
], ProjetsController);
//# sourceMappingURL=projets.controller.js.map