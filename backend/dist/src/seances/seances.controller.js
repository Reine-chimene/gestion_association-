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
exports.SeancesController = void 0;
const common_1 = require("@nestjs/common");
const seances_service_js_1 = require("./seances.service.js");
const create_seance_dto_js_1 = require("./dto/create-seance.dto.js");
const enregistrer_presences_dto_js_1 = require("./dto/enregistrer-presences.dto.js");
const collecter_cotisations_dto_js_1 = require("./dto/collecter-cotisations.dto.js");
const cloturer_seance_dto_js_1 = require("./dto/cloturer-seance.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const roles_guard_js_1 = require("../auth/guards/roles.guard.js");
const roles_decorator_js_1 = require("../auth/decorators/roles.decorator.js");
const client_1 = require("@prisma/client");
let SeancesController = class SeancesController {
    seancesService;
    constructor(seancesService) {
        this.seancesService = seancesService;
    }
    create(req, createSeanceDto) {
        return this.seancesService.creer(req.user.tenantId, createSeanceDto);
    }
    findAll(req) {
        return this.seancesService.findAll(req.user.tenantId);
    }
    findOne(req, id) {
        return this.seancesService.findOne(req.user.tenantId, id);
    }
    enregistrerPresences(req, id, enregistrerPresencesDto) {
        return this.seancesService.enregistrerPresences(req.user.tenantId, id, enregistrerPresencesDto);
    }
    collecterCotisations(req, id, collecterCotisationsDto) {
        return this.seancesService.collecterCotisations(req.user.tenantId, id, collecterCotisationsDto);
    }
    genererProcesVerbal(req, id) {
        return this.seancesService.genererProcesVerbal(req.user.tenantId, id);
    }
    cloturerSeance(req, id, cloturerSeanceDto) {
        return this.seancesService.cloturerSeance(req.user.tenantId, id, cloturerSeanceDto);
    }
};
exports.SeancesController = SeancesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT, client_1.Role.SECRETAIRE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_seance_dto_js_1.CreateSeanceDto]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/presences'),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT, client_1.Role.SECRETAIRE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, enregistrer_presences_dto_js_1.EnregistrerPresencesDto]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "enregistrerPresences", null);
__decorate([
    (0, common_1.Post)(':id/cotisations'),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT, client_1.Role.TRESORIER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, collecter_cotisations_dto_js_1.CollecterCotisationsDto]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "collecterCotisations", null);
__decorate([
    (0, common_1.Get)(':id/proces-verbal'),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT, client_1.Role.SECRETAIRE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "genererProcesVerbal", null);
__decorate([
    (0, common_1.Post)(':id/cloturer'),
    (0, roles_decorator_js_1.Roles)(client_1.Role.PRESIDENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, cloturer_seance_dto_js_1.CloturerSeanceDto]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "cloturerSeance", null);
exports.SeancesController = SeancesController = __decorate([
    (0, common_1.Controller)('seances'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, roles_guard_js_1.RolesGuard),
    __metadata("design:paramtypes", [seances_service_js_1.SeancesService])
], SeancesController);
//# sourceMappingURL=seances.controller.js.map