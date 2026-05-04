'use client';
import { useCanvasStore } from '@/store/canvas.store';
import { getNodeMeta } from '@/lib/node-registry';
import { X } from 'lucide-react';

export function NodeConfigPanel() {
  const selectedNode = useCanvasStore((s) => s.selectedNode);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode);

  if (!selectedNode) {
    return (
      <aside className="w-64 h-full bg-surface border-l border-border flex flex-col items-center justify-center">
        <div className="text-center px-6">
          <div className="text-3xl mb-3">👆</div>
          <p className="text-sm text-text-dim">Click a node to configure it</p>
        </div>
      </aside>
    );
  }

  const meta = getNodeMeta(selectedNode.data.type as string);
  const config = (selectedNode.data.config as Record<string, string>) || {};

  const handleChange = (key: string, value: string) => {
    updateNodeData(selectedNode.id, {
      config: { ...config, [key]: value },
    });
  };

  const handleLabelChange = (value: string) => {
    updateNodeData(selectedNode.id, { label: value });
  };

  return (
    <aside className="w-64 h-full bg-surface border-l border-border flex flex-col overflow-hidden animate-slide-in">
      {/* Header */}
      <div
        className="px-4 py-4 border-b border-border flex items-center justify-between"
        style={{ borderLeftColor: meta.borderColor, borderLeftWidth: 3 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.icon}</span>
          <div>
            <p className="text-sm font-semibold text-text">{meta.label}</p>
            <p className="text-xs text-text-dim">{meta.description}</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="text-text-dim hover:text-text transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Node label */}
        <div>
          <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">
            Node Label
          </label>
          <input
            type="text"
            value={(selectedNode.data.label as string) || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
            placeholder="Node name..."
          />
        </div>

        <div className="border-t border-border" />

        {/* Config fields */}
        {meta.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>

            {field.type === 'select' ? (
              <select
                value={config[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'textarea' || field.type === 'code' ? (
              <textarea
                value={config[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={field.type === 'code' ? 6 : 4}
                className={`w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none ${
                  field.type === 'code' ? 'font-mono text-xs' : ''
                }`}
              />
            ) : (
              <input
                type="text"
                value={config[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            )}
          </div>
        ))}

        {/* Node ID (read-only) */}
        <div className="border-t border-border pt-4">
          <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">
            Node ID
          </label>
          <p className="text-xs font-mono text-muted">{selectedNode.id}</p>
        </div>
      </div>
    </aside>
  );
}
