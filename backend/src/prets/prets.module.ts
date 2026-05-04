import { Module } from '@nestjs/common';
import { PretsService } from './prets.service.js';
import { PretsController } from './prets.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PretsController],
  providers: [PretsService],
  exports: [PretsService],
})
export class PretsModule {}
