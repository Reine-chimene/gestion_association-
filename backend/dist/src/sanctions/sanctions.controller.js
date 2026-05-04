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
exports.SanctionsController = void 0;
const common_1 = require("@nestjs/common");
const sanctions_service_js_1 = require("./sanctions.service.js");
const create_type_sanction_dto_js_1 = require("./dto/create-type-sanction.dto.js");
const update_type_sanction_dto_js_1 = require("./dto/update-type-sanction.dto.js");
const appliquer_sanction_dto_js_1 = require("./dto/appliquer-sanction.dto.js");
const annuler_sanction_dto_js_1 = require("./dto/annuler-sanction.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const client_1 = require("@prisma/client");
let SanctionsController = class SanctionsController {
    sanctionsService;
    constructor(sanctionsService) {
        this.sanctionsService = sanctionsService;
    }
    createTypeSanction(req, createTypeSanctionDto) {
        return this.sanctionsService.createTypeSanction(req.user.tenantId, createTypeSanctionDto);
    }
    findAllTypesSanctions(req) {
        return this.sanctionsService.findAllTypesSanctions(req.user.tenantId);
    }
    findOneTypeSanction(req, id) {
        return this.sanctionsService.findOneTypeSanction(req.user.tenantId, id);
    }
    updateTypeSanction(req, id, updateTypeSanctionDto) {
        return this.sanctionsService.updateTypeSanction(req.user.tenantId, id, updateTypeSanctionDto);
    }
    removeTypeSanction(req, id) {
        return this.sanctionsService.removeTypeSanction(req.user.tenantId, id);
    }
    appliquerSanction(req, appliquerSanctionDto) {
        return this.sanctionsService.appliquerSanction(req.user.tenantId, appliquerSanctionDto);
    }
    findAllSanctions(req, membreId, statut) {
        return this.sanctionsService.findAllSanctions(req.user.tenantId, membreId, statut);
    }
    findOneSanction(req, id) {
        return this.sanctionsService.findOneSanction(req.user.tenantId, id);
    }
    annulerSanction(req, id, annulerSanctionDto) {
        return this.sanctionsService.annulerSanction(req.user.tenantId, id, annulerSanctionDto);
    }
    marquerPayee(req, id) {
        return this.sanctionsService.marquerPayee(req.user.tenantId, id);
    }
    getSanctionsByMembre(req, membreId) {
        return this.sanctionsService.getSanctionsByMembre(req.user.tenantId, membreId);
    }
    getTotalSanctionsImpayees(req, membreId) {
        return this.sanctionsService.getTotalSanctionsImpayees(req.user.tenantId, membreId);
    }
};
exports.SanctionsController = SanctionsController;
__decorate([
    (0, common_1.Post)('types'),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_type_sanction_dto_js_1.CreateTypeSanctionDto]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "createTypeSanction", null);
__decorate([
    (0, common_1.Get)('types'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "findAllTypesSanctions", null);
__decorate([
    (0, common_1.Get)('types/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "findOneTypeSanction", null);
__decorate([
    (0, common_1.Patch)('types/:id'),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_type_sanction_dto_js_1.UpdateTypeSanctionDto]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "updateTypeSanction", null);
__decorate([
    (0, common_1.Delete)('types/:id'),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "removeTypeSanction", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT, client_1.Role.SECRETAIRE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, appliquer_sanction_dto_js_1.AppliquerSanctionDto]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "appliquerSanction", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('membreId')),
    __param(2, (0, common_1.Query)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "findAllSanctions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "findOneSanction", null);
__decorate([
    (0, common_1.Post)(':id/annuler'),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, annuler_sanction_dto_js_1.AnnulerSanctionDto]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "annulerSanction", null);
__decorate([
    (0, common_1.Post)(':id/payer'),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT, client_1.Role.TRESORIER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "marquerPayee", null);
__decorate([
    (0, common_1.Get)('membre/:membreId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('membreId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "getSanctionsByMembre", null);
__decorate([
    (0, common_1.Get)('membre/:membreId/total-impayees'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('membreId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SanctionsController.prototype, "getTotalSanctionsImpayees", null);
exports.SanctionsController = SanctionsController = __decorate([
    (0, common_1.Controller)('sanctions'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [sanctions_service_js_1.SanctionsService])
], SanctionsController);
//# sourceMappingURL=sanctions.controller.js.map