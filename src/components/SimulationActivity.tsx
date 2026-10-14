import React from 'react';
import { Terminal, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import type { DetectionStep, BankerStep } from '../types/deadlock';

interface SimulationActivityProps {
  detectionSteps?: DetectionStep[];
  bankerSteps?: BankerStep[];
  isDeadlocked?: boolean;
  isSafe?: boolean | null;
}

export const SimulationActivity: React.FC<SimulationActivityProps> = ({
  detectionSteps = [],
  bankerSteps = [],
  isDeadlocked,
  isSafe,
}) => {
  return (
    <div className="glass-panel-primary rounded-2xl p-5 space-y-4 hover:border-cyan-500/35 transition-all holo-shimmer">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="font-sans">Holographic Kernel Telemetry Stream</span>
        </div>
        <span className="text-xs font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer font-semibold">
          Live Stream <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
        </span>
      </div>

      {/* Activity Log */}
      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs font-mono">
        {detectionSteps.length > 0 ? (
          detectionSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-3 rounded-xl glass-panel-secondary border border-cyan-500/20 flex items-start justify-between gap-2.5 hover:border-cyan-400/40 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-cyan-400 font-mono">#{String(step.stepNumber).padStart(2, '0')}</span>
                  <span className="text-white font-bold font-mono">{step.process}</span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.2 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.25)]">
                    RESOLVED
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Releases allocation [{step.allocatedReleased.join(', ')}] → Work Pool: [{step.workAfter.join(', ')}]
                </p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            </div>
          ))
        ) : bankerSteps.length > 0 ? (
          bankerSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-3 rounded-xl glass-panel-secondary border border-cyan-500/20 flex items-start justify-between gap-2.5 hover:border-cyan-400/40 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-cyan-400 font-mono">#{String(step.stepNumber).padStart(2, '0')}</span>
                  <span className="text-white font-bold font-mono">{step.process}</span>
                  {step.canExecute ? (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.2 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.25)]">
                      FEASIBLE
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/70 border border-amber-500/40 px-2 py-0.2 rounded-full shadow-[0_0_6px_rgba(245,158,11,0.25)]">
                      WAITING
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {step.canExecute
                    ? `Need ≤ Work satisfied. Released [${step.allocation.join(', ')}] → Available: [${step.workAfter.join(', ')}]`
                    : `Need [${step.need.join(', ')}] exceeds Work [${step.workBefore.join(', ')}]. Blocked.`}
                </p>
              </div>
              {step.canExecute ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs font-mono border border-dashed border-cyan-500/20 rounded-xl bg-slate-950/30">
            Awaiting simulation run. Click "Detect Deadlock" or "Check Safe State" to stream activity.
          </div>
        )}

        {isDeadlocked && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>HALT: Circular wait condition confirmed. System in deadlock state.</span>
          </div>
        )}

        {isSafe && (
          <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>SAFE: All processes can successfully complete without deadlock.</span>
          </div>
        )}
      </div>
    </div>
  );
};
