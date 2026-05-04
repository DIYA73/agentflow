'use client';
import { useState } from 'react';
import { X, Clock, Loader2 } from 'lucide-react';
import { triggersApi, CRON_PRESETS, parseCron } from '@/lib/triggers-api';

interface CronTriggerModalProps {
  flowId: string;
  flowName: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CronTriggerModal({ flowId, flowName, onClose, onCreated }: CronTriggerModalProps) {
  const [selected, setSelected] = useState(CRON_PRESETS[6].value); // default: every day at 9am
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const expression = selected === 'custom' ? custom : selected;
  const preview = expression ? parseCron(expression) : '—';

  const handleCreate = async () => {
    if (!expression) { setError('Please select or enter a cron expression'); return; }
    setLoading(true);
    setError('');
    try {
      await triggersApi.createCron({ flowId, cronExpression: expression });
      onCreated();
      onClose();
    } catch {
      setError('Failed to create trigger. Make sure the flow exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/50 flex items-center justify-center">
              <Clock size={15} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Cron Trigger</p>
              <p className="text-xs text-text-dim truncate max-w-[200px]">{flowName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Preset picker */}
          <div>
            <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-2">
              Schedule
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {CRON_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSelected(p.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                    selected === p.value
                      ? 'bg-accent text-white'
                      : 'bg-bg border border-border text-text-dim hover:text-text hover:border-accent'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom expression input */}
          {selected === 'custom' && (
            <div>
              <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">
                Cron Expression
              </label>
              <input
                type="text"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="0 9 * * 1-5"
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
              <p className="text-xs text-muted mt-1">Format: minute hour day month weekday</p>
            </div>
          )}

          {/* Preview */}
          <div className="bg-bg border border-border rounded-lg px-4 py-3 flex items-center gap-3">
            <Clock size={14} className="text-accent flex-shrink-0" />
            <div>
              <p className="text-xs text-text-dim">Runs</p>
              <p className="text-sm font-semibold text-text">{preview}</p>
            </div>
            {expression && expression !== 'custom' && (
              <code className="ml-auto text-xs font-mono text-text-dim bg-border px-2 py-0.5 rounded">
                {expression}
              </code>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-dim hover:text-text transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !expression}
            className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-accent-dim rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            Create Trigger
          </button>
        </div>
      </div>
    </div>
  );
}
