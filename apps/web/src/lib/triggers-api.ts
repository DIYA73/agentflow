import { api } from './api';

export interface Trigger {
  id: string;
  flowId: string;
  type: 'cron' | 'webhook';
  config: {
    cronExpression?: string;
    webhookPath?: string;
    secret?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export const triggersApi = {
  list: (workspaceId?: string) =>
    api.get('/triggers').then((r) => r.data),

  createCron: (data: { flowId: string; cronExpression: string }) =>
    api.post('/triggers/cron', data).then((r) => r.data),

  createWebhook: (data: { flowId: string; webhookSecret?: string }) =>
    api.post('/triggers/webhook', data).then((r) => r.data),

  toggle: (id: string, isActive: boolean) =>
    api.patch(`/triggers/${id}`, { isActive }).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/triggers/${id}`).then((r) => r.data),
};

// Human-readable cron expression parser
export function parseCron(expr: string): string {
  const presets: Record<string, string> = {
    '* * * * *':     'Every minute',
    '0 * * * *':     'Every hour',
    '0 9 * * *':     'Every day at 9:00 AM',
    '0 9 * * 1':     'Every Monday at 9:00 AM',
    '0 9 * * 1-5':   'Weekdays at 9:00 AM',
    '0 0 * * *':     'Every day at midnight',
    '0 0 * * 0':     'Every Sunday at midnight',
    '0 0 1 * *':     'First day of every month',
    '*/5 * * * *':   'Every 5 minutes',
    '*/15 * * * *':  'Every 15 minutes',
    '*/30 * * * *':  'Every 30 minutes',
    '0 */6 * * *':   'Every 6 hours',
    '0 */12 * * *':  'Every 12 hours',
  };
  return presets[expr] || expr;
}

export const CRON_PRESETS = [
  { label: 'Every minute',           value: '* * * * *' },
  { label: 'Every 5 minutes',        value: '*/5 * * * *' },
  { label: 'Every 15 minutes',       value: '*/15 * * * *' },
  { label: 'Every 30 minutes',       value: '*/30 * * * *' },
  { label: 'Every hour',             value: '0 * * * *' },
  { label: 'Every 6 hours',          value: '0 */6 * * *' },
  { label: 'Every day at 9am',       value: '0 9 * * *' },
  { label: 'Every day at midnight',  value: '0 0 * * *' },
  { label: 'Weekdays at 9am',        value: '0 9 * * 1-5' },
  { label: 'Every Monday at 9am',    value: '0 9 * * 1' },
  { label: 'First of every month',   value: '0 0 1 * *' },
  { label: 'Custom...',              value: 'custom' },
];
