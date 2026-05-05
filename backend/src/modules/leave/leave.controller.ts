import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLeaveDTO, UpdateLeaveStatusDTO } from './dto/leave.dto';
import {
  CreateHolidayDTO,
  UpsertLeavePolicyDTO,
  UpsertLeaveTypeDTO,
} from './dto/leave-config.dto';
import { LeaveService } from './leave.service';
import { LeaveConfigService } from './leave-config.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';

@ApiTags('leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leave')
export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService,
    private readonly configService: LeaveConfigService,
  ) {}

  // ------- Leave types & policies (admin) -------
  @Get('types')
  @CheckPermissions({ action: 'read', module: 'leave' })
  listTypes() {
    return this.configService.listTypes();
  }

  @Post('types')
  @CheckPermissions({ action: 'manage', module: 'settings' })
  upsertType(@Body() dto: UpsertLeaveTypeDTO) {
    return this.configService.upsertType(dto);
  }

  @Delete('types/:id')
  @CheckPermissions({ action: 'manage', module: 'settings' })
  deactivateType(@Param('id') id: string) {
    return this.configService.deactivateType(id);
  }

  @Post('policies')
  @CheckPermissions({ action: 'manage', module: 'settings' })
  upsertPolicy(@Body() dto: UpsertLeavePolicyDTO) {
    return this.configService.upsertPolicy(dto);
  }

  // ------- Holidays (admin) -------
  @Get('holidays')
  @CheckPermissions({ action: 'read', module: 'leave' })
  listHolidays() {
    return this.configService.listHolidays();
  }

  @Post('holidays')
  @CheckPermissions({ action: 'manage', module: 'settings' })
  createHoliday(@Body() dto: CreateHolidayDTO) {
    return this.configService.createHoliday(dto);
  }

  @Delete('holidays/:id')
  @CheckPermissions({ action: 'manage', module: 'settings' })
  removeHoliday(@Param('id') id: string) {
    return this.configService.removeHoliday(id);
  }

  // ------- Balance & history -------
  @Get('balance')
  @CheckPermissions({ action: 'read', module: 'leave' })
  myBalances(@AuthUser() user: any) {
    return this.leaveService.balancesForEmployee(user.employee.id);
  }

  @Get('balance/:employeeId')
  @CheckPermissions({ action: 'read', module: 'leave' })
  balances(@Param('employeeId') employeeId: string) {
    return this.leaveService.balancesForEmployee(employeeId);
  }

  @Get('history/:employeeId')
  @CheckPermissions({ action: 'read', module: 'leave' })
  history(@Param('employeeId') employeeId: string) {
    return this.leaveService.historyForEmployee(employeeId);
  }

  // ------- Requests -------
  @Post()
  @CheckPermissions({ action: 'create', module: 'leave' })
  @ApiOperation({ description: 'Create a new leave request' })
  async create(@Body() data: CreateLeaveDTO, @AuthUser() user: any) {
    const isAdmin = user.roles.some((role: any) => role.name === 'admin');
    const employeeId = isAdmin ? data.employeeId : user.employee.id;
    return this.leaveService.create({ ...data, employeeId });
  }

  @Get()
  @CheckPermissions({ action: 'read', module: 'leave' })
  @ApiOperation({ description: 'List leave requests; non-admins see only their own.' })
  async findAll(@AuthUser() user: any, @Query('employeeId') employeeId?: string) {
    const isPowerful = user.roles.some((role: any) =>
      ['admin', 'manager'].includes(role.name),
    );
    if (isPowerful) {
      const all = await this.leaveService.findAll();
      return employeeId ? all.filter((l) => l.employeeId === employeeId) : all;
    }
    return this.leaveService.historyForEmployee(user.employee.id);
  }

  @Get(':id')
  @CheckPermissions({ action: 'read', module: 'leave' })
  async findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Patch(':id/status')
  @CheckPermissions({ action: 'approve', module: 'leave' })
  async updateStatus(
    @Param('id') id: string,
    @Body() data: UpdateLeaveStatusDTO,
  ) {
    return this.leaveService.updateStatus(id, data.status);
  }

  @Post(':id/cancel')
  @CheckPermissions({ action: 'create', module: 'leave' })
  async cancel(@Param('id') id: string, @AuthUser() user: any) {
    const isPowerful = user.roles.some((role: any) =>
      ['admin', 'manager'].includes(role.name),
    );
    return this.leaveService.cancel(id, user.employee.id, isPowerful);
  }

  @Delete(':id')
  @CheckPermissions({ action: 'manage', module: 'all' })
  async remove(@Param('id') id: string) {
    return this.leaveService.remove(id);
  }
}
