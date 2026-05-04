'use client';

interface SparkBarProps {
  data: number[];
  color?: string;
  height?: number;
}

export function SparkBar({ data, color = '#6366f1', height = 40 }: SparkBarProps) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all"
          style={{
            height: `${(v / max) * 100}%`,
            background: color,
            opacity: 0.4 + (i / data.length) * 0.6,
            minHeight: v > 0 ? 2 : 0,
          }}
        />
      ))}
    </div>
  );
}
