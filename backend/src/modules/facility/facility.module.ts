import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from '../prisma/prisma.module';
import { TicketModule } from '../ticket/ticket.module';
import { FacilityController } from './facility.controller';
import { FacilityService } from './facility.service';

@Module({
  imports: [
    PrismaModule,
    TicketModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [FacilityController],
  providers: [FacilityService],
})
export class FacilityModule {}
