import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';

@Controller('payroll')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @CheckPermissions({ action: 'manage', module: 'all' }) // Only admin can create payroll records
  create(@Body() createPayrollDto: any) {
    return this.payrollService.create(createPayrollDto);
  }

  @Get()
  @CheckPermissions({ action: 'view', module: 'payroll' })
  findAll(@AuthUser() user: any, @Query('employeeId') employeeId?: string) {
    const where: any = {};
    
    // Check if user is admin or manager
    const isPowerful = user.roles.some(role => ['admin', 'manager'].includes(role.name));
    
    if (isPowerful) {
      if (employeeId) where.employeeId = employeeId;
    } else {
      // Regular employees can only see their own records
      where.employeeId = user.employee.id;
    }

    return this.payrollService.findAll({ 
      where,
      orderBy: { period: 'desc' }
    });
  }

  @Get(':id')
  @CheckPermissions({ action: 'view', module: 'payroll' })
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(id);
  }

  @Patch(':id')
  @CheckPermissions({ action: 'manage', module: 'all' })
  update(@Param('id') id: string, @Body() updatePayrollDto: any) {
    return this.payrollService.update(id, updatePayrollDto);
  }
}
