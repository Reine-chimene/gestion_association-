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
exports.AidesController = void 0;
const common_1 = require("@nestjs/common");
const aides_service_js_1 = require("./aides.service.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const demander_aide_maladie_dto_js_1 = require("./dto/demander-aide-maladie.dto.js");
const declarer_deces_dto_js_1 = require("./dto/declarer-deces.dto.js");
const approuver_aide_dto_js_1 = require("./dto/approuver-aide.dto.js");
const rejeter_aide_dto_js_1 = require("./dto/rejeter-aide.dto.js");
const client_1 = require("@prisma/client");
let AidesController = class AidesController {
    aidesService;
    constructor(aidesService) {
        this.aidesService = aidesService;
    }
    async demanderAideMaladie(dto, req) {
        const tenantId = req.user.tenantId;
        return this.aidesService.demanderAideMaladie(tenantId, dto);
    }
    async declarerDeces(dto, req) {
        const tenantId = req.user.tenantId;
        return this.aidesService.declarerDeces(tenantId, dto);
    }
    async approuver(id, dto, req) {
        const tenantId = req.user.tenantId;
        const approbateurId = req.user.userId;
        return this.aidesService.approuver(tenantId, id, approbateurId, dto);
    }
    async rejeter(id, dto, req) {
        const tenantId = req.user.tenantId;
        return this.aidesService.rejeter(tenantId, id, dto);
    }
    async findAll(type, statut, beneficiaireId, limit, offset, req) {
        const tenantId = req.user.tenantId;
        return this.aidesService.findAll(tenantId, {
            type,
            statut,
            beneficiaireId,
            limit,
            offset,
        });
    }
    async getStatistiques(req) {
        const tenantId = req.user.tenantId;
        return this.aidesService.getStatistiques(tenantId);
    }
    async findOne(id, req) {
        const tenantId = req.user.tenantId;
        return this.aidesService.findOne(tenantId, id);
    }
};
exports.AidesController = AidesController;
__decorate([
    (0, common_1.Post)('maladie'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [demander_aide_maladie_dto_js_1.DemanderAideMaladieDto, Object]),
    __metadata("design:returntype", Promise)
], AidesController.prototype, "demanderAideMaladie", null);
__decorate([
    (0, common_1.Post)('deces'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [declarer_deces_dto_js_1.DeclarerDecesDto, Object]),
    __metadata("design:returntype", Promise)
], AidesController.prototype, "declarerDeces", null);
__decorate([
    (0, common_1.Post)(':id/approuver'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approuver_aide_dto_js_1.ApprouverAideDto, Object]),
    __metadata("design:returntype", Promise)
], AidesController.prototype, "approuver", null);
__decorate([
    (0, common_1.Post)(':id/rejeter'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rejeter_aide_dto_js_1.RejeterAideDto, Object]),
    __metadata("design:returntype", Promise)
], AidesController.prototype, "rejeter", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('statut')),
    __param(2, (0, common_1.Query)('beneficiaireId')),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(4, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(5, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], AidesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistiques/global'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AidesController.prototype, "getStatistiques", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_js_1.Roles)('PRESIDENT', 'TRESORIER', 'SECRETAIRE', 'MEMBRE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AidesController.prototype, "findOne", null);
exports.AidesController = AidesController = __decorate([
    (0, common_1.Controller)('aides'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [aides_service_js_1.AidesService])
], AidesController);
//# sourceMappingURL=aides.controller.js.map