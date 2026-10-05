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
    <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-5 shadow-sm hover:border-[#202e58] transition-all space-y-3.5">
      {/* Header matching Reference */}
      <div className="flex items-center justify-between pb-3 border-b border-[#141d38]">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <span>Algorithm Execution Trace Log</span>
        </div>
        <span className="text-xs font-semibold text-slate-400 bg-[#0d1228] px-2.5 py-1 rounded-full border border-[#1d294d]">
          {steps.length} Steps Recorded
        </span>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 font-mono border border-dashed border-[#1d294d] rounded-xl bg-[#0c1126]">
          No execution trace recorded yet. Run "Check Safe State" to simulate the algorithm step-by-step.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#151e3a] text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Step</th>
                <th className="py-2.5 px-3">Process</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Need</th>
                <th className="py-2.5 px-3">Work Before</th>
                <th className="py-2.5 px-3">Alloc Released</th>
                <th className="py-2.5 px-3">New Work</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121935]">
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
                        ? 'bg-blue-950/60 ring-1 ring-blue-500/80 font-bold'
                        : isCurrent
                        ? 'bg-gradient-to-r from-blue-950/50 to-transparent border-l-2 border-blue-500 text-white'
                        : 'hover:bg-[#0d132a] text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-[#0e142c] text-slate-400 text-[11px] border border-[#1f2c52]">
                        #{String(step.stepNumber).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white font-mono">
                      <span className={isMatched ? 'text-blue-400 underline' : ''}>
                        {step.process}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {step.canExecute ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          COMPLETED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-700/60">
                          <Clock className="w-3 h-3 text-amber-400" />
                          WAITING
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400 font-mono font-medium">
                      [{step.need.join(', ')}]
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono">
                      [{step.workBefore.join(', ')}]
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 font-mono font-bold">
                      {step.canExecute ? `+ [${step.allocation.join(', ')}]` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">
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
