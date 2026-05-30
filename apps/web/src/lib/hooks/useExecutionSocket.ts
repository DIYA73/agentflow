import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useReactFlow } from '@xyflow/react';

let socket: Socket | null = null;

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export function useExecutionSocket(
  executionId: string | null,
  onConnected?: () => void,
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

    socket = io(process.env.NEXT_PUBLIC_API_URL + '/gateway', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket?.emit('join:execution', { executionId });
      onConnected?.();
    });

    socket.on('execution:node:status', (payload: {
      nodeId: string;
      status: NodeExecutionStatus;
    }) => {
      updateNodeStatus(payload.nodeId, payload.status);
    });

    socket.on('execution:status', (payload: { status: string }) => {
      if (payload.status === 'SUCCESS' || payload.status === 'FAILED') {
        socket?.disconnect();
        socket = null;
      }
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [executionId, updateNodeStatus, onConnected]);
}
