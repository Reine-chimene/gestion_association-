import { Module } from '@nestjs/common';
import { EpargnesService } from './epargnes.service.js';
import { EpargnesController } from './epargnes.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CaissesModule } from '../caisses/caisses.module.js';

@Module({
  imports: [PrismaModule, CaissesModule],
  controllers: [EpargnesController],
  providers: [EpargnesService],
  exports: [EpargnesService],
})
export class EpargnesModule {}
