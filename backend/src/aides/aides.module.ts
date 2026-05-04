import { Module } from '@nestjs/common';
import { AidesService } from './aides.service.js';
import { AidesController } from './aides.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CaissesModule } from '../caisses/caisses.module.js';

@Module({
  imports: [PrismaModule, CaissesModule],
  controllers: [AidesController],
  providers: [AidesService],
  exports: [AidesService],
})
export class AidesModule {}
