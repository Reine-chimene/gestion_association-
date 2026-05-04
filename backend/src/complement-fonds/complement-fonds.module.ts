import { Module } from '@nestjs/common';
import { ComplementFondsController } from './complement-fonds.controller.js';
import { ComplementFondsService } from './complement-fonds.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CaissesModule } from '../caisses/caisses.module.js';

@Module({
  imports: [PrismaModule, CaissesModule],
  controllers: [ComplementFondsController],
  providers: [ComplementFondsService],
  exports: [ComplementFondsService],
})
export class ComplementFondsModule {}
