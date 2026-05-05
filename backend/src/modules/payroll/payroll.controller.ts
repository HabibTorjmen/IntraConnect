import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthUser } from '../auth/auth.user.decorator';

function ctxFrom(req: Request) {
  return {
    ip: (req.headers['x-forwarded-for'] as string) ?? req.ip,
    userAgent: req.headers['user-agent'] as string,
  };
}

@Controller('payroll')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('upload')
  @CheckPermissions({ action: 'manage', module: 'payroll' })
  @UseInterceptors(FileInterceptor('file'))
  uploadOne(
    @UploadedFile() file: Express.Multer.File,
    @Body('employeeId') employeeId: string,
    @Body('period') period: string,
    @AuthUser() user: any,
    @Req() req: Request,
  ) {
    if (!employeeId || !period) {
      throw new BadRequestException('employeeId and period required');
    }
    return this.payrollService.uploadOne(file, employeeId, period, user.id, ctxFrom(req));
  }

  @Post('bulk-zip')
  @CheckPermissions({ action: 'manage', module: 'payroll' })
  @UseInterceptors(FileInterceptor('file'))
  bulkZip(
    @UploadedFile() file: Express.Multer.File,
    @Body('period') period: string,
    @AuthUser() user: any,
    @Req() req: Request,
  ) {
    if (!period) throw new BadRequestException('period required');
    return this.payrollService.bulkUploadZip(file, period, user.id, ctxFrom(req));
  }

  @Post(':id/publish')
  @CheckPermissions({ action: 'manage', module: 'payroll' })
  publish(@Param('id') id: string, @AuthUser() user: any, @Req() req: Request) {
    return this.payrollService.publish(id, user.id, ctxFrom(req));
  }

  @Post()
  @CheckPermissions({ action: 'manage', module: 'payroll' })
  create(@Body() createPayrollDto: any) {
    return this.payrollService.create(createPayrollDto);
  }

  @Get()
  @CheckPermissions({ action: 'view', module: 'payroll' })
  findAll(@AuthUser() user: any, @Query('employeeId') employeeId?: string) {
    const where: any = {};
    const isPowerful = user.roles.some((role: any) =>
      ['admin', 'manager'].includes(role.name),
    );
    if (isPowerful) {
      if (employeeId) where.employeeId = employeeId;
    } else {
      where.employeeId = user.employee.id;
      where.status = 'published';
    }
    return this.payrollService.findAll({ where, orderBy: { period: 'desc' } });
  }

  @Get(':id')
  @CheckPermissions({ action: 'view', module: 'payroll' })
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(id);
  }

  /** charge.docx §4.8: re-auth + signed URL, no attachment ever leaves S3. */
  @Post(':id/download')
  @CheckPermissions({ action: 'view', module: 'payroll' })
  async download(
    @Param('id') id: string,
    @Body('password') password: string,
    @AuthUser() user: any,
    @Req() req: Request,
  ): Promise<{ url: string }> {
    if (!password) {
      throw new BadRequestException('Re-authentication required: provide password.');
    }
    const ok = await this.payrollService.verifyReAuth(user.id, password);
    if (!ok) {
      await this.payrollService.logAccess(id, user.id, 'failed_access', ctxFrom(req));
      throw new UnauthorizedException('Re-authentication failed');
    }
    const isPowerful = user.roles.some((role: any) =>
      ['admin', 'manager'].includes(role.name),
    );
    const url = await this.payrollService.getDownloadUrl(
      id,
      { userId: user.id, employeeId: user.employee?.id, isPowerful },
      ctxFrom(req),
    );
    return { url };
  }

  @Patch(':id')
  @CheckPermissions({ action: 'manage', module: 'payroll' })
  update(@Param('id') id: string, @Body() updatePayrollDto: any) {
    return this.payrollService.update(id, updatePayrollDto);
  }
}
