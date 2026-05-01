import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RoleService } from './role.service';
import { CreateRoleDTO, UpdateRoleDTO } from './dto/role.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Post()
  @CheckPermissions({ module: 'roles', action: 'manage' })
  create(@Body() data: CreateRoleDTO) {
    return this.roleService.create(data);
  }

  @Put(':id')
  @CheckPermissions({ module: 'roles', action: 'manage' })
  update(@Param('id') id: string, @Body() data: UpdateRoleDTO) {
    return this.roleService.update(id, data);
  }

  @Delete(':id')
  @CheckPermissions({ module: 'roles', action: 'manage' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
