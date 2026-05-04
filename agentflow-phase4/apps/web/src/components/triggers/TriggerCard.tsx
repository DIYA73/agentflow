'use client';
import { useState } from 'react';
import { Clock, Webhook, Trash2, Copy, Check } from 'lucide-react';
import { triggersApi, parseCron, Trigger } from '@/lib/triggers-api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TriggerCardProps {
  trigger: Trigger;
  flowName?: string;
  onDeleted: () => void;
}

export function TriggerCard({ trigger, flowName, onDeleted }: TriggerCardProps) {
  const [active, setActive] = useState(trigger.isActive);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isCron = trigger.type === 'cron';
  const webhookUrl = trigger.config?.webhookPath
    ? `${API_URL}${trigger.config.webhookPath}`
    : null;

  const handleToggle = async () => {
    setToggling(true);
    try {
      await triggersApi.toggle(trigger.id, !active);
      setActive(!active);
    } catch { /* silent */ } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this trigger?')) return;
    setDeleting(true);
    try {
      await triggersApi.remove(trigger.id);
      onDeleted();
    } catch { /* silent */ } finally {
      setDeleting(false);
    }
  };

  const handleCopy = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-surface border rounded-xl p-5 transition-all ${
      active ? 'border-border' : 'border-border opacity-60'
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Icon + info */}
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isCron ? 'bg-indigo-900/40' : 'bg-teal-900/40'
          }`}>
            {isCron
              ? <Clock size={16} className="text-indigo-400" />
              : <Webhook size={16} className="text-teal-400" />
            }
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isCron
                  ? 'bg-indigo-900/40 text-indigo-400'
                  : 'bg-teal-900/40 text-teal-400'
              }`}>
                {isCron ? 'Cron' : 'Webhook'}
              </span>
              {flowName && (
                <span className="text-xs text-text-dim truncate">→ {flowName}</span>
              )}
            </div>

            {/* Cron expression */}
            {isCron && trigger.config?.cronExpression && (
              <div className="mt-2">
                <p className="text-sm font-semibold text-text">
                  {parseCron(trigger.config.cronExpression)}
                </p>
                <code className="text-xs font-mono text-text-dim">
                  {trigger.config.cronExpression}
                </code>
              </div>
            )}

            {/* Webhook URL */}
            {!isCron && webhookUrl && (
              <div className="mt-2 flex items-center gap-2">
                <code className="text-xs font-mono text-teal-400 truncate max-w-[220px]">
                  {webhookUrl}
                </code>
                <button onClick={handleCopy} className="flex-shrink-0 text-text-dim hover:text-text transition-colors">
                  {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                </button>
              </div>
            )}

            <p className="text-xs text-muted mt-1">
              Created {new Date(trigger.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Toggle */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative w-10 h-5 rounded-full transition-all ${
              active ? 'bg-accent' : 'bg-border'
            } ${toggling ? 'opacity-50' : ''}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
              active ? 'left-5' : 'left-0.5'
            }`} />
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-text-dim hover:text-red-400 hover:bg-red-900/10 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
