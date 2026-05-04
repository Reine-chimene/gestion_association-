import { Module } from '@nestjs/common';
import { CaissesService } from './caisses.service.js';
import { CaissesController } from './caisses.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [CaissesController],
  providers: [CaissesService],
  exports: [CaissesService],
})
export class CaissesModule {}
