import React from 'react';
import { Activity, CheckCircle2, Clock } from 'lucide-react';
import type { BankerStep } from '../types/deadlock';

interface ExecutionTraceTableProps {
  steps: BankerStep[];
  currentStepNumber?: number;
  searchQuery?: string;
}

export const ExecutionTraceTable: React.FC<ExecutionTraceTableProps> = ({
  steps,
  currentStepNumber,
  searchQuery = '',
}) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return (
    <div className="glass-panel-primary rounded-2xl p-5 hover:border-cyan-500/35 transition-all space-y-3.5 holo-shimmer">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-sans">Holographic Execution Trace Table</span>
        </div>
        <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded-full border border-cyan-500/25">
          {steps.length} Steps Recorded
        </span>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 font-mono border border-dashed border-cyan-500/20 rounded-xl bg-slate-950/30">
          No execution trace recorded yet. Run "Check Safe State" to simulate the algorithm step-by-step.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-cyan-500/20 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Step</th>
                <th className="py-2.5 px-3">Process</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Need</th>
                <th className="py-2.5 px-3">Work Before</th>
                <th className="py-2.5 px-3">Alloc Released</th>
                <th className="py-2.5 px-3">New Work</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {steps.map((step) => {
                const isCurrent = currentStepNumber === step.stepNumber;
                const isMatched =
                  normalizedQuery &&
                  (normalizedQuery === step.process.toLowerCase() ||
                    normalizedQuery === step.process.replace('P', ''));

                return (
                  <tr
                    key={step.stepNumber}
                    className={`transition-colors ${
                      isMatched
                        ? 'bg-cyan-950/60 ring-1 ring-cyan-400/80 font-bold'
                        : isCurrent
                        ? 'bg-gradient-to-r from-cyan-950/60 to-transparent border-l-2 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'hover:bg-cyan-950/20 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-cyan-300 text-[11px] border border-cyan-500/20">
                        #{String(step.stepNumber).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      <span className={isMatched ? 'text-cyan-300 underline' : ''}>
                        {step.process}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {step.canExecute ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          COMPLETED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                          <Clock className="w-3 h-3 text-amber-400" />
                          WAITING
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300 font-medium">
                      [{step.need.join(', ')}]
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      [{step.workBefore.join(', ')}]
                    </td>
                    <td className="py-2.5 px-3 text-amber-300 font-bold">
                      {step.canExecute ? `+ [${step.allocation.join(', ')}]` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold shadow-[0_0_6px_rgba(52,211,153,0.2)]">
                      [{step.workAfter.join(', ')}]
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
