'use client';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { getNodeMeta } from '@agentflow/shared';
import { useCanvasStore } from '@/store/canvas.store';
import { NodeExecutionStatus } from '@/lib/nodeExecutionStyles';

const statusRing: Record<NodeExecutionStatus, string> = {
  idle:    '',
  running: 'ring-2 ring-yellow-400 animate-pulse shadow-yellow-400/40 shadow-lg',
  success: 'ring-2 ring-green-500 shadow-green-500/40 shadow-lg',
  error:   'ring-2 ring-red-500 shadow-red-500/40 shadow-lg',
};

const statusDot: Record<NodeExecutionStatus, string> = {
  idle:    '',
  running: 'bg-yellow-400 animate-ping',
  success: 'bg-green-500',
  error:   'bg-red-500',
};

export function AgentNode({ id, data, selected }: NodeProps) {
  const meta = getNodeMeta(data.type as string);
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode);
  const nodes = useCanvasStore((s) => s.nodes);

  const status = (data.executionStatus as NodeExecutionStatus) || 'idle';

  const handleClick = () => {
    const node = nodes.find((n) => n.id === id);
    if (node) setSelectedNode(node);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        borderColor: selected ? '#818cf8' : meta.borderColor,
        background: meta.color,
        boxShadow: selected
          ? `0 0 0 2px #818cf8, 0 8px 32px rgba(0,0,0,0.5)`
          : `0 4px 20px rgba(0,0,0,0.4)`,
      }}
      className={`relative min-w-[180px] rounded-xl border-2 cursor-pointer transition-all duration-150 hover:brightness-110 ${statusRing[status]}`}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ borderColor: meta.borderColor }}
      />

      {/* Node body */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg leading-none">{meta.icon}</span>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: meta.borderColor }}
          >
            {meta.label}
          </span>
        </div>

        <div className="text-sm font-medium text-text leading-snug">
          {(data.label as string) || meta.label}
        </div>

        {/* Config preview */}
        {data.config && Object.keys(data.config as object).length > 0 && (
          <div className="mt-2 text-xs text-text-dim truncate max-w-[160px] font-mono">
            {getConfigPreview(data.config as Record<string, string>)}
          </div>
        )}
      </div>

      {/* Status dot — animated when running */}
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full relative">
        <div
          className={`w-2 h-2 rounded-full ${status === 'idle' ? 'opacity-70' : ''} ${statusDot[status]}`}
          style={status === 'idle' ? { background: meta.borderColor } : {}}
        />
      </div>

      {/* Output handle */}
      {data.type === 'condition' ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ borderColor: meta.borderColor }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ borderColor: '#f97316', left: '60%' }}
          />
          <div className="absolute -bottom-5 right-6 text-xs text-text-dim">false</div>
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-xs text-text-dim">true</div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          style={{ borderColor: meta.borderColor }}
        />
      )}
    </div>
  );
}

function getConfigPreview(config: Record<string, string>): string {
  const first = Object.entries(config).find(([, v]) => v);
  if (!first) return '';
  const val = String(first[1]).slice(0, 40);
  return val.length < String(first[1]).length ? val + '…' : val;
}
