import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ToolController],
  providers: [ToolService],
})
export class ToolModule {}
