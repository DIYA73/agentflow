import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentWorkspaceId } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workspace')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  getWorkspace(@CurrentWorkspaceId() workspaceId: string) {
    return this.workspacesService.findById(workspaceId);
  }

  @Get('members')
  getMembers(@CurrentWorkspaceId() workspaceId: string) {
    return this.workspacesService.getMembers(workspaceId);
  }

  @Patch()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  updateWorkspace(
    @CurrentWorkspaceId() workspaceId: string,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.workspacesService.update(workspaceId, body);
  }
}
