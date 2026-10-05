import React from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, Layers, Database, Calculator } from 'lucide-react';
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
        className="fixed inset-0 bg-[#04060f]/80 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel matching Reference */}
      <div className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-96 bg-[#070a19] border-l border-[#192344] shadow-2xl flex flex-col transition-transform">
        {/* Drawer Header */}
        <div className="p-4.5 border-b border-[#141d38] flex items-center justify-between bg-[#0a0e22]">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Process Inspection: {processName}
            </h2>
            <span className="text-xs text-slate-400">Resource Vectors & Execution Telemetry</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0d1228] hover:bg-[#141b38] text-slate-400 hover:text-white transition-colors cursor-pointer border border-[#1d294d]"
            aria-label="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 p-4.5 space-y-4 overflow-y-auto">
          {/* Status Badge */}
          <div className="bg-[#0c1126] p-3.5 rounded-xl border border-[#182346] flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              Execution Status:
            </span>
            {isDeadlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/70 text-rose-300 border border-rose-700/60 shadow-sm shadow-rose-950">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Deadlocked
              </span>
            ) : state === 'completed' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 shadow-sm shadow-emerald-950">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Done ✓
              </span>
            ) : state === 'active' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-950/70 text-blue-300 border border-blue-600/60 shadow-sm shadow-blue-950">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#0e142c] text-slate-300 border border-[#202c52]">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Waiting
              </span>
            )}
          </div>

          {/* Vectors Table */}
          <div className="space-y-3">
            {/* Allocation */}
            <div className="bg-[#0c1126] p-3.5 rounded-xl border border-[#182346] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Database className="w-3.5 h-3.5" />
                  <span>Allocation (Currently Held)</span>
                </div>
                <span className="text-emerald-400 font-mono font-bold">[{allocation.join(', ')}]</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {Array.from({ length: numResources }).map((_, rIdx) => (
                  <div key={rIdx} className="bg-[#080c1c] p-1.5 rounded-lg text-center border border-[#182346]">
                    <span className="text-[10px] text-slate-400 block">R{rIdx + 1}</span>
                    <span className="text-xs font-bold text-emerald-300 font-mono">{allocation[rIdx] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Maximum Demand */}
            <div className="bg-[#0c1126] p-3.5 rounded-xl border border-[#182346] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2 text-amber-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Max Declared Demand</span>
                </div>
                <span className="text-amber-400 font-mono font-bold">[{maxDemand.join(', ')}]</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {Array.from({ length: numResources }).map((_, rIdx) => (
                  <div key={rIdx} className="bg-[#080c1c] p-1.5 rounded-lg text-center border border-[#182346]">
                    <span className="text-[10px] text-slate-400 block">R{rIdx + 1}</span>
                    <span className="text-xs font-bold text-amber-300 font-mono">{maxDemand[rIdx] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Need Vector */}
            <div className="bg-[#0c1126] p-3.5 rounded-xl border border-[#182346] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Remaining Need (Max − Alloc)</span>
                </div>
                <span className="text-cyan-400 font-mono font-bold">[{need.join(', ')}]</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {Array.from({ length: numResources }).map((_, rIdx) => (
                  <div key={rIdx} className="bg-[#080c1c] p-1.5 rounded-lg text-center border border-[#182346]">
                    <span className="text-[10px] text-slate-400 block">R{rIdx + 1}</span>
                    <span className="text-xs font-bold text-cyan-300 font-mono">{need[rIdx] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Feasibility Reason */}
          <div className="bg-[#0c1126] p-3.5 rounded-xl border border-[#182346] space-y-2">
            <div className="text-xs font-semibold text-slate-300">
              State Feasibility Analysis:
            </div>

            {state === 'completed' ? (
              <p className="text-xs text-emerald-300 leading-relaxed">
                Process {processName} has finished execution and returned all held resources to the available pool.
              </p>
            ) : canCurrentlyExecute ? (
              <p className="text-xs text-blue-300 leading-relaxed">
                Process {processName} satisfies <span className="font-bold">Need ≤ Available</span> ([{need.join(', ')}] ≤ [{available.join(', ')}]) and is eligible to execute.
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
        <div className="p-4 border-t border-[#141d38] bg-[#0a0e22]">
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#0e142c] hover:bg-[#162044] text-slate-300 text-xs font-semibold rounded-xl border border-[#202c52] transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </>
  );
};
