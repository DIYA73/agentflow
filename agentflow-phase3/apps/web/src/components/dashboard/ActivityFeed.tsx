'use client';

interface ActivityItem {
  id: string;
  flowName: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
}

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  success: { color: 'text-green-400',  dot: 'bg-green-400',  label: 'Success' },
  failed:  { color: 'text-red-400',    dot: 'bg-red-400',    label: 'Failed'  },
  running: { color: 'text-blue-400',   dot: 'bg-blue-400',   label: 'Running' },
  queued:  { color: 'text-yellow-400', dot: 'bg-yellow-400', label: 'Queued'  },
};

function duration(start: string | null, end: string | null): string {
  if (!start) return '—';
  const ms = new Date(end || Date.now()).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m`;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-text-dim text-sm">
        <span className="text-2xl mb-2">🕐</span>
        No executions yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const s = statusConfig[item.status] || statusConfig.queued;
        return (
          <div
            key={item.id}
            className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-border transition-colors"
          >
            {/* Status dot */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot} ${item.status === 'running' ? 'animate-pulse' : ''}`} />

            {/* Flow name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{item.flowName}</p>
              <p className="text-xs text-text-dim">
                {item.startedAt ? new Date(item.startedAt).toLocaleString() : 'Pending'}
              </p>
            </div>

            {/* Duration */}
            <span className="text-xs text-text-dim font-mono flex-shrink-0">
              {duration(item.startedAt, item.finishedAt)}
            </span>

            {/* Status badge */}
            <span className={`text-xs font-semibold flex-shrink-0 ${s.color}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
