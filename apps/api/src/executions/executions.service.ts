import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
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
    await this.executionQueue.add(
      'run-flow',
      { executionId: saved.id, flow, input },
      {
        // Retries are safe: the processor persists each node's output and
        // resumes from the first incomplete node, so already-completed
        // (potentially side-effectful) nodes are not re-run on retry.
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    );
    return saved;
  }

  /** Outputs of nodes that completed in a previous attempt (for resume). */
  async loadNodeOutputs(executionId: string): Promise<Record<string, unknown>> {
    const execution = await this.executionRepo.findOne({ where: { id: executionId } });
    return execution?.nodeOutputs ?? {};
  }

  /** Persist a single node's output so a retried job can skip it. */
  async saveNodeOutput(executionId: string, nodeId: string, output: unknown): Promise<void> {
    const execution = await this.executionRepo.findOne({ where: { id: executionId } });
    if (!execution) return;
    execution.nodeOutputs = { ...(execution.nodeOutputs || {}), [nodeId]: output };
    await this.executionRepo.save(execution);
  }

  async appendLog(
    executionId: string,
    nodeId: string,
    message: string,
    level: 'info' | 'warn' | 'error' = 'info',
  ): Promise<void> {
    const entry = { nodeId, message, level, timestamp: new Date().toISOString() };
    const execution = await this.executionRepo.findOne({ where: { id: executionId } });
    if (!execution) return;

    const logs = Array.isArray(execution.logs) ? [...execution.logs] : [];
    logs.push(entry);
    execution.logs = logs;
    await this.executionRepo.save(execution);
    this.eventEmitter.emit('execution.log', { executionId, ...entry });
  }

  async setStatus(
    executionId: string,
    status: ExecutionStatus,
    output?: unknown,
  ): Promise<void> {
    const update: Partial<Execution> = { status };
    if (status === ExecutionStatus.RUNNING) update.startedAt = new Date();
    if ([ExecutionStatus.SUCCESS, ExecutionStatus.FAILED].includes(status)) {
      update.finishedAt = new Date();
      if (output !== undefined) update.output = output;
    }
    await this.executionRepo.update(executionId, update);
    this.eventEmitter.emit('execution.status', { executionId, status });
  }

  async findByFlow(flowId: string): Promise<Execution[]> {
    return this.executionRepo.find({ where: { flowId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async findByWorkspace(workspaceId: string): Promise<Execution[]> {
    return this.executionRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findOne(id: string, workspaceId?: string): Promise<Execution | null> {
    const where: { id: string; workspaceId?: string } = { id };
    if (workspaceId) where.workspaceId = workspaceId;
    return this.executionRepo.findOne({ where });
  }
}

