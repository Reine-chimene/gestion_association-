import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CaissesModule } from './caisses/caisses.module.js';
import { MembresModule } from './membres/membres.module.js';
import { TontinesModule } from './tontines/tontines.module.js';
import { DepotsEnLigneModule } from './depots-en-ligne/depots-en-ligne.module.js';
import { PretsModule } from './prets/prets.module.js';
import { EpargnesModule } from './epargnes/epargnes.module.js';
import { AidesModule } from './aides/aides.module.js';
import { ProjetsModule } from './projets/projets.module.js';
import { SeancesModule } from './seances/seances.module.js';
import { SanctionsModule } from './sanctions/sanctions.module.js';
import { ComplementFondsModule } from './complement-fonds/complement-fonds.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CaissesModule,
    MembresModule,
    TontinesModule,
    DepotsEnLigneModule,
    PretsModule,
    EpargnesModule,
    AidesModule,
    ProjetsModule,
    SeancesModule,
    SanctionsModule,
    ComplementFondsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
