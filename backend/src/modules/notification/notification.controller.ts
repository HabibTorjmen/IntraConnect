import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@AuthUser() user: any) {
    return this.notificationService.findAll(user.id);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
