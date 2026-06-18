import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentWorkspaceId } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { TemplateCategory } from './template.entity';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Public()
  @Get()
  findAll(@Query('category') category?: TemplateCategory) {
    return this.service.findAll(category);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/use')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  useTemplate(
    @Param('id') id: string,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.service.useTemplate(id, workspaceId);
  }
}
