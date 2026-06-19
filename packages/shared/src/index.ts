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
  type: NodeType | string;
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, unknown>;
    type?: string;
    executionStatus?: string;
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

export interface FlowVersionEntry {
  version: number;
  graph: FlowGraph;
  savedAt: string;
}

export interface Flow {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: FlowStatus;
  graph: FlowGraph;
  version: number;
  versionHistory: FlowVersionEntry[] | null;
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

// ─── Node Registry (canvas + API) ─────────────────────────

export type NodeFieldType = 'text' | 'textarea' | 'select' | 'code';

export interface NodeField {
  key: string;
  label: string;
  type: NodeFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface NodeMeta {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  borderColor: string;
  fields: NodeField[];
}

export const NODE_REGISTRY: NodeMeta[] = [
  {
    type: 'ai-llm',
    label: 'AI / LLM',
    description: 'Send a prompt to GPT-4o and pass the response downstream',
    icon: '🤖',
    color: '#4c1d95',
    borderColor: '#7c3aed',
    fields: [
      { key: 'prompt', label: 'Prompt', type: 'textarea', required: true, placeholder: 'Use {{key}} for dynamic values' },
      { key: 'systemPrompt', label: 'System Prompt', type: 'textarea', required: false, placeholder: 'Optional system instructions' },
      { key: 'model', label: 'Model', type: 'select', required: false, options: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
    ],
  },
  {
    type: 'web-scraper',
    label: 'Web Scraper',
    description: 'Fetch and extract text from any URL',
    icon: '🌐',
    color: '#0c4a6e',
    borderColor: '#0ea5e9',
    fields: [
      { key: 'url', label: 'URL', type: 'text', required: true, placeholder: 'https://example.com or {{url}}' },
    ],
  },
  {
    type: 'api-caller',
    label: 'API Caller',
    description: 'Make HTTP requests to any REST endpoint',
    icon: '🔌',
    color: '#064e3b',
    borderColor: '#10b981',
    fields: [
      { key: 'url', label: 'Endpoint URL', type: 'text', required: true, placeholder: 'https://api.example.com/data' },
      { key: 'method', label: 'Method', type: 'select', required: false, options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      { key: 'body', label: 'Request Body (JSON)', type: 'textarea', required: false, placeholder: '{"key": "value"}' },
    ],
  },
  {
    type: 'code-runner',
    label: 'Code Runner',
    description: 'Run JavaScript in a restricted VM sandbox',
    icon: '⚡',
    color: '#451a03',
    borderColor: '#f59e0b',
    fields: [
      { key: 'code', label: 'JavaScript Code', type: 'code', required: true, placeholder: 'return input;' },
    ],
  },
  {
    type: 'email-sender',
    label: 'Email Sender',
    description: 'Send emails via Resend',
    icon: '📧',
    color: '#500724',
    borderColor: '#ec4899',
    fields: [
      { key: 'to', label: 'To', type: 'text', required: true, placeholder: 'recipient@example.com' },
      { key: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'Hello from agentflow' },
      { key: 'body', label: 'Body (HTML)', type: 'textarea', required: true, placeholder: '<p>Message</p>' },
    ],
  },
  {
    type: 'data-transform',
    label: 'Data Transform',
    description: 'Pick, omit, or merge fields from upstream data',
    icon: '🔀',
    color: '#1e1b4b',
    borderColor: '#6366f1',
    fields: [
      { key: 'operation', label: 'Operation', type: 'select', required: true, options: ['pick', 'omit', 'merge'] },
      { key: 'field', label: 'Field Name', type: 'text', required: false, placeholder: 'e.g. text' },
    ],
  },
  {
    type: 'webhook-output',
    label: 'Webhook Output',
    description: 'POST the flow result to an external URL',
    icon: '🪝',
    color: '#042f2e',
    borderColor: '#14b8a6',
    fields: [
      { key: 'url', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://hooks.example.com/...' },
      { key: 'secret', label: 'Secret Header', type: 'text', required: false, placeholder: 'Optional X-Webhook-Secret' },
    ],
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch the flow based on a data condition',
    icon: '🔱',
    color: '#431407',
    borderColor: '#f97316',
    fields: [
      { key: 'field', label: 'Field Path', type: 'text', required: true, placeholder: 'e.g. data.status' },
      { key: 'operator', label: 'Operator', type: 'select', required: true, options: ['eq', 'neq', 'gt', 'lt', 'contains'] },
      { key: 'value', label: 'Value', type: 'text', required: true, placeholder: 'Compare value' },
    ],
  },
];

export const getNodeMeta = (type: string): NodeMeta =>
  NODE_REGISTRY.find((n) => n.type === type) ?? NODE_REGISTRY[0];

/** True branch uses handle id "true" (default); false uses "false". */
export function edgeMatchesBranch(edge: FlowEdge, branch: 'true' | 'false'): boolean {
  const handle = edge.sourceHandle ?? 'true';
  return branch === 'true' ? handle === 'true' : handle === 'false';
}

// ─── WebSocket Events ─────────────────────────────────────

export type WsEvent =
  | { type: 'execution:log'; payload: ExecutionLog & { executionId: string } }
  | { type: 'execution:status'; payload: { executionId: string; status: ExecutionStatus } }
  | { type: 'execution:node:status'; payload: { executionId: string; nodeId: string; status: 'running' | 'success' | 'error' } };
