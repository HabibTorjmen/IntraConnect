import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ description: 'List all audit logs' })
  async findAll() {
    return this.auditService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ description: 'Get audit logs for a specific user' })
  async findByUser(@Param('userId') userId: string) {
    return this.auditService.findByUser(userId);
  }
}
