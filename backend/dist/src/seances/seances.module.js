"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeancesModule = void 0;
const common_1 = require("@nestjs/common");
const seances_service_js_1 = require("./seances.service.js");
const seances_controller_js_1 = require("./seances.controller.js");
const prisma_module_js_1 = require("../prisma/prisma.module.js");
let SeancesModule = class SeancesModule {
};
exports.SeancesModule = SeancesModule;
exports.SeancesModule = SeancesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_js_1.PrismaModule],
        controllers: [seances_controller_js_1.SeancesController],
        providers: [seances_service_js_1.SeancesService],
        exports: [seances_service_js_1.SeancesService],
    })
], SeancesModule);
//# sourceMappingURL=seances.module.js.map