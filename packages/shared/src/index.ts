// ─── Flow Types ───────────────────────────────────────────

export type FlowStatus = 'draft' | 'active' | 'paused' | 'archived';

export type NodeType =
  | 'ai-llm'
  | 'web-scraper'
  | 'api-caller'
  | 'code-runner'
  | 'email-sender'
  | 'data-transform'
  | 'webhook-output'
  | 'condition';

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, unknown>;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface Flow {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: FlowStatus;
  graph: FlowGraph;
  version: number;
  lastRunAt: string | null;
  lastRunStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Execution Types ──────────────────────────────────────

export type ExecutionStatus = 'queued' | 'running' | 'success' | 'failed';

export interface ExecutionLog {
  nodeId: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  timestamp: string;
}

export interface Execution {
  id: string;
  flowId: string;
  workspaceId: string;
  status: ExecutionStatus;
  input: Record<string, unknown>;
  output: unknown;
  logs: ExecutionLog[];
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

// ─── Node Metadata (for canvas palette) ───────────────────

export interface NodeMeta {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  configSchema: Record<string, { type: string; required: boolean; description: string }>;
}

export const NODE_REGISTRY: NodeMeta[] = [
  {
    type: 'ai-llm',
    label: 'AI / LLM',
    description: 'Send a prompt to GPT-4o and pass the response downstream',
    icon: '🤖',
    color: '#7C3AED',
    configSchema: {
      prompt: { type: 'string', required: true, description: 'Prompt text. Use {{key}} for dynamic values' },
      systemPrompt: { type: 'string', required: false, description: 'Optional system instructions' },
      model: { type: 'string', required: false, description: 'Model name (default: gpt-4o)' },
    },
  },
  {
    type: 'web-scraper',
    label: 'Web Scraper',
    description: 'Fetch and extract text from any URL',
    icon: '🌐',
    color: '#0EA5E9',
    configSchema: {
      url: { type: 'string', required: true, description: 'URL to scrape. Supports {{key}} interpolation' },
    },
  },
  {
    type: 'api-caller',
    label: 'API Caller',
    description: 'Make HTTP requests to any REST endpoint',
    icon: '🔌',
    color: '#10B981',
    configSchema: {
      url: { type: 'string', required: true, description: 'Endpoint URL' },
      method: { type: 'string', required: false, description: 'HTTP method (default: GET)' },
      headers: { type: 'object', required: false, description: 'Request headers (JSON)' },
      body: { type: 'string', required: false, description: 'Request body' },
    },
  },
  {
    type: 'code-runner',
    label: 'Code Runner',
    description: 'Execute sandboxed JavaScript with access to upstream data',
    icon: '⚡',
    color: '#F59E0B',
    configSchema: {
      code: { type: 'code', required: true, description: 'JS code. Receives `input` object, must return a value' },
    },
  },
  {
    type: 'email-sender',
    label: 'Email Sender',
    description: 'Send emails via Resend',
    icon: '📧',
    color: '#EC4899',
    configSchema: {
      to: { type: 'string', required: true, description: 'Recipient email' },
      subject: { type: 'string', required: true, description: 'Email subject' },
      body: { type: 'string', required: true, description: 'HTML body content' },
    },
  },
  {
    type: 'data-transform',
    label: 'Data Transform',
    description: 'Pick, omit, or merge fields from upstream data',
    icon: '🔀',
    color: '#6366F1',
    configSchema: {
      operation: { type: 'select', required: true, description: 'pick | omit | merge' },
      field: { type: 'string', required: false, description: 'Field name to pick/omit' },
      value: { type: 'string', required: false, description: 'Value to merge' },
    },
  },
  {
    type: 'webhook-output',
    label: 'Webhook Output',
    description: 'POST the flow result to an external URL',
    icon: '🪝',
    color: '#14B8A6',
    configSchema: {
      url: { type: 'string', required: true, description: 'Target webhook URL' },
      secret: { type: 'string', required: false, description: 'Optional X-Webhook-Secret header' },
    },
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch the flow based on a data condition',
    icon: '🔱',
    color: '#F97316',
    configSchema: {
      field: { type: 'string', required: true, description: 'Field path (e.g. data.status)' },
      operator: { type: 'select', required: true, description: 'eq | neq | gt | lt | contains' },
      value: { type: 'string', required: true, description: 'Value to compare against' },
    },
  },
];

// ─── WebSocket Events ─────────────────────────────────────

export type WsEvent =
  | { type: 'execution:log'; payload: ExecutionLog & { executionId: string } }
  | { type: 'execution:status'; payload: { executionId: string; status: ExecutionStatus } };
