import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flow, FlowStatus, FlowGraph } from './entities/flow.entity';
import { CreateFlowDto } from './dto/create-flow.dto';
import { UpdateFlowDto } from './dto/update-flow.dto';

@Injectable()
export class FlowsService {
  constructor(
    @InjectRepository(Flow)
    private readonly flowRepo: Repository<Flow>,
  ) {}

  async create(workspaceId: string, dto: CreateFlowDto): Promise<Flow> {
    const flow = this.flowRepo.create({
      workspaceId,
      name: dto.name,
      description: dto.description,
      graph: dto.graph || { nodes: [], edges: [] },
      status: FlowStatus.DRAFT,
      version: 1,
      versionHistory: [],
    });
    return this.flowRepo.save(flow);
  }

  async findAll(workspaceId: string): Promise<Flow[]> {
    return this.flowRepo.find({
      where: { workspaceId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, workspaceId: string): Promise<Flow> {
    const flow = await this.flowRepo.findOne({ where: { id, workspaceId } });
    if (!flow) throw new NotFoundException(`Flow ${id} not found`);
    return flow;
  }

  async update(id: string, workspaceId: string, dto: UpdateFlowDto): Promise<Flow> {
    const flow = await this.findOne(id, workspaceId);
    if (dto.graph) {
      const history = flow.versionHistory || [];
      history.push({ version: flow.version, graph: flow.graph, savedAt: new Date().toISOString() });
      if (history.length > 10) history.shift();
      flow.versionHistory = history;
      flow.version = flow.version + 1;
      flow.graph = dto.graph;
    }
    if (dto.name) flow.name = dto.name;
    if (dto.description !== undefined) flow.description = dto.description;
    if (dto.status) flow.status = dto.status;
    return this.flowRepo.save(flow);
  }

  async execute(id: string, workspaceId: string): Promise<{ id: string; status: string }> {
    await this.findOne(id, workspaceId);
    // Execution engine will be wired in next phase
    return { id: `exec_${Date.now()}`, status: 'queued' };
  }

  async remove(id: string, workspaceId: string): Promise<void> {
    const flow = await this.findOne(id, workspaceId);
    await this.flowRepo.remove(flow);
  }
}
