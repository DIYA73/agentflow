'use client';
import { NODE_REGISTRY } from '@agentflow/shared';
import { useCanvasStore } from '@/store/canvas.store';
import { useCallback } from 'react';

let nodeIdCounter = 1;

export function NodePalette() {
  const addNode = useCanvasStore((s) => s.addNode);

  const handleDragStart = useCallback((e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('nodeType', type);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleClick = useCallback((type: string) => {
    const id = `node_${nodeIdCounter++}`;
    addNode({
      id,
      type: 'agentNode',
      position: { x: 200 + Math.random() * 200, y: 150 + Math.random() * 200 },
      data: { type, label: NODE_REGISTRY.find((n) => n.type === type)?.label || type, config: {} },
    });
  }, [addNode]);

  return (
    <aside className="w-56 h-full bg-surface border-r border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-dim">Node Types</p>
        <p className="text-xs text-muted mt-0.5">Drag or click to add</p>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {NODE_REGISTRY.map((meta) => (
          <div
            key={meta.type}
            draggable
            onDragStart={(e) => handleDragStart(e, meta.type)}
            onClick={() => handleClick(meta.type)}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 hover:bg-border"
          >
            {/* Color indicator */}
            <div
              className="w-1.5 h-8 rounded-full flex-shrink-0"
              style={{ background: meta.borderColor }}
            />

            <span className="text-base leading-none flex-shrink-0">{meta.icon}</span>

            <div className="min-w-0">
              <div className="text-sm font-medium text-text truncate">{meta.label}</div>
              <div className="text-xs text-text-dim truncate">{meta.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-muted text-center">
          Connect nodes by dragging handles
        </p>
      </div>
    </aside>
  );
}
