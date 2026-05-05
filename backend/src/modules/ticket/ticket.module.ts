import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { SlaScheduler } from './sla.scheduler';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  ],
  controllers: [TicketController],
  providers: [TicketService, SlaScheduler],
  exports: [TicketService],
})
export class TicketModule {}
