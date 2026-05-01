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
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
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
  getSummary(@AuthUser() user: any) {
    return this.notificationService.getSummary(user.id);
  }

  @Put('read-all')
  markAllAsRead(@AuthUser() user: any) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string, @AuthUser() user: any) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @AuthUser() user: any) {
    return this.notificationService.remove(id, user.id);
  }
}
