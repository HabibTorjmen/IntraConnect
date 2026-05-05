import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckPermissions } from '../auth/permissions.decorator';
import { AuthHelpers } from '../../shared/helpers/auth.helpers';
import { assertPasswordPolicy } from '../../shared/helpers/password-policy.helper';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @CheckPermissions({ module: 'employees', action: 'read' })
  async getAll(): Promise<User[]> {
    return this.userService.users({});
  }

  @Post('user')
  @CheckPermissions({ module: 'employees', action: 'manage' })
  async signupUser(
    @Body() userData: { name: string; email: string; password: string; roleId?: string },
  ): Promise<User> {
    assertPasswordPolicy(userData.password);
    const hashedPassword = await AuthHelpers.hash(userData.password);
    return this.userService.createUser({
      username: userData.name,
      email: userData.email,
      passwordHash: hashedPassword,
      roles: userData.roleId
        ? {
            connect: {
              id: userData.roleId,
            },
          }
        : undefined,
    });
  }
}
