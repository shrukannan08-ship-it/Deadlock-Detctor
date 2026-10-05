import React from 'react';
import { Database } from 'lucide-react';

interface AllocationMatrixProps {
  numProcesses: number;
  numResources: number;
  allocation: number[][];
  onChange: (processIndex: number, resourceIndex: number, value: number) => void;
  deadlockedProcesses?: string[];
}

export const AllocationMatrix: React.FC<AllocationMatrixProps> = ({
  numProcesses,
  numResources,
  allocation,
  onChange,
  deadlockedProcesses = [],
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3.5">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Allocation Matrix</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
          Currently Held (R → P)
        </span>
      </div>

      <div className="overflow-x-auto flex-1 pb-1">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-mono text-slate-400 border-b border-slate-800 text-left w-14">
                Process
              </th>
              {Array.from({ length: numResources }).map((_, rIdx) => (
                <th
                  key={rIdx}
                  className="p-2 text-xs font-mono font-bold text-cyan-400 border-b border-slate-800"
                >
                  R{rIdx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numProcesses }).map((_, pIdx) => {
              const processName = `P${pIdx + 1}`;
              const isDeadlocked = deadlockedProcesses.includes(processName);

              return (
                <tr
                  key={pIdx}
                  className={`border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors ${
                    isDeadlocked ? 'bg-red-950/20' : ''
                  }`}
                >
                  <td className="p-2 text-xs font-mono font-bold text-left">
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-xs ${
                        isDeadlocked
                          ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      {processName}
                    </span>
                  </td>
                  {Array.from({ length: numResources }).map((_, rIdx) => {
                    const cellValue = allocation[pIdx]?.[rIdx] ?? 0;

                    return (
                      <td key={rIdx} className="p-1.5">
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={cellValue}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const parsed = raw === '' ? 0 : parseInt(raw, 10);
                            const clean = isNaN(parsed) ? 0 : Math.max(0, parsed);
                            onChange(pIdx, rIdx, clean);
                          }}
                          className={`w-14 sm:w-16 py-1.5 px-1 text-center text-xs font-mono font-medium rounded bg-slate-950 border transition-all focus:outline-none ${
                            isDeadlocked
                              ? 'border-red-500/50 text-red-200 focus:border-red-400'
                              : 'border-slate-700/80 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-500 mt-3">
        Resources currently allocated to each process.
      </p>
    </div>
  );
};
