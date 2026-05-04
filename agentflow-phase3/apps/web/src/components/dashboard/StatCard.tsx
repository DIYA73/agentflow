'use client';
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  color: string;
  trend?: { value: number; label: string };
}

export function StatCard({ label, value, sub, icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-text-dim">{label}</span>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
          style={{ background: color + '22' }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div className="text-3xl font-bold text-text tabular-nums">{value}</div>
        {sub && <div className="text-xs text-text-dim mt-0.5">{sub}</div>}
      </div>

      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span className="text-text-dim font-normal">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
