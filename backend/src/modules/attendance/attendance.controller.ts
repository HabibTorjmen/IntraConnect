import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get('policies')
  @CheckPermissions({ action: 'read', module: 'attendance' })
  policies() {
    return this.service.listPolicies();
  }

  @Post('policies')
  @CheckPermissions({ action: 'manage', module: 'settings' })
  upsertPolicy(@Body() data: any) {
    return this.service.upsertPolicy(data);
  }

  @Get('today')
  @CheckPermissions({ action: 'read', module: 'attendance' })
  today(@AuthUser() user: any) {
    return this.service.todayState(user.employee.id);
  }

  @Post('action')
  @CheckPermissions({ action: 'create', module: 'attendance' })
  submit(
    @Body('action') action: string,
    @AuthUser() user: any,
  ) {
    if (!['clock_in', 'break_start', 'break_end', 'clock_out'].includes(action)) {
      throw new BadRequestException('Invalid action');
    }
    return this.service.submitAction(user.employee.id, action as any);
  }

  @Post('records/:id/correct')
  @CheckPermissions({ action: 'manage', module: 'attendance' })
  correct(
    @Param('id') id: string,
    @Body() body: { field: string; newValueIso: string; reason: string },
    @AuthUser() user: any,
  ) {
    return this.service.correct(id, user.id, body.field, body.newValueIso, body.reason);
  }

  @Get('summary/:employeeId')
  @CheckPermissions({ action: 'read', module: 'attendance' })
  summary(
    @Param('employeeId') employeeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @AuthUser() user: any,
  ) {
    if (employeeId !== user.employee.id) {
      const isPowerful = user.roles.some((r: any) =>
        ['admin', 'manager'].includes(r.name),
      );
      if (!isPowerful) {
        throw new BadRequestException('Cannot view another employee\'s attendance');
      }
    }
    return this.service.dailySummary(employeeId, new Date(from), new Date(to));
  }

  @Get('team-live')
  @CheckPermissions({ action: 'read', module: 'attendance' })
  teamLive(@AuthUser() user: any) {
    return this.service.teamLive(user.employee.id);
  }

  @Get('export/:employeeId/csv')
  @CheckPermissions({ action: 'read', module: 'attendance' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="attendance.csv"')
  async exportCsv(
    @Param('employeeId') employeeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @AuthUser() user: any,
    @Res() res: Response,
  ) {
    const isPowerful = user.roles.some((r: any) =>
      ['admin', 'manager'].includes(r.name),
    );
    const csv = await this.service.exportCsv(
      employeeId,
      new Date(from),
      new Date(to),
      isPowerful,
    );
    res.send(csv);
  }
}
