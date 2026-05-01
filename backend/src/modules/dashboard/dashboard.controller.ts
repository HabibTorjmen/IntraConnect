import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { AuthUser } from '../auth/auth.user.decorator';
import { isDirector } from '../auth/auth-access.helper';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@AuthUser() user: any) {
    if (isDirector(user)) {
      return this.dashboardService.getAdminStats();
    }

    return this.dashboardService.getEmployeeStats(user.employee?.id, user.id);
  }
}
