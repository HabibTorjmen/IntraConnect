import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { NotificationController } from './notification.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [NotificationService, EmailService],
  controllers: [NotificationController],
  exports: [NotificationService, EmailService],
})
export class NotificationModule {}
