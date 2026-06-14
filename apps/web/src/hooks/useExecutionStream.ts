import { useEffect, useRef, useState } from 'react';

export type LogLevel = 'info' | 'warn' | 'error';

export interface ExecutionLog {
  executionId: string;
  nodeId: string;
  message: string;
  level: LogLevel;
  timestamp: string;
}

export interface ExecutionStatus {
  executionId: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
}

interface UseExecutionStreamOptions {
  executionId: string | null;
  apiBase?: string;
  token: string | null;
}

interface UseExecutionStreamResult {
  logs: ExecutionLog[];
  status: ExecutionStatus['status'] | null;
  done: boolean;
  connected: boolean;
}

export function useExecutionStream({
  executionId,
  apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  token,
}: UseExecutionStreamOptions): UseExecutionStreamResult {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [status, setStatus] = useState<ExecutionStatus['status'] | null>(null);
  const [done, setDone] = useState(false);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!executionId || !token) return;

    setLogs([]);
    setStatus(null);
    setDone(false);
    setConnected(false);

    // EventSource doesn't support headers — pass token as query param
    const url = `${apiBase}/executions/${executionId}/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('open', () => setConnected(true));

    es.addEventListener('log', (e: MessageEvent<string>) => {
      const log = JSON.parse(e.data) as ExecutionLog;
      setLogs((prev) => [...prev, log]);
    });

    es.addEventListener('status', (e: MessageEvent<string>) => {
      const payload = JSON.parse(e.data) as ExecutionStatus;
      setStatus(payload.status);
    });

    es.addEventListener('done', () => {
      setDone(true);
      setConnected(false);
      es.close();
    });

    es.addEventListener('error', () => {
      setConnected(false);
      es.close();
    });

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [executionId, token, apiBase]);

  return { logs, status, done, connected };
}
