import React from 'react';
import { CheckCheck, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { SafeStateResultData } from '../types/deadlock';

interface SafeStateResultProps {
  result: SafeStateResultData | null;
  onRunSafetyCheck: () => void;
  isLoading?: boolean;
}

export const SafeStateResult: React.FC<SafeStateResultProps> = ({
  result,
  onRunSafetyCheck,
  isLoading = false,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm space-y-4">
      {/* Header & Primary Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Banker’s Safety Check & Results</span>
        </div>
        <button
          onClick={onRunSafetyCheck}
          disabled={isLoading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <CheckCheck className="w-4 h-4" />
          {isLoading ? 'Running Safety Check...' : 'Run Safety Check'}
        </button>
      </div>

      {!result ? (
        <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-lg">
          Click <span className="font-semibold text-emerald-400">"Run Safety Check"</span> to evaluate
          the system state using the Banker’s Algorithm.
        </div>
      ) : result.isSafe ? (
        <div className="space-y-4">
          {/* SAFE STATE BANNER */}
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 shadow-inner">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300 uppercase tracking-wide">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>SYSTEM STATE: SAFE</span>
            </div>

            {/* Safe Sequence */}
            <div className="mt-3">
              <div className="text-xs text-slate-300 font-semibold mb-2">
                Safe Execution Sequence:
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {result.safeSequence.map((proc, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-3 py-1.5 bg-emerald-900/90 border border-emerald-500/60 rounded-lg text-emerald-200 font-mono font-bold text-xs shadow-sm">
                      {proc}
                    </span>
                    {idx < result.safeSequence.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Vector metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-500/30 text-xs font-mono">
              <div className="text-emerald-200/90">
                <span className="text-slate-400">Initial Available:</span> [{result.initialAvailable.join(', ')}]
              </div>
              <div className="text-emerald-200/90">
                <span className="text-slate-400">Final Available (Work):</span> [{result.finalWork.join(', ')}]
              </div>
            </div>

            <p className="text-[11px] text-emerald-300/90 mt-2.5">
              {result.explanation}
            </p>
          </div>

          {/* STEP-BY-STEP BANKER EXECUTION SECTION */}
          {result.steps.length > 0 && (
            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
                <span>Step-by-Step Banker's Execution:</span>
                <span className="text-[11px] font-mono text-cyan-400 font-normal">
                  Work += Allocation
                </span>
              </div>

              <div className="space-y-2.5">
                {result.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="text-xs font-mono p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-slate-300 space-y-1"
                  >
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-500/40 rounded text-[10px]">
                          Step {step.stepNumber}
                        </span>
                        <span>{step.process} can execute</span>
                      </div>
                      <span className="text-emerald-300 text-[11px]">Need ≤ Work (TRUE)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                      <div>
                        <span className="text-slate-500">Need: </span>
                        <span className="text-cyan-300 font-semibold">[{step.need.join(', ')}]</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Work Before: </span>
                        <span className="text-slate-300">[{step.workBefore.join(', ')}]</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Alloc Released: </span>
                        <span className="text-amber-300 font-semibold">[{step.allocation.join(', ')}]</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-emerald-300 font-semibold pt-0.5 flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                      <span>New Work: [{step.workAfter.join(', ')}]</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* UNSAFE STATE BANNER */}
          <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 shadow-inner">
            <div className="flex items-center gap-2 text-sm font-bold text-rose-300 uppercase tracking-wide">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>SYSTEM STATE: UNSAFE</span>
            </div>

            <p className="text-xs text-rose-200 mt-2 font-medium">
              {result.explanation}
            </p>

            {result.unfinishedProcesses.length > 0 && (
              <div className="mt-2 text-xs text-rose-300 bg-rose-900/60 p-2 rounded border border-rose-500/40">
                Blocked / Unfinished Processes:{' '}
                <span className="font-mono font-bold text-white">
                  {result.unfinishedProcesses.join(', ')}
                </span>
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-rose-500/30 text-xs font-mono text-rose-300/80">
              <span>Initial Available: [{result.initialAvailable.join(', ')}]</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
