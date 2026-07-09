import { Module } from '@nestjs/common';
import { KistisController } from './kistis.controller';
import { KistisService } from './kistis.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [KistisController],
  providers: [KistisService, PrismaService],
  exports: [KistisService],
})
export class KistisModule {}