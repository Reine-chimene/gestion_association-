import { Module } from '@nestjs/common';
import { SanctionsService } from './sanctions.service.js';
import { SanctionsController } from './sanctions.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [SanctionsController],
  providers: [SanctionsService],
  exports: [SanctionsService],
})
export class SanctionsModule {}
