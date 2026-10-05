import React from 'react';
import { Calculator } from 'lucide-react';

interface NeedMatrixProps {
  numProcesses: number;
  numResources: number;
  needMatrix: number[][];
  maxMatrix: number[][];
  allocation: number[][];
  deadlockedProcesses?: string[];
}

export const NeedMatrix: React.FC<NeedMatrixProps> = ({
  numProcesses,
  numResources,
  needMatrix,
  maxMatrix,
  allocation,
  deadlockedProcesses = [],
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3.5">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <Calculator className="w-4 h-4 text-cyan-400" />
          <span>Need Matrix (Max − Allocation)</span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
          Auto-Calculated
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
                    const needVal = needMatrix[pIdx]?.[rIdx] ?? 0;
                    const maxVal = maxMatrix[pIdx]?.[rIdx] ?? 0;
                    const allocVal = allocation[pIdx]?.[rIdx] ?? 0;

                    return (
                      <td key={rIdx} className="p-1.5">
                        <div
                          className={`w-14 sm:w-16 py-1.5 px-1 text-center text-xs font-mono font-bold rounded mx-auto transition-all ${
                            isDeadlocked
                              ? 'bg-red-950/40 border border-red-500/50 text-red-300'
                              : 'bg-slate-950 border border-cyan-500/30 text-cyan-300'
                          }`}
                          title={`Max: ${maxVal} − Alloc: ${allocVal} = ${needVal}`}
                        >
                          {needVal}
                        </div>
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
        Remaining resource instances each process still needs to finish.
      </p>
    </div>
  );
};
