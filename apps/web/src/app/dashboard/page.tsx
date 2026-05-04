'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, ArrowRight, Zap, Play, Clock, CheckCircle } from 'lucide-react';
import { flowsApi, api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { SparkBar } from '@/components/dashboard/SparkBar';

interface Flow { id: string; name: string; status: string; lastRunStatus: string | null; updatedAt: string; }
interface Execution { id: string; flowId: string; status: string; startedAt: string | null; finishedAt: string | null; createdAt: string; }

// Generate last 7 days labels
const last7Days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return d.toLocaleDateString('en', { weekday: 'short' });
});

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      flowsApi.list().catch(() => []),
      api.get('/executions').then((r) => r.data).catch(() => []),
    ]).then(([f, e]) => {
      setFlows(f);
      setExecutions(e);
    }).finally(() => setLoading(false));
  }, []);

  // Derived stats
  const totalFlows = flows.length;
  const activeFlows = flows.filter((f) => f.status === 'active').length;
  const totalExecs = executions.length;
  const successExecs = executions.filter((e) => e.status === 'success').length;
  const failedExecs = executions.filter((e) => e.status === 'failed').length;
  const successRate = totalExecs > 0 ? Math.round((successExecs / totalExecs) * 100) : 0;

  // Executions per day (last 7)
  const execPerDay = last7Days.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    return executions.filter((e) => e.createdAt && new Date(e.createdAt).toDateString() === dayStr).length;
  });

  // Recent executions with flow name
  const recentExecs = executions.slice(0, 8).map((e) => ({
    ...e,
    flowName: flows.find((f) => f.id === e.flowId)?.name || 'Unknown Flow',
  }));

  // Top 3 recent flows
  const recentFlows = [...flows].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-text-dim mt-0.5">{user?.workspaceName} workspace</p>
        </div>
        <Link
          href="/flows/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dim rounded-lg text-sm font-semibold text-white transition-colors"
        >
          <Plus size={15} /> New Flow
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Flows"
          value={totalFlows}
          sub={`${activeFlows} active`}
          icon="⚡"
          color="#6366f1"
          trend={{ value: 12, label: 'this week' }}
        />
        <StatCard
          label="Executions"
          value={totalExecs}
          sub="all time"
          icon="🚀"
          color="#10b981"
          trend={{ value: totalExecs > 0 ? 8 : 0, label: 'vs last week' }}
        />
        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
          sub={`${successExecs} succeeded`}
          icon="✅"
          color="#10b981"
        />
        <StatCard
          label="Failed"
          value={failedExecs}
          sub="total failures"
          icon="❌"
          color="#ef4444"
        />
      </div>

      {/* Charts + Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Executions chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-text">Executions — Last 7 Days</h2>
              <p className="text-xs text-text-dim mt-0.5">{totalExecs} total runs</p>
            </div>
            <span className="text-xs text-accent font-semibold">{execPerDay.reduce((a, b) => a + b, 0)} this week</span>
          </div>

          {/* Bar chart */}
          <div className="flex items-end justify-between gap-2 h-28">
            {execPerDay.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end" style={{ height: 80 }}>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max((count / Math.max(...execPerDay, 1)) * 100, count > 0 ? 5 : 0)}%`,
                      background: count > 0 ? '#6366f1' : '#1e1e2e',
                    }}
                  />
                </div>
                <span className="text-xs text-text-dim">{last7Days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats sidebar */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-text">At a Glance</h2>

          {[
            { label: 'Active Flows', value: activeFlows, icon: <Zap size={14} className="text-accent" /> },
            { label: 'Running Now', value: executions.filter((e) => e.status === 'running').length, icon: <Play size={14} className="text-blue-400" /> },
            { label: 'Queued', value: executions.filter((e) => e.status === 'queued').length, icon: <Clock size={14} className="text-yellow-400" /> },
            { label: 'Succeeded Today', value: executions.filter((e) => e.status === 'success' && e.createdAt && new Date(e.createdAt).toDateString() === new Date().toDateString()).length, icon: <CheckCircle size={14} className="text-green-400" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-text-dim">
                {icon} {label}
              </div>
              <span className="text-sm font-bold text-text tabular-nums">{value}</span>
            </div>
          ))}

          {/* Success rate bar */}
          <div className="border-t border-border pt-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-text-dim">Success Rate</span>
              <span className="text-text font-semibold">{successRate}%</span>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${successRate}%`, background: successRate >= 80 ? '#10b981' : successRate >= 50 ? '#f59e0b' : '#ef4444' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent flows + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Flows */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text">Recent Flows</h2>
            <Link href="/flows" className="flex items-center gap-1 text-xs text-accent hover:underline">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {recentFlows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-text-dim text-sm">
              <span className="text-2xl mb-2">⚡</span>
              No flows yet
            </div>
          ) : (
            <div className="space-y-2">
              {recentFlows.map((flow) => (
                <Link
                  key={flow.id}
                  href={`/flows/${flow.id}`}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-border transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                    <Zap size={14} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{flow.name}</p>
                    <p className="text-xs text-text-dim">
                      Updated {new Date(flow.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    flow.status === 'active' ? 'bg-green-900/40 text-green-400' : 'bg-border text-text-dim'
                  }`}>
                    {flow.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text">Recent Executions</h2>
            <Link href="/executions" className="flex items-center gap-1 text-xs text-accent hover:underline">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <ActivityFeed items={recentExecs} />
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
