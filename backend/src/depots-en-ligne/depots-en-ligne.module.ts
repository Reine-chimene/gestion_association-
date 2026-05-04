import { Module } from '@nestjs/common';
import { DepotsEnLigneService } from './depots-en-ligne.service.js';
import { DepotsEnLigneController } from './depots-en-ligne.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [DepotsEnLigneController],
  providers: [DepotsEnLigneService],
  exports: [DepotsEnLigneService],
})
export class DepotsEnLigneModule {}
