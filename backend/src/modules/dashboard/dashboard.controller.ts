import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@AuthUser() user: any) {
    // Check for admin/HR roles
    const isAdmin = user.roles ? user.roles.some(r => r.name === 'ADMIN' || r.name === 'HR') : false;
    
    if (isAdmin) {
      return this.dashboardService.getAdminStats();
    }
    return this.dashboardService.getEmployeeStats(user.id);
  }
}
