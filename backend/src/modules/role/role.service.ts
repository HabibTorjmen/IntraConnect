import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDTO, UpdateRoleDTO } from './dto/role.dto';

function normalizeRoleCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function splitPermission(permission: string) {
  const [module, action] = permission.split('.');

  return {
    module: module || permission,
    action: action || 'read',
  };
}

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  private roleInclude = {
    permissions: true,
    _count: {
      select: {
        users: true,
      },
    },
  };

  private toResponse(role: any) {
    return {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      permissions: role.permissions.map((permission) => `${permission.module}.${permission.action}`),
      memberCount: role._count?.users ?? role.users?.length ?? 0,
      system: ['admin', 'manager', 'employee'].includes(role.code),
    };
  }

  private buildPermissionConnect(permissions: string[] = []) {
    return permissions.map((permission) => {
      const parsed = splitPermission(permission);

      return {
        where: {
          action_module: {
            action: parsed.action,
            module: parsed.module,
          },
        },
        create: parsed,
      };
    });
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: this.roleInclude,
      orderBy: { name: 'asc' },
    });

    return roles.map((role) => this.toResponse(role));
  }

  async create(data: CreateRoleDTO) {
    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        code: normalizeRoleCode(data.code || data.name),
        description: data.description,
        permissions: {
          connectOrCreate: this.buildPermissionConnect(data.permissions),
        },
      },
      include: this.roleInclude,
    });

    return this.toResponse(role);
  }

  async update(id: string, data: UpdateRoleDTO) {
    const updateData: Prisma.RoleUpdateInput = {
      name: data.name,
      code: data.code ? normalizeRoleCode(data.code) : undefined,
      description: data.description,
    };

    if (data.permissions) {
      updateData.permissions = {
        set: [],
        connectOrCreate: this.buildPermissionConnect(data.permissions),
      };
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: updateData,
      include: this.roleInclude,
    });

    return this.toResponse(role);
  }

  async remove(id: string) {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
