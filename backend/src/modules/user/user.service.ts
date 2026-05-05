import { Prisma, User } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

/**
 * charge.docx §4.2: each employee is assigned exactly one role.
 * Schema keeps Role[] for back-compat, but writes go through this helper
 * so the invariant holds.
 */
export function enforceSingleRole<T extends Prisma.UserCreateInput | Prisma.UserUpdateInput>(
  data: T,
): T {
  const roles = (data as any).roles;
  if (!roles) return data;

  const collect = (k: 'connect' | 'set') => {
    const v = roles?.[k];
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  const connectIds = collect('connect').map((r) => r.id).filter(Boolean);
  const setIds = collect('set').map((r) => r.id).filter(Boolean);
  const total = connectIds.length + setIds.length;

  if (total > 1) {
    throw new BadRequestException(
      'Each employee must be assigned exactly one role (charge.docx §4.2).',
    );
  }

  if (setIds.length === 0 && connectIds.length === 1) {
    (data as any).roles = { set: [{ id: connectIds[0] }] };
  }

  return data;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: {
        employee: {
          include: {
            department: true,
            jobTitle: true,
            manager: true,
          },
        },
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        employee: true,
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data: enforceSingleRole(data),
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data: enforceSingleRole(data),
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
