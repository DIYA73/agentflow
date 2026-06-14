import {
  Controller, Get, Param, UseGuards,
  Sse, Res, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OnEvent } from '@nestjs/event-emitter';
import { Response } from 'express';
import { ExecutionsService } from './executions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentWorkspaceId } from '../common/decorators/current-user.decorator';

@ApiTags('Executions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('executions')
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get()
  findAll(@CurrentWorkspaceId() workspaceId: string) {
    return this.executionsService.findByWorkspace(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.executionsService.findOne(id);
  }

  @Get(':id/stream')
  async stream(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const execution = await this.executionsService.findOne(id);
    if (!execution) throw new NotFoundException(`Execution ${id} not found`);

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Send existing logs immediately
    if (execution.logs?.length) {
      for (const log of execution.logs) {
        send('log', { ...(log as Record<string, unknown>), executionId: id });
      }
    }

    // Send current status
    send('status', { executionId: id, status: execution.status });

    // Store listeners so we can remove them on close
    const onLog = (payload: Record<string, unknown>) => {
      if (payload['executionId'] === id) send('log', payload);
    };

    const onStatus = (payload: Record<string, unknown>) => {
      if (payload['executionId'] === id) {
        send('status', payload);
        const terminal = ['SUCCESS', 'FAILED', 'CANCELLED'];
        if (terminal.includes(String(payload['status']))) {
          send('done', { executionId: id });
          res.end();
        }
      }
    };

    this.executionsService.eventEmitter.on('execution.log', onLog);
    this.executionsService.eventEmitter.on('execution.status', onStatus);

    // Heartbeat every 15s to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15_000);

    res.on('close', () => {
      clearInterval(heartbeat);
      this.executionsService.eventEmitter.off('execution.log', onLog);
      this.executionsService.eventEmitter.off('execution.status', onStatus);
    });
  }
}
