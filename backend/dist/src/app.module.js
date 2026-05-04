"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_js_1 = require("./app.controller.js");
const app_service_js_1 = require("./app.service.js");
const prisma_module_js_1 = require("./prisma/prisma.module.js");
const auth_module_js_1 = require("./auth/auth.module.js");
const caisses_module_js_1 = require("./caisses/caisses.module.js");
const membres_module_js_1 = require("./membres/membres.module.js");
const tontines_module_js_1 = require("./tontines/tontines.module.js");
const depots_en_ligne_module_js_1 = require("./depots-en-ligne/depots-en-ligne.module.js");
const prets_module_js_1 = require("./prets/prets.module.js");
const epargnes_module_js_1 = require("./epargnes/epargnes.module.js");
const aides_module_js_1 = require("./aides/aides.module.js");
const projets_module_js_1 = require("./projets/projets.module.js");
const seances_module_js_1 = require("./seances/seances.module.js");
const sanctions_module_js_1 = require("./sanctions/sanctions.module.js");
const complement_fonds_module_js_1 = require("./complement-fonds/complement-fonds.module.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_js_1.PrismaModule,
            auth_module_js_1.AuthModule,
            caisses_module_js_1.CaissesModule,
            membres_module_js_1.MembresModule,
            tontines_module_js_1.TontinesModule,
            depots_en_ligne_module_js_1.DepotsEnLigneModule,
            prets_module_js_1.PretsModule,
            epargnes_module_js_1.EpargnesModule,
            aides_module_js_1.AidesModule,
            projets_module_js_1.ProjetsModule,
            seances_module_js_1.SeancesModule,
            sanctions_module_js_1.SanctionsModule,
            complement_fonds_module_js_1.ComplementFondsModule,
        ],
        controllers: [app_controller_js_1.AppController],
        providers: [app_service_js_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map