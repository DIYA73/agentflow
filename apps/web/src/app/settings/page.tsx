'use client';
import { useState } from 'react';
import { Save, User, Building2, Key, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [workspaceName, setWorkspaceName] = useState(user?.workspaceName || '');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/workspace', { name: workspaceName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <Icon size={16} className="text-accent" />
        <h2 className="text-sm font-semibold text-text">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );

  const Field = ({ label, value, onChange, type = 'text', readOnly = false }: {
    label: string; value: string; onChange?: (v: string) => void;
    type?: string; readOnly?: boolean;
  }) => (
    <div>
      <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className={`w-full max-w-md bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors ${
          readOnly ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      />
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Settings</h1>
          <p className="text-sm text-text-dim mt-0.5">Manage your workspace and account</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dim rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
        >
          <Save size={14} />
          {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <Field label="Name" value={user?.name || ''} readOnly />
        <Field label="Email" value={user?.email || ''} readOnly />
        <div>
          <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">Role</label>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/20 capitalize">
            {user?.role}
          </span>
        </div>
      </Section>

      {/* Workspace */}
      <Section icon={Building2} title="Workspace">
        <div>
          <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">Workspace Name</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="w-full max-w-md bg-bg border border-border rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <Field label="Workspace ID" value={user?.workspaceId || ''} readOnly />
      </Section>

      {/* API */}
      <Section icon={Key} title="API Access">
        <div>
          <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">API Base URL</label>
          <div className="flex items-center gap-2 max-w-md">
            <code className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-text-dim">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
            </code>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5">Bearer Token</label>
          <div className="flex items-center gap-2 max-w-md">
            <input
              type={apiKeyVisible ? 'text' : 'password'}
              readOnly
              value={typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : ''}
              className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-xs font-mono text-text-dim cursor-default"
            />
            <button
              onClick={() => setApiKeyVisible(!apiKeyVisible)}
              className="px-3 py-2.5 border border-border rounded-lg text-xs text-text-dim hover:text-text transition-colors"
            >
              {apiKeyVisible ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={() => {
                const t = localStorage.getItem('accessToken');
                if (t) navigator.clipboard.writeText(t);
              }}
              className="px-3 py-2.5 border border-border rounded-lg text-xs text-text-dim hover:text-text transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-muted mt-1.5">Use in Authorization: Bearer {"<token>"} header</p>
        </div>
      </Section>

      {/* Danger */}
      <Section icon={Shield} title="Danger Zone">
        <div className="flex items-center justify-between p-4 border border-red-900 rounded-lg bg-red-900/10">
          <div>
            <p className="text-sm font-semibold text-red-400">Delete Workspace</p>
            <p className="text-xs text-text-dim mt-0.5">Permanently delete all flows, executions, and data.</p>
          </div>
          <button
            onClick={() => alert('Contact support to delete your workspace.')}
            className="px-4 py-2 border border-red-800 rounded-lg text-sm text-red-400 hover:bg-red-900/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </Section>
    </div>
  );
}
