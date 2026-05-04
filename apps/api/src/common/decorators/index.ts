import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { JwtPayload } from '../../auth/auth.service';
import { UserRole } from '../../users/entities/user.entity';

// ─── @CurrentUser() ───────────────────────────────────────
// Injects the full JWT payload into controller params
//
// Usage:
//   @Get('me')
//   getMe(@CurrentUser() user: JwtPayload) { ... }

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// ─── @CurrentWorkspaceId() ────────────────────────────────
// Shortcut — injects just the workspaceId string
//
// Usage:
//   @Get()
//   getFlows(@CurrentWorkspaceId() workspaceId: string) { ... }

export const CurrentWorkspaceId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.workspaceId;
  },
);

// ─── @Public() ────────────────────────────────────────────
// Marks a route as public (skips JwtAuthGuard)
//
// Usage:
//   @Public()
//   @Post('login')
//   login() { ... }

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// ─── @Roles() ─────────────────────────────────────────────
// Restricts a route to specific roles
//
// Usage:
//   @Roles(UserRole.OWNER, UserRole.ADMIN)
//   @Delete(':id')
//   deleteFlow() { ... }

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
