'use client';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { getNodeMeta } from '@/lib/node-registry';
import { useCanvasStore } from '@/store/canvas.store';

export function AgentNode({ id, data, selected }: NodeProps) {
  const meta = getNodeMeta(data.type as string);
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode);
  const nodes = useCanvasStore((s) => s.nodes);

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
      className="relative min-w-[180px] rounded-xl border-2 cursor-pointer transition-all duration-150 hover:brightness-110"
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

      {/* Status dot */}
      <div
        className="absolute top-2 right-2 w-2 h-2 rounded-full"
        style={{ background: meta.borderColor, opacity: 0.7 }}
      />

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ borderColor: meta.borderColor }}
      />

      {/* Condition node has two output handles */}
      {data.type === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ borderColor: '#f97316', left: '60%' }}
          />
          <div className="absolute -bottom-5 right-6 text-xs text-text-dim">false</div>
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-xs text-text-dim">true</div>
        </>
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
