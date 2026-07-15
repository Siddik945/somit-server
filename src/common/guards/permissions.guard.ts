import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admin users have all permissions
    const userRoleName = user.role?.name || user.role;
    if (userRoleName === 'ADMIN') {
      return true;
    }

    // Get user's permissions from their role
    const userPermissions = user.role?.permissions || [];
    const userPermissionNames = userPermissions.map((p: any) => p.name);

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((requiredPermission) =>
      userPermissionNames.includes(requiredPermission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
