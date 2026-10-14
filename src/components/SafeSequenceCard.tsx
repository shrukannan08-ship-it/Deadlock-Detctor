import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import type { ProcessState } from '../types/deadlock';

interface SafeSequenceCardProps {
  isSafe: boolean | null;
  safeSequence: string[];
  processStates: Record<string, ProcessState>;
  explanation?: string;
  onSelectProcess?: (processName: string) => void;
}

export const SafeSequenceCard: React.FC<SafeSequenceCardProps> = ({
  isSafe,
  safeSequence,
  processStates,
  explanation,
  onSelectProcess,
}) => {
  if (isSafe === null) {
    return (
      <div className="glass-panel-secondary rounded-2xl p-5 text-center py-6 border border-cyan-500/20 shadow-sm">
        <div className="text-slate-400 text-xs font-mono">
          Click "Check Safe State" to evaluate system state with Banker’s Safety Algorithm.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-5 border transition-all shadow-lg holo-shimmer ${
        isSafe
          ? 'glass-panel-primary glow-edge-emerald'
          : 'glass-panel-primary glow-edge-rose'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyan-500/15 mb-3.5 gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg border ${
              isSafe
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                : 'bg-rose-950/70 border-rose-500/40 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
            }`}
          >
            {isSafe ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <div
              className={`font-bold text-sm tracking-wide font-sans ${
                isSafe ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {isSafe ? 'SYSTEM IS IN A SAFE STATE' : 'SYSTEM IS IN AN UNSAFE STATE'}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {isSafe ? 'High Assurance • No Deadlock Risk' : 'Resource Allocation Hazard Detected'}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Waiting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span>Finished</span>
          </div>
        </div>
      </div>

      {/* Safe Sequence Chain Visualization */}
      {isSafe && safeSequence.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-mono font-semibold text-emerald-300/90 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            VERIFIED SAFE EXECUTION ORDER:
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
            {safeSequence.map((pName, idx) => {
              const state = processStates[pName] || 'waiting';
              const isFinished = state === 'completed';

              return (
                <React.Fragment key={pName}>
                  <button
                    onClick={() => onSelectProcess?.(pName)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                      isFinished
                        ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-950/60 border-cyan-500/30 text-cyan-200'
                    }`}
                  >
                    <span>{pName}</span>
                    {isFinished && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  {idx < safeSequence.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400/60 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Explanation text */}
      <div className="mt-3 pt-3 border-t border-cyan-500/15 text-xs font-mono text-slate-300 leading-relaxed">
        {explanation ||
          (isSafe
            ? `All ${safeSequence.length} processes can execute in sequence without deadlocking.`
            : 'No complete safe execution sequence exists for all processes.')}
      </div>
    </div>
  );
};
