import React from 'react';
import { Layers, AlertTriangle } from 'lucide-react';

interface MaxMatrixProps {
  numProcesses: number;
  numResources: number;
  maxMatrix: number[][];
  allocation: number[][];
  onChange: (processIndex: number, resourceIndex: number, value: number) => void;
  deadlockedProcesses?: string[];
}

export const MaxMatrix: React.FC<MaxMatrixProps> = ({
  numProcesses,
  numResources,
  maxMatrix,
  allocation,
  onChange,
  deadlockedProcesses = [],
}) => {
  // Check if any cell has Max < Allocation
  const hasInvalidMax = Array.from({ length: numProcesses }).some((_, p) =>
    Array.from({ length: numResources }).some((_, r) => {
      const maxVal = maxMatrix[p]?.[r] ?? 0;
      const allocVal = allocation[p]?.[r] ?? 0;
      return maxVal < allocVal;
    })
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3.5">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Maximum Matrix (Max Demand)</span>
        </div>
        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
          Max Claim (P)
        </span>
      </div>

      {hasInvalidMax && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          <span>Invalid: Max Demand must be ≥ Allocation for each cell!</span>
        </div>
      )}

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
                    const cellValue = maxMatrix[pIdx]?.[rIdx] ?? 0;
                    const allocValue = allocation[pIdx]?.[rIdx] ?? 0;
                    const isCellInvalid = cellValue < allocValue;

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
                            isCellInvalid
                              ? 'border-rose-500 text-rose-300 bg-rose-950/40 ring-1 ring-rose-500/50'
                              : isDeadlocked
                              ? 'border-red-500/50 text-red-200 focus:border-red-400'
                              : 'border-slate-700/80 text-slate-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40'
                          }`}
                          title={isCellInvalid ? `Max (${cellValue}) < Allocation (${allocValue})` : undefined}
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
        Maximum resources each process may declare before execution.
      </p>
    </div>
  );
};
