'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Play, Pencil, Trash2, Zap, Clock, Sparkles } from 'lucide-react';
import { flowsApi } from '@/lib/api';

interface Flow {
  id: string;
  name: string;
  description: string;
  status: string;
  version: number;
  lastRunAt: string | null;
  lastRunStatus: string | null;
  updatedAt: string;
}

export default function FlowsPage() {
  const router = useRouter();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    flowsApi.list()
      .then(setFlows)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const flow = await flowsApi.create({ name: newName.trim() });
    router.push(`/flows/${flow.id}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this flow?')) return;
    await flowsApi.remove(id);
    setFlows((prev) => prev.filter((f) => f.id !== id));
  };

  const statusColor: Record<string, string> = {
    draft: 'bg-muted text-text-dim',
    active: 'bg-green-900 text-green-400',
    paused: 'bg-yellow-900 text-yellow-400',
    archived: 'bg-border text-muted',
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Top bar */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-sm">⚡</div>
          <span className="font-semibold text-lg">agentflow</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/templates')}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:border-accent rounded-lg text-sm font-semibold text-text-dim hover:text-text transition-colors"
          >
            <Sparkles size={15} />
            Templates
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dim rounded-lg text-sm font-semibold text-white transition-colors"
          >
            <Plus size={15} />
            New Flow
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text">My Flows</h1>
          <p className="text-sm text-text-dim mt-1">{flows.length} agent pipeline{flows.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : flows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-2xl">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-text-dim mb-4">No flows yet — build your first agent pipeline</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dim rounded-lg text-sm font-semibold text-white"
            >
              <Plus size={15} /> Create Flow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flows.map((flow) => (
              <div
                key={flow.id}
                onClick={() => router.push(`/flows/${flow.id}`)}
                className="bg-surface border border-border rounded-xl p-5 cursor-pointer hover:border-accent transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Zap size={16} className="text-accent" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[flow.status] || statusColor.draft}`}>
                    {flow.status}
                  </span>
                </div>

                <h3 className="font-semibold text-text mb-1 truncate">{flow.name}</h3>
                {flow.description && (
                  <p className="text-xs text-text-dim truncate mb-3">{flow.description}</p>
                )}

                <div className="flex items-center gap-1 text-xs text-muted mt-3">
                  <Clock size={11} />
                  <span>
                    {flow.lastRunAt
                      ? `Last run ${new Date(flow.lastRunAt).toLocaleDateString()}`
                      : 'Never run'}
                  </span>
                  <span className="ml-auto">v{flow.version}</span>
                </div>

                {/* Hover actions */}
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/flows/${flow.id}`); }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-text-dim hover:text-text hover:border-accent transition-colors"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); flowsApi.execute(flow.id); }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
                  >
                    <Play size={11} /> Run
                  </button>
                  <button
                    onClick={(e) => handleDelete(flow.id, e)}
                    className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create flow modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h2 className="text-lg font-semibold text-text mb-4">New Flow</h2>
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Flow name..."
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:border-accent mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-text-dim hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-4 py-2 bg-accent hover:bg-accent-dim rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              >
                Create & Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
