// Add this method to your existing ExecutionsService class:

// async findByWorkspace(workspaceId: string): Promise<Execution[]> {
//   return this.executionRepo.find({
//     where: { workspaceId },
//     order: { createdAt: 'DESC' },
//     take: 100,
//   });
// }

// Full updated executions.service.ts — replace your existing file with this:

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { Flow } from '../flows/entities/flow.entity';
import { Execution, ExecutionStatus } from './entities/execution.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

export const EXECUTION_QUEUE = 'execution';

@Injectable()
export class ExecutionsService {
  private readonly logger = new Logger(ExecutionsService.name);

  constructor(
    @InjectQueue(EXECUTION_QUEUE)
    private readonly executionQueue: Queue,
    @InjectRepository(Execution)
    private readonly executionRepo: Repository<Execution>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async enqueue(flow: Flow, input?: Record<string, unknown>): Promise<Execution> {
    const execution = this.executionRepo.create({
      flowId: flow.id,
      workspaceId: flow.workspaceId,
      status: ExecutionStatus.QUEUED,
      input: input || {},
      logs: [],
      startedAt: null,
      finishedAt: null,
    });
    const saved = await this.executionRepo.save(execution);
    await this.executionQueue.add('run-flow', { executionId: saved.id, flow, input }, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
    });
    return saved;
  }

  async appendLog(executionId: string, nodeId: string, message: string, level: 'info' | 'warn' | 'error' = 'info'): Promise<void> {
    const entry = { nodeId, message, level, timestamp: new Date().toISOString() };
    await this.executionRepo.createQueryBuilder()
      .update(Execution)
      .set({ logs: () => `logs || '${JSON.stringify(entry)}'::jsonb` })
      .where('id = :id', { id: executionId })
      .execute();
    this.eventEmitter.emit('execution.log', { executionId, ...entry });
  }

  async setStatus(executionId: string, status: ExecutionStatus, output?: unknown): Promise<void> {
    const update: Partial<Execution> = { status };
    if (status === ExecutionStatus.RUNNING) update.startedAt = new Date();
    if ([ExecutionStatus.SUCCESS, ExecutionStatus.FAILED].includes(status)) {
      update.finishedAt = new Date();
      if (output) update.output = output;
    }
    await this.executionRepo.update(executionId, update);
    this.eventEmitter.emit('execution.status', { executionId, status });
  }

  async findByFlow(flowId: string): Promise<Execution[]> {
    return this.executionRepo.find({ where: { flowId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async findByWorkspace(workspaceId: string): Promise<Execution[]> {
    return this.executionRepo.find({ where: { workspaceId }, order: { createdAt: 'DESC' }, take: 100 });
  }

  async findOne(id: string): Promise<Execution | null> {
    return this.executionRepo.findOne({ where: { id } });
  }
}
