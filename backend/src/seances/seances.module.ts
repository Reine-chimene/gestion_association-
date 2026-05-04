import { Module } from '@nestjs/common';
import { SeancesService } from './seances.service.js';
import { SeancesController } from './seances.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [SeancesController],
  providers: [SeancesService],
  exports: [SeancesService],
})
export class SeancesModule {}
