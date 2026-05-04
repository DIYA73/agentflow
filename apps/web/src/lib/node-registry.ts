export interface NodeMeta {
  type: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  borderColor: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'code';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
}

export const NODE_REGISTRY: NodeMeta[] = [
  {
    type: 'ai-llm',
    label: 'AI / LLM',
    description: 'Send a prompt to GPT-4o',
    icon: '🤖',
    color: '#4c1d95',
    borderColor: '#7c3aed',
    fields: [
      { key: 'prompt', label: 'Prompt', type: 'textarea', required: true, placeholder: 'Enter your prompt. Use {{key}} for dynamic values.' },
      { key: 'systemPrompt', label: 'System Prompt', type: 'textarea', required: false, placeholder: 'Optional system instructions...' },
      { key: 'model', label: 'Model', type: 'select', required: false, options: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
    ],
  },
  {
    type: 'web-scraper',
    label: 'Web Scraper',
    description: 'Fetch & extract text from any URL',
    icon: '🌐',
    color: '#0c4a6e',
    borderColor: '#0ea5e9',
    fields: [
      { key: 'url', label: 'URL', type: 'text', required: true, placeholder: 'https://example.com or {{upstream.url}}' },
    ],
  },
  {
    type: 'api-caller',
    label: 'API Caller',
    description: 'Make HTTP requests to any endpoint',
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
    description: 'Execute sandboxed JavaScript',
    icon: '⚡',
    color: '#451a03',
    borderColor: '#f59e0b',
    fields: [
      { key: 'code', label: 'JavaScript Code', type: 'code', required: true, placeholder: '// input is available as `input`\nreturn input.text.toUpperCase();' },
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
      { key: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'Hello from agentflow!' },
      { key: 'body', label: 'Body (HTML)', type: 'textarea', required: true, placeholder: '<p>Your message here</p>' },
    ],
  },
  {
    type: 'data-transform',
    label: 'Data Transform',
    description: 'Pick, omit, or merge JSON fields',
    icon: '🔀',
    color: '#1e1b4b',
    borderColor: '#6366f1',
    fields: [
      { key: 'operation', label: 'Operation', type: 'select', required: true, options: ['pick', 'omit', 'merge'] },
      { key: 'field', label: 'Field Name', type: 'text', required: false, placeholder: 'e.g. text, data.result' },
    ],
  },
  {
    type: 'webhook-output',
    label: 'Webhook Output',
    description: 'POST results to an external URL',
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
    description: 'Branch flow based on a condition',
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
  NODE_REGISTRY.find((n) => n.type === type) || NODE_REGISTRY[0];
