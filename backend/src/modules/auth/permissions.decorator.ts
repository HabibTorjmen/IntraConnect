import { SetMetadata } from '@nestjs/common';

export interface RequiredPermission {
  action: string;
  module: string;
}

export const PERMISSIONS_KEY = 'permissions';
export const CheckPermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
