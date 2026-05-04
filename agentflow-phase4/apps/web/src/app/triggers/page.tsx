'use client';
import { useEffect, useState } from 'react';
import { Clock, Webhook, Plus, RefreshCw } from 'lucide-react';
import { triggersApi, Trigger } from '@/lib/triggers-api';
import { flowsApi } from '@/lib/api';
import { TriggerCard } from '@/components/triggers/TriggerCard';
import { CronTriggerModal } from '@/components/triggers/CronTriggerModal';
import { WebhookTriggerModal } from '@/components/triggers/WebhookTriggerModal';

interface Flow { id: string; name: string; }
type ModalState = null | { type: 'cron' | 'webhook'; flowId: string; flowName: string };

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [selectedFlowId, setSelectedFlowId] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cron' | 'webhook'>('all');

  const load = () => {
    setLoading(true);
    Promise.all([
      triggersApi.list().catch(() => []),
      flowsApi.list().catch(() => []),
    ]).then(([t, f]) => {
      setTriggers(t);
      setFlows(f);
      if (f.length > 0 && !selectedFlowId) setSelectedFlowId(f[0].id);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = triggers.filter((t) => typeFilter === 'all' || t.type === typeFilter);
  const getFlowName = (id: string) => flows.find((f) => f.id === id)?.name || 'Unknown Flow';

  const openModal = (type: 'cron' | 'webhook') => {
    const flow = flows.find((f) => f.id === selectedFlowId);
    if (!flow) return;
    setModal({ type, flowId: flow.id, flowName: flow.name });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Triggers</h1>
          <p className="text-sm text-text-dim mt-0.5">{triggers.length} trigger{triggers.length !== 1 ? 's' : ''} configured</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-text-dim hover:text-text transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Add trigger row */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <p className="text-sm font-semibold text-text mb-4">Add New Trigger</p>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Flow selector */}
          <select
            value={selectedFlowId}
            onChange={(e) => setSelectedFlowId(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
          >
            {flows.length === 0 && <option value="">No flows yet</option>}
            {flows.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          <button
            onClick={() => openModal('cron')}
            disabled={!selectedFlowId}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-800 bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/40 transition-colors text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Clock size={14} /> + Cron Schedule
          </button>

          <button
            onClick={() => openModal('webhook')}
            disabled={!selectedFlowId}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-teal-800 bg-teal-900/20 text-teal-400 hover:bg-teal-900/40 transition-colors text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Webhook size={14} /> + Webhook
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-surface border border-border rounded-lg p-1 w-fit">
        {(['all', 'cron', 'webhook'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
              typeFilter === t ? 'bg-accent text-white' : 'text-text-dim hover:text-text'
            }`}
          >
            {t === 'all' ? 'All' : t === 'cron' ? '⏰ Cron' : '🪝 Webhook'}
            <span className="ml-1.5 text-xs opacity-70">
              {t === 'all' ? triggers.length : triggers.filter((x) => x.type === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Triggers grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-2xl">
          <div className="text-4xl mb-3">⏰</div>
          <p className="text-text-dim text-sm mb-1">No triggers yet</p>
          <p className="text-muted text-xs">Add a cron schedule or webhook above to automate your flows</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <TriggerCard
              key={t.id}
              trigger={t}
              flowName={getFlowName(t.flowId)}
              onDeleted={load}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'cron' && (
        <CronTriggerModal
          flowId={modal.flowId}
          flowName={modal.flowName}
          onClose={() => setModal(null)}
          onCreated={load}
        />
      )}
      {modal?.type === 'webhook' && (
        <WebhookTriggerModal
          flowId={modal.flowId}
          flowName={modal.flowName}
          onClose={() => setModal(null)}
          onCreated={load}
        />
      )}
    </div>
  );
}
