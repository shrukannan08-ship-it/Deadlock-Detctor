import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
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
      <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-5 text-center py-6 shadow-sm">
        <div className="text-slate-400 text-xs">
          Click "Check Safe State" to evaluate system state with Banker’s Algorithm.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-5 border transition-all shadow-sm ${
        isSafe
          ? 'bg-[#0a0e22] border-emerald-500/40'
          : 'bg-[#0a0e22] border-rose-500/40'
      }`}
    >
      {/* Header matching Reference Market Insight card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#141d38] mb-3.5 gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${
            isSafe ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {isSafe ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <div className={`font-bold text-sm tracking-wide ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isSafe ? 'SYSTEM IS IN A SAFE STATE' : 'SYSTEM IS IN AN UNSAFE STATE'}
            </div>
            <div className="text-[11px] text-slate-400">
              {isSafe ? 'High Confidence • No Deadlock Risk' : 'Resource Allocation Hazard Detected'}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Waiting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-blue-300">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-300">Completed ✓</span>
          </div>
        </div>
      </div>

      {isSafe && safeSequence.length > 0 ? (
        <div className="space-y-3.5">
          <div className="text-xs font-semibold text-slate-300">
            Safe Execution Order Sequence:
          </div>

          {/* Sequence Node Flow */}
          <div className="overflow-x-auto pb-1">
            <div className="flex items-center gap-2 min-w-max">
              {safeSequence.map((proc, idx) => {
                const state = processStates[proc] || 'waiting';

                return (
                  <React.Fragment key={idx}>
                    <button
                      type="button"
                      onClick={() => onSelectProcess?.(proc)}
                      title={`Inspect ${proc}`}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-sm ${
                        state === 'active'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-blue-900/50'
                          : state === 'completed'
                          ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-200'
                          : 'bg-[#0d1228] border-[#1d294d] text-slate-300 hover:text-white hover:border-[#2d3e70]'
                      }`}
                    >
                      <span>{proc}</span>
                      {state === 'completed' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>

                    {idx < safeSequence.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Callout box */}
          <div className="text-xs text-emerald-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40 leading-relaxed">
            {explanation ||
              `The system is in a SAFE STATE. All ${safeSequence.length} processes can execute in the safe sequence ${safeSequence.join(
                ' → '
              )} without deadlocking.`}
          </div>
        </div>
      ) : (
        <div className="text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-800/40 leading-relaxed">
          {explanation || 'No complete safe execution sequence exists for all processes.'}
        </div>
      )}
    </div>
  );
};
