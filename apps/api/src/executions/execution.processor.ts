import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EXECUTION_QUEUE, ExecutionsService } from './executions.service';
import { ExecutionStatus } from './entities/execution.entity';
import { NodesService } from '../nodes/nodes.service';
import { FlowNode, FlowEdge, FlowGraph } from '../flows/entities/flow.entity';

interface RunFlowJob {
  executionId: string;
  flow: { id: string; workspaceId: string; graph: FlowGraph };
  input?: Record<string, unknown>;
}

@Processor(EXECUTION_QUEUE)
export class ExecutionProcessor {
  private readonly logger = new Logger(ExecutionProcessor.name);

  constructor(
    private readonly executionsService: ExecutionsService,
    private readonly nodesService: NodesService,
  ) {}

  @Process('run-flow')
  async handleRunFlow(job: Job<RunFlowJob>): Promise<void> {
    const { executionId, flow, input } = job.data;
    const { nodes, edges } = flow.graph;

    await this.executionsService.setStatus(executionId, ExecutionStatus.RUNNING);
    await this.executionsService.appendLog(executionId, 'system', `▶ Starting flow execution`);

    try {
      // Topologically sort nodes to determine execution order
      const sorted = this.topologicalSort(nodes, edges);

      // Context map: nodeId -> output data
      const context: Record<string, unknown> = { input: input || {} };

      for (const node of sorted) {
        await this.executionsService.appendLog(
          executionId,
          node.id,
          `🔄 Running node: ${node.data.label} (${node.type})`,
        );

        try {
          const nodeInput = this.resolveNodeInput(node, edges, context);
          const output = await this.nodesService.execute(node, nodeInput, executionId);
          context[node.id] = output;

          await this.executionsService.appendLog(
            executionId,
            node.id,
            `✅ Node complete: ${node.data.label}`,
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          await this.executionsService.appendLog(
            executionId,
            node.id,
            `❌ Node failed: ${msg}`,
            'error',
          );
          throw err;
        }
      }

      await this.executionsService.appendLog(executionId, 'system', `🎉 Flow completed successfully`);
      await this.executionsService.setStatus(executionId, ExecutionStatus.SUCCESS, context);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Execution ${executionId} failed: ${msg}`);
      await this.executionsService.setStatus(executionId, ExecutionStatus.FAILED);
    }
  }

  /**
   * Kahn's algorithm for topological sort of the flow DAG
   */
  private topologicalSort(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    nodes.forEach((n) => { inDegree.set(n.id, 0); adjList.set(n.id, []); });
    edges.forEach((e) => {
      adjList.get(e.source)?.push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    });

    const queue = nodes.filter((n) => inDegree.get(n.id) === 0);
    const sorted: FlowNode[] = [];

    while (queue.length > 0) {
      const node = queue.shift()!;
      sorted.push(node);

      for (const neighborId of adjList.get(node.id) || []) {
        const deg = (inDegree.get(neighborId) || 0) - 1;
        inDegree.set(neighborId, deg);
        if (deg === 0) {
          const neighbor = nodes.find((n) => n.id === neighborId);
          if (neighbor) queue.push(neighbor);
        }
      }
    }

    return sorted;
  }

  private resolveNodeInput(
    node: FlowNode,
    edges: FlowEdge[],
    context: Record<string, unknown>,
  ): Record<string, unknown> {
    const incomingEdges = edges.filter((e) => e.target === node.id);
    const resolved: Record<string, unknown> = {};

    incomingEdges.forEach((edge) => {
      resolved[edge.sourceHandle || edge.source] = context[edge.source];
    });

    return resolved;
  }
}
