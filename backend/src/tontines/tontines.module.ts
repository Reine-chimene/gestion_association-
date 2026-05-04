import { Module } from '@nestjs/common';
import { TontinesService } from './tontines.service.js';
import { TontinesController } from './tontines.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CaissesModule } from '../caisses/caisses.module.js';

@Module({
  imports: [PrismaModule, CaissesModule],
  controllers: [TontinesController],
  providers: [TontinesService],
  exports: [TontinesService],
})
export class TontinesModule {}
