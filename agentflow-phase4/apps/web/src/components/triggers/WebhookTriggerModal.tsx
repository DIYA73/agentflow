'use client';
import { useState } from 'react';
import { X, Webhook, Copy, Check, Loader2, Eye, EyeOff } from 'lucide-react';
import { triggersApi } from '@/lib/triggers-api';

interface WebhookTriggerModalProps {
  flowId: string;
  flowName: string;
  onClose: () => void;
  onCreated: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function WebhookTriggerModal({ flowId, flowName, onClose, onCreated }: WebhookTriggerModalProps) {
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ webhookPath: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const webhookUrl = created ? `${API_URL}${created.webhookPath}` : null;

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const trigger = await triggersApi.createWebhook({
        flowId,
        webhookSecret: secret || undefined,
      });
      setCreated({ webhookPath: trigger.config?.webhookPath || '/webhooks/...' });
      onCreated();
    } catch {
      setError('Failed to create webhook trigger.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-900/50 flex items-center justify-center">
              <Webhook size={15} className="text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Webhook Trigger</p>
              <p className="text-xs text-text-dim truncate max-w-[200px]">{flowName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {!created ? (
            <>
              <p className="text-sm text-text-dim">
                A unique URL will be generated. Any <code className="text-accent text-xs">POST</code> request to that URL will trigger your flow with the request body as input.
              </p>

              {/* Optional secret */}
              <div>
                <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">
                  Secret Key <span className="text-muted font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Optional webhook secret..."
                    className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text"
                  >
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-xs text-muted mt-1">
                  Sent as <code className="text-xs">X-Webhook-Secret</code> header for verification
                </p>
              </div>

              {/* Example */}
              <div className="bg-bg border border-border rounded-lg p-4">
                <p className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2">Example Request</p>
                <pre className="text-xs font-mono text-text-dim leading-relaxed overflow-x-auto">{`curl -X POST \\
  https://your-url/webhooks/... \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello agentflow!"}'`}</pre>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm text-text-dim hover:text-text transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                >
                  {loading && <Loader2 size={13} className="animate-spin" />}
                  Generate Webhook
                </button>
              </div>
            </>
          ) : (
            /* Success state — show the webhook URL */
            <>
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-12 h-12 rounded-full bg-teal-900/40 flex items-center justify-center mb-3">
                  <Webhook size={22} className="text-teal-400" />
                </div>
                <p className="text-sm font-semibold text-text">Webhook Created!</p>
                <p className="text-xs text-text-dim mt-1">Copy your unique URL below</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">
                  Webhook URL
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-bg border border-border rounded-lg px-3 py-2.5 text-xs font-mono text-teal-400 truncate">
                    {webhookUrl}
                  </code>
                  <button
                    onClick={handleCopy}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      copied
                        ? 'bg-green-900/40 text-green-400 border border-green-800'
                        : 'bg-bg border border-border text-text-dim hover:text-text'
                    }`}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {secret && (
                <div>
                  <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">
                    Secret Key
                  </label>
                  <code className="block bg-bg border border-border rounded-lg px-3 py-2.5 text-xs font-mono text-yellow-400">
                    {secret}
                  </code>
                  <p className="text-xs text-muted mt-1">Save this — it won't be shown again</p>
                </div>
              )}

              <div className="bg-bg border border-border rounded-lg p-4">
                <p className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2">Test it</p>
                <pre className="text-xs font-mono text-text-dim leading-relaxed overflow-x-auto">{`curl -X POST \\
  ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"hello": "agentflow"}'`}</pre>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-semibold text-white transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
