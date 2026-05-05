import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @CheckPermissions({ module: 'audit', action: 'read' })
  @ApiOperation({ description: 'List all audit logs' })
  async findAll() {
    return this.auditService.findAll();
  }

  @Get('user/:userId')
  @CheckPermissions({ module: 'audit', action: 'read' })
  @ApiOperation({ description: 'Get audit logs for a specific user' })
  async findByUser(@Param('userId') userId: string) {
    return this.auditService.findByUser(userId);
  }
}
