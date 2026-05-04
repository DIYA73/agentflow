'use client';
import { Save, Play, ArrowLeft, Loader2, CheckCircle, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CanvasToolbarProps {
  flowName: string;
  isSaving: boolean;
  isDirty: boolean;
  isRunning: boolean;
  showTriggers: boolean;
  onSave: () => void;
  onRun: () => void;
  onToggleTriggers: () => void;
}

export function CanvasToolbar({
  flowName, isSaving, isDirty, isRunning,
  showTriggers, onSave, onRun, onToggleTriggers,
}: CanvasToolbarProps) {
  const router = useRouter();

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 flex-shrink-0 z-10">
      {/* Left */}
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
          {isDirty && (
            <span className="text-xs text-text-dim bg-border px-2 py-0.5 rounded-full">unsaved</span>
          )}
          {!isDirty && !isSaving && (
            <CheckCircle size={14} className="text-green-400" />
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Triggers toggle */}
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
