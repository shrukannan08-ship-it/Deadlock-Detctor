import React from 'react';
import { ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';
import type { DetectionResultData } from '../types/deadlock';

interface DetectionResultProps {
  result: DetectionResultData | null;
}

export const DetectionResult: React.FC<DetectionResultProps> = ({ result }) => {
  return (
    <div className="glass-panel-primary rounded-2xl p-5 space-y-4 hover:border-cyan-500/35 transition-all holo-shimmer">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.25)]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="font-sans">Deadlock Verification Analysis</span>
        </div>
        {result && (
          <span className="text-xs font-mono text-cyan-400/90">
            {result.isDeadlocked ? 'CIRCULAR WAIT DETECTED' : 'CYCLE-FREE KERNEL'}
          </span>
        )}
      </div>

      {!result ? (
        <div className="p-6 text-center text-slate-400 text-xs font-mono border border-dashed border-cyan-500/20 rounded-xl bg-slate-950/30">
          Click "Detect Deadlock" to evaluate resource allocation and request dependencies.
        </div>
      ) : result.isDeadlocked ? (
        <div className="space-y-3">
          {/* Deadlock banner */}
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-rose-300">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
              <span>DEADLOCK CYCLE DETECTED</span>
            </div>

            <div className="mt-2.5 space-y-1.5 text-xs font-mono">
              <div>
                <span className="text-slate-300">Deadlocked processes: </span>
                <span className="font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-600/60 font-mono shadow-[0_0_8px_rgba(244,63,94,0.2)]">
                  {result.deadlockedProcesses.join(', ')}
                </span>
              </div>

              {result.involvedResources && result.involvedResources.length > 0 && (
                <div>
                  <span className="text-slate-300">Involved resources: </span>
                  <span className="font-medium text-cyan-200 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30 font-mono">
                    {result.involvedResources.join(', ')}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-rose-300/90 mt-2.5 leading-relaxed font-mono">
              Circular wait detected. These processes cannot acquire requested resources and are permanently blocked in an unresolved dependency cycle.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Safe banner */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="flex items-center gap-2 text-sm font-bold font-mono text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>NO DEADLOCK DETECTED</span>
            </div>

            <p className="text-xs text-emerald-200/90 mt-2 leading-relaxed font-mono">
              All processes can resolve their pending requests without causing a circular wait. The resource graph contains no unresolvable knots.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
