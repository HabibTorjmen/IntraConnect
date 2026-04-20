import { Module } from '@nestjs/common';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LeaveController],
  providers: [LeaveService],
})
export class LeaveModule {}
