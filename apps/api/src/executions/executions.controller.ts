import {
  Controller, Get, Param, UseGuards, Res, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { ExecutionsService } from './executions.service';
import { ExecutionStatus } from './entities/execution.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentWorkspaceId } from '../common/decorators/current-user.decorator';

const TERMINAL_STATUSES: ExecutionStatus[] = [ExecutionStatus.SUCCESS, ExecutionStatus.FAILED];
const SSE_HEARTBEAT_MS = 15_000;

@ApiTags('Executions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('executions')
export class ExecutionsController {
  constructor(
    private readonly executionsService: ExecutionsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  findAll(@CurrentWorkspaceId() workspaceId: string) {
    return this.executionsService.findByWorkspace(workspaceId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    const execution = await this.executionsService.findOne(id, workspaceId);
    if (!execution) throw new NotFoundException(`Execution ${id} not found`);
    return execution;
  }

  /**
   * Server-Sent Events stream of an execution's logs and status. Replays the
   * history on connect, then live-tails until the execution reaches a terminal
   * state. Scoped to the caller's workspace. Auth flows through the global
   * JwtAuthGuard, which accepts the token via the `token` query param since
   * EventSource cannot set an Authorization header.
   */
  @Get(':id/stream')
  async stream(
    @Param('id') id: string,
    @CurrentWorkspaceId() workspaceId: string,
    @Res() res: Response,
  ): Promise<void> {
    const execution = await this.executionsService.findOne(id, workspaceId);
    if (!execution) throw new NotFoundException(`Execution ${id} not found`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Replay so a subscriber that connects mid-run (or after) catches up.
    for (const log of execution.logs ?? []) {
      send('log', { ...(log as Record<string, unknown>), executionId: id });
    }
    send('status', { executionId: id, status: execution.status });

    // Already finished — nothing left to tail, close cleanly.
    if (TERMINAL_STATUSES.includes(execution.status)) {
      send('done', { executionId: id });
      res.end();
      return;
    }

    const onLog = (payload: Record<string, unknown>) => {
      if (payload.executionId === id) send('log', payload);
    };
    const onStatus = (payload: { executionId: string; status: ExecutionStatus }) => {
      if (payload.executionId !== id) return;
      send('status', payload);
      if (TERMINAL_STATUSES.includes(payload.status)) {
        send('done', { executionId: id });
        cleanup();
        res.end();
      }
    };

    const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), SSE_HEARTBEAT_MS);
    const cleanup = () => {
      clearInterval(heartbeat);
      this.eventEmitter.off('execution.log', onLog);
      this.eventEmitter.off('execution.status', onStatus);
    };

    this.eventEmitter.on('execution.log', onLog);
    this.eventEmitter.on('execution.status', onStatus);
    res.on('close', cleanup);
  }
}
