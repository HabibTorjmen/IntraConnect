import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';
import { isDirector } from '../auth/auth-access.helper';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @CheckPermissions({ module: 'dashboard', action: 'read' })
  async getStats(@AuthUser() user: any) {
    if (isDirector(user)) {
      return this.dashboardService.getAdminStats();
    }
    return this.dashboardService.getEmployeeStats(user.employee?.id, user.id);
  }

  // ---- Per-module KPI ----
  @Get('leave/kpi')
  @CheckPermissions({ module: 'dashboard', action: 'read' })
  leaveKpi() { return this.dashboardService.leaveKpi(); }

  @Get('tickets/kpi')
  @CheckPermissions({ module: 'dashboard', action: 'read' })
  ticketsKpi() { return this.dashboardService.ticketsKpi(); }

  @Get('employees/kpi')
  @CheckPermissions({ module: 'dashboard', action: 'read' })
  employeesKpi() { return this.dashboardService.employeesKpi(); }

  @Get('payroll/kpi')
  @CheckPermissions({ module: 'dashboard', action: 'read' })
  payrollKpi() { return this.dashboardService.payrollKpi(); }

  @Get('documents/kpi')
  @CheckPermissions({ module: 'dashboard', action: 'read' })
  documentsKpi() { return this.dashboardService.documentsKpi(); }

  @Get('facility/kpi')
  @CheckPermissions({ module: 'dashboard', action: 'read' })
  facilityKpi() { return this.dashboardService.facilityKpi(); }

  @Get('attendance/kpi')
  @CheckPermissions({ module: 'dashboard', action: 'read' })
  attendanceKpi(@AuthUser() user: any) {
    return this.dashboardService.attendanceKpi(
      isDirector(user) ? undefined : user.employee?.id,
    );
  }

  // ---- Widgets ----
  @Get('widgets')
  @CheckPermissions({ module: 'dashboard', action: 'read' })
  listWidgets(@AuthUser() user: any) {
    const role = user.roles?.[0]?.code ?? 'employee';
    return this.dashboardService.listWidgets(role);
  }

  @Post('widgets')
  @CheckPermissions({ module: 'settings', action: 'manage' })
  upsertWidget(@Body() data: any) {
    return this.dashboardService.upsertWidget(data);
  }

  @Get('layout')
  @CheckPermissions({ module: 'dashboard', action: 'read' })
  myLayout(@AuthUser() user: any) {
    return this.dashboardService.getMyLayout(user.id);
  }

  @Post('layout')
  @CheckPermissions({ module: 'dashboard', action: 'read' })
  setLayout(@AuthUser() user: any, @Body() body: { layout: any }) {
    return this.dashboardService.setMyLayout(user.id, body.layout);
  }
}
