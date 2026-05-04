import { Module } from '@nestjs/common';
import { MembresService } from './membres.service.js';
import { MembresController } from './membres.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [MembresController],
  providers: [MembresService],
  exports: [MembresService],
})
export class MembresModule {}
