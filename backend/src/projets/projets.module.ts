import { Module } from '@nestjs/common';
import { ProjetsService } from './projets.service.js';
import { ProjetsController } from './projets.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ProjetsController],
  providers: [ProjetsService],
  exports: [ProjetsService],
})
export class ProjetsModule {}
