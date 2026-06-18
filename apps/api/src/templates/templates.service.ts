import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template, TemplateCategory } from './template.entity';
import { FlowsService } from '../flows/flows.service';
import type { Flow } from '../flows/entities/flow.entity';
import { BUILTIN_TEMPLATES } from './templates.seed';

@Injectable()
export class TemplatesService implements OnModuleInit {
  constructor(
    @InjectRepository(Template)
    private readonly repo: Repository<Template>,
    private readonly flowsService: FlowsService,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.repo.count({ where: { isBuiltin: true } });
    if (count === 0) {
      await this.repo.save(
        BUILTIN_TEMPLATES.map((t) => this.repo.create(t)),
      );
    }
  }

  async findAll(category?: TemplateCategory): Promise<Template[]> {
    const where = category ? { category } : {};
    return this.repo.find({ where, order: { useCount: 'DESC', createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Template> {
    const template = await this.repo.findOne({ where: { id } });
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    return template;
  }

  async useTemplate(id: string, workspaceId: string): Promise<Flow> {
    const template = await this.findOne(id);

    const flow = await this.flowsService.create(workspaceId, {
      name: `${template.name} (from template)`,
      description: template.description,
      graph: template.graph,
    });

    await this.repo.increment({ id }, 'useCount', 1);
    return flow;
  }
}
