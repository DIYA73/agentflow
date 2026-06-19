import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useReactFlow } from '@xyflow/react';
import type { ExecutionStatus } from '@agentflow/shared';

let socket: Socket | null = null;

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export function useExecutionSocket(
  executionId: string | null,
  onComplete?: () => void,
) {
  const { setNodes } = useReactFlow();

  const updateNodeStatus = useCallback(
    (nodeId: string, status: NodeExecutionStatus) => {
      setNodes((nodes) =>
        nodes.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, executionStatus: status } }
            : n,
        ),
      );
    },
    [setNodes],
  );

  useEffect(() => {
    if (!executionId) return;

    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    socket = io(`${baseUrl}/gateway`, {
      transports: ['websocket'],
      auth: { token },
    });

    socket.on('connect', () => {
      socket?.emit('join:execution', { executionId });
    });

    socket.on('execution:node:status', (payload: {
      nodeId: string;
      status: NodeExecutionStatus;
    }) => {
      updateNodeStatus(payload.nodeId, payload.status);
    });

    socket.on('execution:status', (payload: { status: ExecutionStatus }) => {
      if (payload.status === 'success' || payload.status === 'failed') {
        onComplete?.();
        socket?.disconnect();
        socket = null;
      }
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [executionId, updateNodeStatus, onComplete]);
}
