import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 200 * 1024 * 1024 }, // bulk ZIP up to 200MB
    }),
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
})
export class PayrollModule {}
