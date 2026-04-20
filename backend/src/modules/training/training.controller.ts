import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { TrainingService } from './training.service';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { SetMetadata } from '@nestjs/common';
import { AuthUser } from '../auth/auth.user.decorator';

// Helper for permissions
const CheckPermissions = (...perms: { action: string; module: string }[]) => 
  SetMetadata('permissions', perms);

@Controller('training')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @CheckPermissions({ action: 'create', module: 'TrainingPlan' })
  create(@Body() data: any) {
    return this.trainingService.create(data);
  }

  @Get()
  @CheckPermissions({ action: 'read', module: 'TrainingPlan' })
  findAll(@AuthUser() user: any) {
    if (user.roles.some(r => r.name === 'ADMIN' || r.name === 'HR')) {
      return this.trainingService.findAll();
    }
    return this.trainingService.findByEmployee(user.id);
  }

  @Get('employee/:employeeId')
  @CheckPermissions({ action: 'read', module: 'TrainingPlan' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.trainingService.findByEmployee(employeeId);
  }

  @Put(':id')
  @CheckPermissions({ action: 'update', module: 'TrainingPlan' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.trainingService.update(id, data);
  }

  @Delete(':id')
  @CheckPermissions({ action: 'delete', module: 'TrainingPlan' })
  remove(@Param('id') id: string) {
    return this.trainingService.remove(id);
  }
}
