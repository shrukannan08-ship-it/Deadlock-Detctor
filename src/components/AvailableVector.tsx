import React from 'react';
import { HardDrive, Server } from 'lucide-react';

interface AvailableVectorProps {
  numResources: number;
  available: number[];
  totalResources: number[];
  allocation: number[][];
  numProcesses: number;
  onAvailableChange: (resourceIndex: number, value: number) => void;
}

export const AvailableVector: React.FC<AvailableVectorProps> = ({
  numResources,
  available,
  totalResources,
  allocation,
  numProcesses,
  onAvailableChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Available Resources (Manual User Input) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3.5">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Available Resources</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            Manual Input
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Array.from({ length: numResources }).map((_, rIdx) => (
            <div
              key={rIdx}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-center"
            >
              <span className="text-[11px] font-mono text-emerald-400 font-bold block mb-1">
                R{rIdx + 1}
              </span>
              <input
                type="number"
                min={0}
                max={99}
                value={available[rIdx] ?? 0}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const raw = e.target.value;
                  const parsed = raw === '' ? 0 : parseInt(raw, 10);
                  const clean = isNaN(parsed) ? 0 : Math.max(0, parsed);
                  onAvailableChange(rIdx, clean);
                }}
                className="w-full px-1.5 py-1 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-2.5">
          Initial unallocated resource units ready in system.
        </p>
      </div>

      {/* 2. Total Resource Instances (Auto-calculated: Available + Sum(Allocation)) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3.5">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Total Resource Instances</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded">
            Available + Σ Alloc
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Array.from({ length: numResources }).map((_, rIdx) => {
            let sumAlloc = 0;
            for (let p = 0; p < numProcesses; p++) {
              sumAlloc += allocation[p]?.[rIdx] ?? 0;
            }
            const total = totalResources[rIdx] ?? 0;

            return (
              <div
                key={rIdx}
                className="bg-slate-950 border border-indigo-500/30 rounded-lg p-2 text-center"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300 font-bold mb-1">
                  <span>R{rIdx + 1}</span>
                  <span className="text-slate-500 text-[9px]">(+{sumAlloc})</span>
                </div>
                <div
                  className="w-full py-1 bg-indigo-950/40 border border-indigo-500/30 rounded text-center text-xs font-mono font-bold text-indigo-200"
                  title={`Available (${available[rIdx] ?? 0}) + Allocated (${sumAlloc}) = ${total}`}
                >
                  {total}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-500 mt-2.5">
          Total physical instances present in the OS environment.
        </p>
      </div>
    </div>
  );
};
