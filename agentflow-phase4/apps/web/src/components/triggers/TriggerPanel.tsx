'use client';
import { useState, useEffect } from 'react';
import { Clock, Webhook, Plus, X } from 'lucide-react';
import { triggersApi, Trigger } from '@/lib/triggers-api';
import { TriggerCard } from './TriggerCard';
import { CronTriggerModal } from './CronTriggerModal';
import { WebhookTriggerModal } from './WebhookTriggerModal';

interface TriggerPanelProps {
  flowId: string;
  flowName: string;
  onClose: () => void;
}

export function TriggerPanel({ flowId, flowName, onClose }: TriggerPanelProps) {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCron, setShowCron] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  const load = () => {
    setLoading(true);
    triggersApi.list()
      .then((all) => setTriggers(all.filter((t: Trigger) => t.flowId === flowId)))
      .catch(() => setTriggers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [flowId]);

  return (
    <>
      <div className="absolute right-64 top-14 bottom-0 w-80 bg-surface border-l border-border flex flex-col z-20 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-text">Triggers</p>
            <p className="text-xs text-text-dim truncate max-w-[180px]">{flowName}</p>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Add trigger buttons */}
        <div className="px-4 py-3 border-b border-border flex gap-2">
          <button
            onClick={() => setShowCron(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-indigo-800 bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/40 transition-colors text-xs font-semibold"
          >
            <Clock size={13} /> Cron Schedule
          </button>
          <button
            onClick={() => setShowWebhook(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-teal-800 bg-teal-900/20 text-teal-400 hover:bg-teal-900/40 transition-colors text-xs font-semibold"
          >
            <Webhook size={13} /> Webhook
          </button>
        </div>

        {/* Triggers list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : triggers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="text-3xl mb-3">⏰</div>
              <p className="text-sm font-medium text-text-dim">No triggers yet</p>
              <p className="text-xs text-muted mt-1">Add a cron schedule or webhook above</p>
            </div>
          ) : (
            triggers.map((t) => (
              <TriggerCard
                key={t.id}
                trigger={t}
                flowName={flowName}
                onDeleted={load}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted text-center">
            {triggers.length} trigger{triggers.length !== 1 ? 's' : ''} configured
          </p>
        </div>
      </div>

      {showCron && (
        <CronTriggerModal
          flowId={flowId}
          flowName={flowName}
          onClose={() => setShowCron(false)}
          onCreated={load}
        />
      )}

      {showWebhook && (
        <WebhookTriggerModal
          flowId={flowId}
          flowName={flowName}
          onClose={() => setShowWebhook(false)}
          onCreated={load}
        />
      )}
    </>
  );
}
