import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { DetectionResultData } from '../types/deadlock';

interface DetectionResultProps {
  result: DetectionResultData | null;
}

export const DetectionResult: React.FC<DetectionResultProps> = ({ result }) => {
  return (
    <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-5 space-y-4 shadow-sm hover:border-[#202e58] transition-all">
      {/* Card Header matching Reference */}
      <div className="flex items-center justify-between pb-3 border-b border-[#141d38]">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span>Deadlock Detection Verification</span>
        </div>
        {result && (
          <span className="text-xs text-slate-400 font-medium">
            {result.isDeadlocked ? 'Circular Wait Detected' : 'All Clear • No Cycles'}
          </span>
        )}
      </div>

      {!result ? (
        <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-[#1d294d] rounded-xl bg-[#0c1126]">
          Click "Detect Deadlock" to evaluate resource allocation and request dependencies.
        </div>
      ) : result.isDeadlocked ? (
        <div className="space-y-3">
          {/* Deadlock banner */}
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/50">
            <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>DEADLOCK DETECTED</span>
            </div>

            <div className="mt-2.5 space-y-1.5 text-xs">
              <div>
                <span className="text-slate-300">Deadlocked processes: </span>
                <span className="font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-700/60 font-mono">
                  {result.deadlockedProcesses.join(', ')}
                </span>
              </div>

              {result.involvedResources && result.involvedResources.length > 0 && (
                <div>
                  <span className="text-slate-300">Involved resources: </span>
                  <span className="font-medium text-slate-200 bg-[#0d1228] px-2 py-0.5 rounded-md border border-[#1e2a50] font-mono">
                    {result.involvedResources.join(', ')}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-rose-300/90 mt-2 leading-relaxed">
              Circular wait detected. These processes cannot acquire requested resources and are permanently blocked in a dependency loop.
            </p>
          </div>

          {/* Execution Trace if any processes could run before deadlocking */}
          {result.steps.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-slate-300">
                Execution Sequence Trace:
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {result.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-3 rounded-xl bg-[#0c1126] border border-[#182346] text-xs space-y-1"
                  >
                    <div className="text-emerald-400 font-bold">
                      Step {step.stepNumber}: {step.process}
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Safe banner */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/50">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SAFE — NO DEADLOCK DETECTED</span>
            </div>
            <p className="text-xs text-emerald-300/90 mt-1.5 leading-relaxed">
              All processes ({result.resolvedProcesses.join(', ')}) can acquire requested resources and terminate successfully without mutual blocking.
            </p>
          </div>

          {/* Execution Sequence Trace */}
          {result.steps.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-slate-300">
                Execution Sequence Trace:
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {result.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-3 rounded-xl bg-[#0c1126] border border-[#182346] text-xs space-y-1"
                  >
                    <div className="text-emerald-400 font-bold">
                      Step {step.stepNumber}: {step.process}
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
