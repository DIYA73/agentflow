'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ReactFlow, Background, Controls, MiniMap,
  BackgroundVariant, ReactFlowProvider, useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '@/store/canvas.store';
import { flowsApi } from '@/lib/api';
import { AgentNode } from '@/components/nodes/AgentNode';
import { NodePalette } from '@/components/canvas/NodePalette';
import { NodeConfigPanel } from '@/components/canvas/NodeConfigPanel';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { ExecutionLogsPanel } from '@/components/canvas/ExecutionLogsPanel';
import { TriggerPanel } from '@/components/triggers/TriggerPanel';
import { NODE_REGISTRY, type FlowVersionEntry } from '@agentflow/shared';
import { useExecutionSocket } from '@/lib/hooks/useExecutionSocket';

const nodeTypes = { agentNode: AgentNode };
let dropNodeCounter = 100;

function FlowEditor({ flowId }: { flowId: string }) {
  const { screenToFlowPosition } = useReactFlow();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, loadGraph, isDirty, markClean } = useCanvasStore();

  const [flowName, setFlowName] = useState('Untitled Flow');
  const [version, setVersion] = useState(1);
  const [versionHistory, setVersionHistory] = useState<FlowVersionEntry[]>([]);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showTriggers, setShowTriggers] = useState(false);

  // 🔴 live node status updates via WebSocket
  useExecutionSocket(executionId, () => {
    setIsRunning(false);
  });

  useEffect(() => {
    if (flowId === 'new') return;
    flowsApi.get(flowId).then((flow) => {
      setFlowName(flow.name);
      setVersion(flow.version ?? 1);
      setVersionHistory(flow.versionHistory || []);
      loadGraph(flow.graph?.nodes || [], flow.graph?.edges || []);
    }).catch(console.error);
  }, [flowId, loadGraph]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType');
    if (!type) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const meta = NODE_REGISTRY.find((n) => n.type === type);
    addNode({
      id: `node_${dropNodeCounter++}`,
      type: 'agentNode',
      position,
      data: { type, label: meta?.label || type, config: {} },
    });
  }, [screenToFlowPosition, addNode]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const graph = { nodes, edges };
      if (flowId === 'new') {
        const created = await flowsApi.create({ name: flowName });
        await flowsApi.update(created.id, { graph });
        window.history.replaceState(null, '', `/flows/${created.id}`);
      } else {
        const updated = await flowsApi.update(flowId, { graph });
        setVersion(updated.version ?? version + 1);
        setVersionHistory(updated.versionHistory || []);
      }
      markClean();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollback = async (targetVersion: number) => {
    if (flowId === 'new') return;
    setIsRollingBack(true);
    try {
      const updated = await flowsApi.rollback(flowId, targetVersion);
      setVersion(updated.version);
      setVersionHistory(updated.versionHistory || []);
      loadGraph(updated.graph?.nodes || [], updated.graph?.edges || []);
      markClean();
    } catch (err) {
      console.error('Rollback failed:', err);
    } finally {
      setIsRollingBack(false);
    }
  };

  const handleRun = async () => {
    if (flowId === 'new') { alert('Save the flow first!'); return; }
    setIsRunning(true);
    setShowLogs(true);
    setShowTriggers(false);
    try {
      const execution = await flowsApi.execute(flowId);
      setExecutionId(execution.id);
    } catch (err) {
      console.error('Run failed:', err);
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg">
      <CanvasToolbar
        flowName={flowName}
        version={version}
        versionHistory={versionHistory}
        isSaving={isSaving}
        isDirty={isDirty}
        isRunning={isRunning}
        isRollingBack={isRollingBack}
        showTriggers={showTriggers}
        onSave={handleSave}
        onRun={handleRun}
        onRollback={handleRollback}
        onToggleTriggers={() => { setShowTriggers(!showTriggers); setShowLogs(false); }}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <NodePalette />

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
            defaultEdgeOptions={{ animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e1e2e" />
            <Controls />
            <MiniMap
              nodeColor={(node) => NODE_REGISTRY.find((n) => n.type === node.data?.type)?.borderColor || '#6366f1'}
              maskColor="rgba(10,10,15,0.8)"
            />
          </ReactFlow>

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-center space-y-3 opacity-40">
                <div className="text-5xl">🤖</div>
                <p className="text-lg font-semibold text-text">Start building your agent flow</p>
                <p className="text-sm text-text-dim">Drag nodes from the left panel or click to add them</p>
              </div>
            </div>
          )}
        </div>

        <NodeConfigPanel />

        {showTriggers && flowId !== 'new' && (
          <TriggerPanel
            flowId={flowId}
            flowName={flowName}
            onClose={() => setShowTriggers(false)}
          />
        )}

        {showLogs && (
          <ExecutionLogsPanel
            executionId={executionId}
            onClose={() => setShowLogs(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function FlowEditorPage() {
  const params = useParams();
  return (
    <ReactFlowProvider>
      <FlowEditor flowId={params.id as string} />
    </ReactFlowProvider>
  );
}
