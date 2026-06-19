'use client';
import { Save, Play, ArrowLeft, Loader2, CheckCircle, Zap, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FlowVersionEntry } from '@agentflow/shared';

interface CanvasToolbarProps {
  flowName: string;
  version: number;
  versionHistory: FlowVersionEntry[];
  isSaving: boolean;
  isDirty: boolean;
  isRunning: boolean;
  isRollingBack: boolean;
  showTriggers: boolean;
  onSave: () => void;
  onRun: () => void;
  onRollback: (version: number) => void;
  onToggleTriggers: () => void;
}

export function CanvasToolbar({
  flowName,
  version,
  versionHistory,
  isSaving,
  isDirty,
  isRunning,
  isRollingBack,
  showTriggers,
  onSave,
  onRun,
  onRollback,
  onToggleTriggers,
}: CanvasToolbarProps) {
  const router = useRouter();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/flows')}
          className="flex items-center gap-1.5 text-text-dim hover:text-text transition-colors text-sm"
        >
          <ArrowLeft size={15} />
          <span>Flows</span>
        </button>

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text">{flowName}</span>
          <span className="text-xs text-text-dim bg-border px-2 py-0.5 rounded-full">v{version}</span>
          {isDirty && (
            <span className="text-xs text-text-dim bg-border px-2 py-0.5 rounded-full">unsaved</span>
          )}
          {!isDirty && !isSaving && (
            <CheckCircle size={14} className="text-green-400" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        {versionHistory.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowHistory(!showHistory)}
              disabled={isRollingBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-text-dim hover:text-text hover:border-accent transition-all disabled:opacity-40"
            >
              {isRollingBack ? <Loader2 size={14} className="animate-spin" /> : <History size={14} />}
              History
            </button>
            {showHistory && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-surface border border-border rounded-lg shadow-xl z-20 py-1">
                {[...versionHistory].reverse().map((entry) => (
                  <button
                    key={entry.version}
                    onClick={() => {
                      onRollback(entry.version);
                      setShowHistory(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-bg transition-colors"
                  >
                    <span className="text-text">v{entry.version}</span>
                    <span className="text-xs text-text-dim ml-2">
                      {new Date(entry.savedAt).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onToggleTriggers}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
            showTriggers
              ? 'bg-accent/15 border-accent text-accent'
              : 'border-border text-text-dim hover:text-text hover:border-accent'
          }`}
        >
          <Zap size={14} />
          Triggers
        </button>

        <button
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium border border-border text-text-dim hover:text-text hover:border-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </button>

        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold bg-accent hover:bg-accent-dim text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Run Flow
        </button>
      </div>
    </header>
  );
}
