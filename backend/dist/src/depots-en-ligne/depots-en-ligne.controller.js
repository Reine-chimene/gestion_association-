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
exports.DepotsEnLigneController = void 0;
const common_1 = require("@nestjs/common");
const depots_en_ligne_service_js_1 = require("./depots-en-ligne.service.js");
const create_depot_dto_js_1 = require("./dto/create-depot.dto.js");
const valider_depot_dto_js_1 = require("./dto/valider-depot.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
let DepotsEnLigneController = class DepotsEnLigneController {
    depotsEnLigneService;
    constructor(depotsEnLigneService) {
        this.depotsEnLigneService = depotsEnLigneService;
    }
    create(createDepotDto, req) {
        const tenantId = req.user.tenantId;
        return this.depotsEnLigneService.create(createDepotDto, tenantId);
    }
    getDepotsEnAttente(req) {
        const tenantId = req.user.tenantId;
        return this.depotsEnLigneService.getDepotsEnAttente(tenantId);
    }
    getDepotsByMembre(membreId, req) {
        const tenantId = req.user.tenantId;
        return this.depotsEnLigneService.getDepotsByMembre(membreId, tenantId);
    }
    validerDepot(id, validerDepotDto, req) {
        const tenantId = req.user.tenantId;
        return this.depotsEnLigneService.validerDepot(id, validerDepotDto, tenantId);
    }
    getStatistiques(req) {
        const tenantId = req.user.tenantId;
        return this.depotsEnLigneService.getStatistiques(tenantId);
    }
};
exports.DepotsEnLigneController = DepotsEnLigneController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_depot_dto_js_1.CreateDepotDto, Object]),
    __metadata("design:returntype", void 0)
], DepotsEnLigneController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('en-attente'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DepotsEnLigneController.prototype, "getDepotsEnAttente", null);
__decorate([
    (0, common_1.Get)('membre/:membreId'),
    __param(0, (0, common_1.Param)('membreId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DepotsEnLigneController.prototype, "getDepotsByMembre", null);
__decorate([
    (0, common_1.Post)(':id/valider'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, valider_depot_dto_js_1.ValiderDepotDto, Object]),
    __metadata("design:returntype", void 0)
], DepotsEnLigneController.prototype, "validerDepot", null);
__decorate([
    (0, common_1.Get)('statistiques'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DepotsEnLigneController.prototype, "getStatistiques", null);
exports.DepotsEnLigneController = DepotsEnLigneController = __decorate([
    (0, common_1.Controller)('depots-en-ligne'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [depots_en_ligne_service_js_1.DepotsEnLigneService])
], DepotsEnLigneController);
//# sourceMappingURL=depots-en-ligne.controller.js.map