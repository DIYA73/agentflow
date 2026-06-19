import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { edgeMatchesBranch, type FlowEdge } from './index';

describe('edgeMatchesBranch', () => {
  const edge = (sourceHandle?: string): FlowEdge => ({
    id: 'e1',
    source: 'a',
    target: 'b',
    sourceHandle,
  });

  it('defaults missing handle to true branch', () => {
    assert.equal(edgeMatchesBranch(edge(), 'true'), true);
    assert.equal(edgeMatchesBranch(edge(), 'false'), false);
  });

  it('routes explicit handles', () => {
    assert.equal(edgeMatchesBranch(edge('true'), 'true'), true);
    assert.equal(edgeMatchesBranch(edge('false'), 'false'), true);
    assert.equal(edgeMatchesBranch(edge('false'), 'true'), false);
  });
});
