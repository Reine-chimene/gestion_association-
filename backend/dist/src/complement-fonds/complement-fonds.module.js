"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplementFondsModule = void 0;
const common_1 = require("@nestjs/common");
const complement_fonds_controller_js_1 = require("./complement-fonds.controller.js");
const complement_fonds_service_js_1 = require("./complement-fonds.service.js");
const prisma_module_js_1 = require("../prisma/prisma.module.js");
const caisses_module_js_1 = require("../caisses/caisses.module.js");
let ComplementFondsModule = class ComplementFondsModule {
};
exports.ComplementFondsModule = ComplementFondsModule;
exports.ComplementFondsModule = ComplementFondsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_js_1.PrismaModule, caisses_module_js_1.CaissesModule],
        controllers: [complement_fonds_controller_js_1.ComplementFondsController],
        providers: [complement_fonds_service_js_1.ComplementFondsService],
        exports: [complement_fonds_service_js_1.ComplementFondsService],
    })
], ComplementFondsModule);
//# sourceMappingURL=complement-fonds.module.js.map