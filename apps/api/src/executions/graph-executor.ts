import { edgeMatchesBranch, type FlowEdge, type FlowNode } from '@agentflow/shared';

export function resolveNodeInput(
  node: FlowNode,
  edges: FlowEdge[],
  context: Record<string, unknown>,
): Record<string, unknown> {
  const incomingEdges = edges.filter((e) => e.target === node.id);
  const resolved: Record<string, unknown> = {};
  for (const edge of incomingEdges) {
    resolved[edge.sourceHandle || edge.source] = context[edge.source];
  }

  // Convenience alias. Most flows are linear, so expose the upstream output
  // under a stable `input` key — this is what `{{input}}` / `{{input.field}}`
  // in node configs resolves against, so authors don't need to reference
  // upstream node ids. Entry nodes (no incoming edges) receive the flow input;
  // fan-in nodes receive the list of upstream outputs.
  if (incomingEdges.length === 1) {
    resolved.input = context[incomingEdges[0].source];
  } else if (incomingEdges.length === 0) {
    resolved.input = context.input;
  } else {
    resolved.input = incomingEdges.map((e) => context[e.source]);
  }

  return resolved;
}

/**
 * Derives which branch a condition node took from its output, or null for
 * non-condition nodes. Used both during live execution and when rebuilding
 * branch state on a resumed (retried) run, so skipped edges stay skipped.
 */
export function conditionBranch(
  node: FlowNode,
  output: unknown,
): 'true' | 'false' | null {
  const nodeType = ((node.data as Record<string, unknown>)?.type as string) || node.type;
  if (nodeType !== 'condition' || !output || typeof output !== 'object') return null;
  return (output as { branch?: string }).branch === 'true' ? 'true' : 'false';
}

/**
 * Returns nodes in execution order, respecting condition branch edges.
 */
export function getRunnableOrder(
  nodes: FlowNode[],
  edges: FlowEdge[],
  branchByNodeId: Map<string, 'true' | 'false'>,
): FlowNode[] {
  const skippedEdges = new Set<string>();
  const completed = new Set<string>();
  const order: FlowNode[] = [];

  const incoming = (nodeId: string) =>
    edges.filter((e) => e.target === nodeId && !skippedEdges.has(e.id));

  const isReady = (nodeId: string): boolean => {
    const allIncoming = edges.filter((e) => e.target === nodeId);
    const inc = incoming(nodeId);
    if (allIncoming.length > 0 && inc.length === 0) return false;
    if (inc.length === 0) return true;
    return inc.every((e) => completed.has(e.source));
  };

  const pending = new Set(nodes.map((n) => n.id));

  while (pending.size > 0) {
    const ready = nodes.filter((n) => pending.has(n.id) && isReady(n.id));
    if (ready.length === 0) break;

    for (const node of ready) {
      pending.delete(node.id);
      order.push(node);
      completed.add(node.id);

      const branch = branchByNodeId.get(node.id);
      if (branch) {
        for (const edge of edges.filter((e) => e.source === node.id)) {
          if (!edgeMatchesBranch(edge, branch)) {
            skippedEdges.add(edge.id);
          }
        }
      }
    }
  }

  return order;
}
