import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB per charge.docx §4.7
      },
    }),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
