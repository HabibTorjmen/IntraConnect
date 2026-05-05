import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('notification')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @CheckPermissions({ module: 'notifications', action: 'read' })
  findAll(
    @AuthUser() user: any,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.findAll(user.id, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('summary')
  @CheckPermissions({ module: 'notifications', action: 'read' })
  getSummary(@AuthUser() user: any) {
    return this.notificationService.getSummary(user.id);
  }

  @Put('read-all')
  @CheckPermissions({ module: 'notifications', action: 'update' })
  markAllAsRead(@AuthUser() user: any) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Put(':id/read')
  @CheckPermissions({ module: 'notifications', action: 'update' })
  markAsRead(@Param('id') id: string, @AuthUser() user: any) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Delete(':id')
  @CheckPermissions({ module: 'notifications', action: 'update' })
  remove(@Param('id') id: string, @AuthUser() user: any) {
    return this.notificationService.remove(id, user.id);
  }
}
