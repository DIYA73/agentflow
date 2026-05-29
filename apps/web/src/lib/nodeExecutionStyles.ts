export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export const nodeStatusStyles: Record<NodeExecutionStatus, string> = {
  idle:    '',
  running: 'ring-2 ring-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50',
  success: 'ring-2 ring-green-500 shadow-lg shadow-green-500/50',
  error:   'ring-2 ring-red-500 shadow-lg shadow-red-500/50',
};
