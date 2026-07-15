import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role?.name || user.role;

    if (!userRole) {
      throw new ForbiddenException('User has no role assigned');
    }

    const hasRole = requiredRoles.some((role) => userRole === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Missing required role. Required: ${requiredRoles.join(', ')}, User has: ${userRole}`,
      );
    }

    return true;
  }
}
