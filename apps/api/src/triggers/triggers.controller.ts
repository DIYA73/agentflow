import {
  Controller, Get, Post, Delete, Patch,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TriggersService } from './triggers.service';
import { CreateTriggerDto } from './dto/create-trigger.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentWorkspaceId } from '../common/decorators/current-user.decorator';

@ApiTags('Triggers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('triggers')
export class TriggersController {
  constructor(private readonly triggersService: TriggersService) {}

  @Get()
  findAll(@CurrentWorkspaceId() workspaceId: string) {
    return this.triggersService.findAll(workspaceId);
  }

  @Post('cron')
  createCron(
    @CurrentWorkspaceId() workspaceId: string,
    @Body() dto: CreateTriggerDto,
  ) {
    return this.triggersService.createCronTrigger(workspaceId, dto);
  }

  @Post('webhook')
  createWebhook(
    @CurrentWorkspaceId() workspaceId: string,
    @Body() dto: CreateTriggerDto,
  ) {
    return this.triggersService.createWebhookTrigger(workspaceId, dto);
  }

  @Patch(':id')
  toggle(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.triggersService.toggle(id, body.isActive);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.triggersService.remove(id, workspaceId);
  }
}
