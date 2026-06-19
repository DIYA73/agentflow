import { edgeMatchesBranch } from '@agentflow/shared';
import { conditionBranch, getRunnableOrder } from './graph-executor';
import type { FlowEdge, FlowNode } from '@agentflow/shared';

describe('getRunnableOrder', () => {
  const node = (id: string, type = 'ai-llm'): FlowNode => ({
    id,
    type,
    position: { x: 0, y: 0 },
    data: { label: id, config: {} },
  });

  const edge = (source: string, target: string, sourceHandle?: string): FlowEdge => ({
    id: `${source}-${target}`,
    source,
    target,
    sourceHandle,
  });

  it('skips false branch after condition', () => {
    const nodes = [node('start'), node('cond', 'condition'), node('yes'), node('no')];
    const edges = [
      edge('start', 'cond'),
      edge('cond', 'yes', 'true'),
      edge('cond', 'no', 'false'),
    ];
    const branches = new Map([['cond', 'true' as const]]);
    const order = getRunnableOrder(nodes, edges, branches).map((n) => n.id);
    expect(order).toEqual(['start', 'cond', 'yes']);
    expect(order).not.toContain('no');
  });

  it('edgeMatchesBranch routes handles', () => {
    expect(edgeMatchesBranch(edge('a', 'b', 'false'), 'false')).toBe(true);
  });
});

describe('conditionBranch', () => {
  const node = (id: string, type = 'ai-llm'): FlowNode => ({
    id,
    type,
    position: { x: 0, y: 0 },
    data: { label: id, config: {} },
  });

  it('returns null for non-condition nodes', () => {
    expect(conditionBranch(node('a'), { branch: 'true' })).toBeNull();
  });

  it('reads the branch from a condition output', () => {
    expect(conditionBranch(node('c', 'condition'), { branch: 'true' })).toBe('true');
    expect(conditionBranch(node('c', 'condition'), { branch: 'false' })).toBe('false');
  });

  it('defaults to the false branch when output is missing or malformed', () => {
    expect(conditionBranch(node('c', 'condition'), undefined)).toBeNull();
    expect(conditionBranch(node('c', 'condition'), {})).toBe('false');
  });

  it('honours node.data.type over node.type', () => {
    const n: FlowNode = { ...node('c'), data: { label: 'c', config: {}, type: 'condition' } };
    expect(conditionBranch(n, { branch: 'true' })).toBe('true');
  });
});
