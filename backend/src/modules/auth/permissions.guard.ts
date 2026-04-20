import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, RequiredPermission } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException('User missing roles');
    }

    const userPermissions = user.roles.flatMap((role: any) => role.permissions);

    const hasAllPermissions = requiredPermissions.every((required) =>
      userPermissions.some(
        (permission: any) =>
          permission.action === required.action &&
          permission.module === required.module,
      ),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
