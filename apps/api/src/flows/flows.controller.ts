import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FlowsService } from './flows.service';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto } from './dto/update-flow.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentWorkspaceId } from '../common/decorators/current-user.decorator';

@ApiTags('Flows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('flows')
export class FlowsController {
  constructor(private readonly flowsService: FlowsService) {}

  @Get()
  findAll(@CurrentWorkspaceId() workspaceId: string) {
    return this.flowsService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentWorkspaceId() workspaceId: string) {
    return this.flowsService.findOne(id, workspaceId);
  }

  @Post()
  create(@CurrentWorkspaceId() workspaceId: string, @Body() dto: CreateFlowDto) {
    return this.flowsService.create(workspaceId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentWorkspaceId() workspaceId: string, @Body() dto: UpdateFlowDto) {
    return this.flowsService.update(id, workspaceId, dto);
  }

  @Post(':id/execute')
  execute(@Param('id') id: string, @CurrentWorkspaceId() workspaceId: string) {
    return this.flowsService.execute(id, workspaceId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentWorkspaceId() workspaceId: string) {
    return this.flowsService.remove(id, workspaceId);
  }
}
