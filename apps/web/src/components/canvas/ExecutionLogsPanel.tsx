'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Terminal } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Log {
  nodeId: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  timestamp: string;
}

interface ExecutionLogsPanelProps {
  executionId: string | null;
  onClose: () => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export function ExecutionLogsPanel({ executionId, onClose }: ExecutionLogsPanelProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [status, setStatus] = useState<string>('queued');
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!executionId) return;

    setLogs([]);
    setStatus('queued');

    const socket = io(`${WS_URL}/gateway`);
    socketRef.current = socket;

    socket.emit('join:execution', { executionId });

    socket.on('execution:log', (data: Log) => {
      setLogs((prev) => [...prev, data]);
    });

    socket.on('execution:status', (data: { status: string }) => {
      setStatus(data.status);
    });

    return () => { socket.disconnect(); };
  }, [executionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const statusColor = {
    queued: 'text-yellow-400',
    running: 'text-blue-400',
    success: 'text-green-400',
    failed: 'text-red-400',
  }[status] || 'text-text-dim';

  return (
    <div className="absolute bottom-0 left-56 right-64 h-64 bg-bg border-t border-border flex flex-col animate-fade-in z-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-accent" />
          <span className="text-xs font-semibold text-text">Execution Logs</span>
          <span className={`text-xs font-mono ${statusColor}`}>
            ● {status}
          </span>
          {executionId && (
            <span className="text-xs text-muted font-mono">{executionId.slice(0, 8)}…</span>
          )}
        </div>
        <button onClick={onClose} className="text-text-dim hover:text-text transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Log output */}
      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs space-y-1">
        {logs.length === 0 && (
          <p className="text-muted">Waiting for logs…</p>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-muted flex-shrink-0">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className="text-text-dim flex-shrink-0">[{log.nodeId.slice(0, 8)}]</span>
            <span className={`log-${log.level}`}>{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
