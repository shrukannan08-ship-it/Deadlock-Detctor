import React from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, Layers, Database, Calculator, Cpu } from 'lucide-react';
import type { ProcessState } from '../types/deadlock';

interface ProcessInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  processName: string | null;
  numResources: number;
  allocation: number[];
  maxDemand: number[];
  need: number[];
  available: number[];
  state: ProcessState;
  isDeadlocked?: boolean;
}

export const ProcessInspectorDrawer: React.FC<ProcessInspectorDrawerProps> = ({
  isOpen,
  onClose,
  processName,
  numResources,
  allocation,
  maxDemand,
  need,
  available,
  state,
  isDeadlocked = false,
}) => {
  if (!isOpen || !processName) return null;

  const canCurrentlyExecute = need.every((nVal, rIdx) => nVal <= (available[rIdx] ?? 0));
  const deficitResources: number[] = [];
  need.forEach((nVal, rIdx) => {
    if (nVal > (available[rIdx] ?? 0)) {
      deficitResources.push(rIdx);
    }
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#02050f]/80 backdrop-blur-md z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Holographic Slide-over Drawer */}
      <div className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-96 glass-panel-hud border-l border-cyan-500/25 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col transition-transform">
        {/* Drawer Header */}
        <div className="p-4.5 border-b border-cyan-500/15 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-transparent to-transparent">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" />
              INSPECT: {processName}
            </h2>
            <span className="text-xs font-mono text-cyan-400/80">Resource Vectors & Feasibility Telemetry</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-cyan-950/40 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer border border-cyan-500/20"
            aria-label="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 p-4.5 space-y-4 overflow-y-auto">
          {/* Status Badge */}
          <div className="glass-panel-secondary p-3.5 rounded-xl border border-cyan-500/20 flex items-center justify-between font-mono">
            <span className="text-xs font-semibold text-slate-400">
              EXECUTION STATE:
            </span>
            {isDeadlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/70 text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Deadlocked
              </span>
            ) : state === 'completed' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Done ✓
              </span>
            ) : state === 'active' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-pulse">
                Active Stepper
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-950/80 text-slate-300 border border-cyan-500/20">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Waiting
              </span>
            )}
          </div>

          {/* Vectors Table */}
          <div className="space-y-3 font-mono">
            {/* Allocation */}
            <div className="glass-panel-secondary p-3.5 rounded-xl border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Database className="w-3.5 h-3.5" />
                  <span>Allocation (Held)</span>
                </div>
                <span className="text-emerald-400 font-bold">[{allocation.join(', ')}]</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {Array.from({ length: numResources }).map((_, rIdx) => (
                  <div key={rIdx} className="bg-slate-950/70 p-1.5 rounded-lg text-center border border-cyan-500/15">
                    <span className="text-[10px] text-slate-400 block">R{rIdx + 1}</span>
                    <span className="text-xs font-bold text-emerald-300">{allocation[rIdx] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Maximum Demand */}
            <div className="glass-panel-secondary p-3.5 rounded-xl border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2 text-amber-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Max Declared</span>
                </div>
                <span className="text-amber-400 font-bold">[{maxDemand.join(', ')}]</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {Array.from({ length: numResources }).map((_, rIdx) => (
                  <div key={rIdx} className="bg-slate-950/70 p-1.5 rounded-lg text-center border border-cyan-500/15">
                    <span className="text-[10px] text-slate-400 block">R{rIdx + 1}</span>
                    <span className="text-xs font-bold text-amber-300">{maxDemand[rIdx] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Need Vector */}
            <div className="glass-panel-secondary p-3.5 rounded-xl border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Remaining Need</span>
                </div>
                <span className="text-cyan-400 font-bold">[{need.join(', ')}]</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {Array.from({ length: numResources }).map((_, rIdx) => (
                  <div key={rIdx} className="bg-slate-950/70 p-1.5 rounded-lg text-center border border-cyan-500/15">
                    <span className="text-[10px] text-slate-400 block">R{rIdx + 1}</span>
                    <span className="text-xs font-bold text-cyan-300">{need[rIdx] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Feasibility Reason */}
          <div className="glass-panel-secondary p-3.5 rounded-xl border border-cyan-500/20 space-y-2 font-mono">
            <div className="text-xs font-semibold text-cyan-300">
              STATE FEASIBILITY ANALYSIS:
            </div>

            {state === 'completed' ? (
              <p className="text-xs text-emerald-300 leading-relaxed">
                Process {processName} has finished execution and released all held resources to the available pool.
              </p>
            ) : canCurrentlyExecute ? (
              <p className="text-xs text-cyan-200 leading-relaxed">
                Process {processName} satisfies <span className="font-bold">Need ≤ Available</span> ([{need.join(', ')}] ≤ [{available.join(', ')}]) and is eligible to execute immediately.
              </p>
            ) : (
              <p className="text-xs text-amber-300 leading-relaxed">
                Process {processName} cannot execute because its Need ([{need.join(', ')}]) exceeds currently Available resources ([{available.join(', ')}]). Deficit on:{' '}
                <strong className="text-amber-200">
                  {deficitResources.map((r) => `R${r + 1}`).join(', ')}
                </strong>.
              </p>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-cyan-500/15 bg-slate-950/60 font-mono">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-950/80 hover:bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 text-xs font-semibold rounded-xl border border-cyan-500/25 transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </>
  );
};
