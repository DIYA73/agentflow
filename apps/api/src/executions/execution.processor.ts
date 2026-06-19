import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { FlowNode, FlowGraph } from '@agentflow/shared';
import { EXECUTION_QUEUE, ExecutionsService } from './executions.service';
import { ExecutionStatus } from './entities/execution.entity';
import { NodesService } from '../nodes/nodes.service';
import { conditionBranch, getRunnableOrder, resolveNodeInput } from './graph-executor';

interface RunFlowJob {
  executionId: string;
  flow: { id: string; workspaceId: string; graph: FlowGraph };
  input?: Record<string, unknown>;
}

@Processor(EXECUTION_QUEUE)
export class ExecutionProcessor extends WorkerHost {
  private readonly logger = new Logger(ExecutionProcessor.name);

  constructor(
    private readonly executionsService: ExecutionsService,
    private readonly nodesService: NodesService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<RunFlowJob>): Promise<void> {
    if (job.name !== 'run-flow') return;

    const { executionId, flow, input } = job.data;
    const { nodes, edges } = flow.graph;

    await this.executionsService.setStatus(executionId, ExecutionStatus.RUNNING);
    await this.executionsService.appendLog(executionId, 'system', '▶ Starting flow execution');

    try {
      // Resume support: outputs of nodes that completed on a previous attempt
      // are persisted, so a retried job skips them instead of re-running
      // side-effectful work (emails, webhooks, POSTs). Seed the context and the
      // completed set from that history; a node only lands here after it
      // succeeded, so anything mid-flight when the job failed will re-run.
      const prior = await this.executionsService.loadNodeOutputs(executionId);
      const context: Record<string, unknown> = { input: input || {}, ...prior };
      const branchByNodeId = new Map<string, 'true' | 'false'>();
      const completed = new Set<string>(Object.keys(prior));

      // Rebuild branch decisions from condition nodes that completed earlier,
      // otherwise getRunnableOrder would un-skip their pruned branches.
      for (const node of nodes) {
        if (!completed.has(node.id)) continue;
        const branch = conditionBranch(node, prior[node.id]);
        if (branch) branchByNodeId.set(node.id, branch);
      }

      if (completed.size > 0) {
        await this.executionsService.appendLog(
          executionId,
          'system',
          `↻ Resuming — ${completed.size} node(s) already complete, skipping`,
        );
      }

      while (completed.size < nodes.length) {
        const order = getRunnableOrder(nodes, edges, branchByNodeId);
        const node = order.find((n) => !completed.has(n.id));
        if (!node) break;

        completed.add(node.id);
        await this.executionsService.appendLog(
          executionId,
          node.id,
          `🔄 Running node: ${node.data.label} (${node.type})`,
        );

        this.eventEmitter.emit('execution.node.status', {
          executionId,
          nodeId: node.id,
          status: 'running',
        });

        try {
          const nodeInput = resolveNodeInput(node, edges, context);
          const output = await this.nodesService.execute(node, nodeInput, executionId);
          context[node.id] = output;
          // Persist before signalling success so a retry skips this node.
          await this.executionsService.saveNodeOutput(executionId, node.id, output);

          const branch = conditionBranch(node, output);
          if (branch) branchByNodeId.set(node.id, branch);

          await this.executionsService.appendLog(
            executionId,
            node.id,
            `✅ Node complete: ${node.data.label}`,
          );

          this.eventEmitter.emit('execution.node.status', {
            executionId,
            nodeId: node.id,
            status: 'success',
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          await this.executionsService.appendLog(
            executionId,
            node.id,
            `❌ Node failed: ${msg}`,
            'error',
          );

          this.eventEmitter.emit('execution.node.status', {
            executionId,
            nodeId: node.id,
            status: 'error',
          });
          throw err;
        }
      }

      await this.executionsService.appendLog(executionId, 'system', '🎉 Flow completed successfully');
      await this.executionsService.setStatus(executionId, ExecutionStatus.SUCCESS, context);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Execution ${executionId} failed: ${msg}`);
      await this.executionsService.setStatus(executionId, ExecutionStatus.FAILED);
    }
  }
}
