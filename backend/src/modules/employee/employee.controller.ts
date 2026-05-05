import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { EmployeeService, EmployeeListParams } from './employee.service';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';
import { BulkEmployeeIdsDTO, BulkUpdateDTO } from './dto/bulk-update.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('employee')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @CheckPermissions({ module: 'employees', action: 'manage' })
  async create(@Body() data: CreateEmployeeDTO, @AuthUser() user: any) {
    return this.employeeService.create(data, user);
  }

  @Get()
  @CheckPermissions({ module: 'employees', action: 'read' })
  async findAll(@AuthUser() user: any, @Query() query: any) {
    const params: EmployeeListParams = {
      query: query.q,
      departmentId: query.departmentId,
      roleId: query.roleId,
      status: query.status,
      contractType: query.contractType,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    };
    return this.employeeService.findAll(user, params);
  }

  @Get('search/advanced')
  @CheckPermissions({ module: 'employees', action: 'read' })
  async search(
    @AuthUser() user: any,
    @Query('q') query?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ) {
    return this.employeeService.search(user, query, departmentId, status);
  }

  @Get('export/csv')
  @CheckPermissions({ module: 'employees', action: 'read' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="employees.csv"')
  async exportCsv(
    @AuthUser() user: any,
    @Query() query: any,
    @Res() res: Response,
  ) {
    const csv = await this.employeeService.exportCsv(user, {
      query: query.q,
      departmentId: query.departmentId,
      status: query.status,
      contractType: query.contractType,
    });
    res.send(csv);
  }

  @Post('bulk')
  @CheckPermissions({ module: 'employees', action: 'manage' })
  async bulkImport(@Body() employees: CreateEmployeeDTO[], @AuthUser() user: any) {
    return this.employeeService.bulkImport(employees, user);
  }

  @Post('bulk/update')
  @CheckPermissions({ module: 'employees', action: 'manage' })
  async bulkUpdate(@Body() dto: BulkUpdateDTO, @AuthUser() user: any) {
    return this.employeeService.bulkUpdate(dto, user);
  }

  @Post('bulk/activate')
  @CheckPermissions({ module: 'employees', action: 'manage' })
  async bulkActivate(@Body() dto: BulkEmployeeIdsDTO, @AuthUser() user: any) {
    return this.employeeService.bulkSetStatus(dto.ids, 'active', user);
  }

  @Post('bulk/deactivate')
  @CheckPermissions({ module: 'employees', action: 'manage' })
  async bulkDeactivate(@Body() dto: BulkEmployeeIdsDTO, @AuthUser() user: any) {
    return this.employeeService.bulkSetStatus(dto.ids, 'inactive', user);
  }

  @Get(':id')
  @CheckPermissions({ module: 'employees', action: 'read' })
  async findOne(@Param('id') id: string, @AuthUser() user: any) {
    const employee = await this.employeeService.findOne(id, user);
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  @Put(':id')
  @CheckPermissions({ module: 'employees', action: 'update' })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateEmployeeDTO,
    @AuthUser() user: any,
  ) {
    return this.employeeService.update(id, data, user);
  }

  @Post(':id/deactivate')
  @CheckPermissions({ module: 'employees', action: 'manage' })
  async deactivate(@Param('id') id: string, @AuthUser() user: any) {
    return this.employeeService.deactivate(id, user);
  }

  @Post(':id/reactivate')
  @CheckPermissions({ module: 'employees', action: 'manage' })
  async reactivate(
    @Param('id') id: string,
    @Query('regenerateOtp') regenerateOtp: string,
    @AuthUser() user: any,
  ) {
    return this.employeeService.reactivate(id, user, regenerateOtp === 'true');
  }

  @Delete(':id')
  @CheckPermissions({ module: 'employees', action: 'manage' })
  async remove(@Param('id') id: string, @AuthUser() user: any) {
    return this.employeeService.remove(id, user);
  }
}
