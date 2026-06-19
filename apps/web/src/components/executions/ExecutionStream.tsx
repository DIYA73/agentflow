'use client';

import { useExecutionStream } from '@/hooks/useExecutionStream';
import { useAuthStore } from '@/store/auth.store';

interface Props {
  executionId: string;
}

const levelColor: Record<string, string> = {
  info: 'text-green-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
};

const statusColor: Record<string, string> = {
  QUEUED: 'text-gray-400',
  RUNNING: 'text-blue-400',
  SUCCESS: 'text-green-400',
  FAILED: 'text-red-400',
  CANCELLED: 'text-yellow-400',
};

export function ExecutionStream({ executionId }: Props) {
  const token = useAuthStore((s) => s.accessToken);
  const { logs, status, done, connected } = useExecutionStream({
    executionId,
    token,
  });

  return (
    <div className="flex flex-col h-full bg-gray-950 rounded-lg border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <span className="text-xs font-mono text-gray-400">
          execution/{executionId.slice(0, 8)}
        </span>
        <div className="flex items-center gap-2">
          {connected && (
            <span className="flex items-center gap-1 text-xs text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              streaming
            </span>
          )}
          {status && (
            <span className={`text-xs font-medium ${statusColor[status] ?? 'text-gray-400'}`}>
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Log output */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
        {logs.length === 0 && !done && (
          <span className="text-gray-600">Waiting for output...</span>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-gray-600 shrink-0">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className="text-gray-500 shrink-0 w-24 truncate">
              {log.nodeId}
            </span>
            <span className={levelColor[log.level] ?? 'text-gray-300'}>
              {log.message}
            </span>
          </div>
        ))}
        {done && (
          <div className="pt-2 border-t border-gray-800 text-gray-600">
            — execution complete —
          </div>
        )}
      </div>
    </div>
  );
}
