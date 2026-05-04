'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Filter, ChevronDown } from 'lucide-react';
import { api, flowsApi } from '@/lib/api';

interface Execution {
  id: string;
  flowId: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  logs?: unknown[];
}

interface Flow { id: string; name: string; }

const STATUS_FILTERS = ['all', 'success', 'failed', 'running', 'queued'];

const statusStyle: Record<string, string> = {
  success: 'bg-green-900/40 text-green-400 border-green-800',
  failed:  'bg-red-900/40 text-red-400 border-red-800',
  running: 'bg-blue-900/40 text-blue-400 border-blue-800',
  queued:  'bg-yellow-900/40 text-yellow-400 border-yellow-800',
};

function duration(start: string | null, end: string | null): string {
  if (!start) return '—';
  const ms = new Date(end || Date.now()).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

export default function ExecutionsPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/executions').then((r) => r.data).catch(() => []),
      flowsApi.list().catch(() => []),
    ]).then(([e, f]) => {
      setExecutions(e);
      setFlows(f);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = statusFilter === 'all'
    ? executions
    : executions.filter((e) => e.status === statusFilter);

  const getFlowName = (flowId: string) =>
    flows.find((f) => f.id === flowId)?.name || flowId.slice(0, 8) + '…';

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Executions</h1>
          <p className="text-sm text-text-dim mt-0.5">{executions.length} total runs</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-text-dim hover:text-text transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 bg-surface border border-border rounded-lg p-1 w-fit">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
              statusFilter === s
                ? 'bg-accent text-white'
                : 'text-text-dim hover:text-text'
            }`}
          >
            {s}
            {s !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                {executions.filter((e) => e.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-xs font-semibold uppercase tracking-wider text-text-dim">
          <div className="col-span-1">Status</div>
          <div className="col-span-3">Flow</div>
          <div className="col-span-3">Started</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2">ID</div>
          <div className="col-span-1"></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-text-dim text-sm">
            <span className="text-2xl mb-2">🕐</span>
            No executions found
          </div>
        ) : (
          filtered.map((exec) => (
            <div key={exec.id}>
              {/* Row */}
              <div
                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-border hover:bg-border/50 transition-colors cursor-pointer items-center"
                onClick={() => setExpandedId(expandedId === exec.id ? null : exec.id)}
              >
                {/* Status */}
                <div className="col-span-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyle[exec.status] || 'bg-border text-text-dim border-border'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${exec.status === 'running' ? 'animate-pulse' : ''}`}
                      style={{ background: 'currentColor' }}
                    />
                    {exec.status}
                  </span>
                </div>

                {/* Flow name */}
                <div className="col-span-3">
                  <p className="text-sm font-medium text-text truncate">{getFlowName(exec.flowId)}</p>
                </div>

                {/* Started */}
                <div className="col-span-3 text-sm text-text-dim">
                  {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : '—'}
                </div>

                {/* Duration */}
                <div className="col-span-2 text-sm font-mono text-text-dim">
                  {duration(exec.startedAt, exec.finishedAt)}
                </div>

                {/* ID */}
                <div className="col-span-2 text-xs font-mono text-muted truncate">
                  {exec.id.slice(0, 12)}…
                </div>

                {/* Expand */}
                <div className="col-span-1 flex justify-end">
                  <ChevronDown
                    size={14}
                    className={`text-text-dim transition-transform ${expandedId === exec.id ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {/* Expanded logs */}
              {expandedId === exec.id && (
                <div className="bg-bg border-b border-border px-5 py-4">
                  <p className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-3">
                    Execution Logs
                  </p>
                  {!exec.logs || (exec.logs as unknown[]).length === 0 ? (
                    <p className="text-xs text-muted font-mono">No logs recorded.</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {(exec.logs as Array<{ timestamp: string; nodeId: string; message: string; level: string }>).map((log, i) => (
                        <div key={i} className="flex gap-3 text-xs font-mono">
                          <span className="text-muted flex-shrink-0">
                            {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '—'}
                          </span>
                          <span className={`log-${log.level || 'info'}`}>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
