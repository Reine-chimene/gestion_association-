"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PretsModule = void 0;
const common_1 = require("@nestjs/common");
const prets_service_js_1 = require("./prets.service.js");
const prets_controller_js_1 = require("./prets.controller.js");
const prisma_module_js_1 = require("../prisma/prisma.module.js");
let PretsModule = class PretsModule {
};
exports.PretsModule = PretsModule;
exports.PretsModule = PretsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_js_1.PrismaModule],
        controllers: [prets_controller_js_1.PretsController],
        providers: [prets_service_js_1.PretsService],
        exports: [prets_service_js_1.PretsService],
    })
], PretsModule);
//# sourceMappingURL=prets.module.js.map