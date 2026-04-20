import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditController } from './audit.controller';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AuditService],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
