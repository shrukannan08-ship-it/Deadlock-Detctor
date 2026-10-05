import React, { useState } from 'react';
import { ArrowUpRight, Calculator, SlidersHorizontal } from 'lucide-react';

interface RequestMatrixProps {
  numProcesses: number;
  numResources: number;
  maxMatrix: number[][];
  allocation: number[][];
  needMatrix: number[][];
  onChangeMax: (processIndex: number, resourceIndex: number, value: number) => void;
  deadlockedProcesses?: string[];
}

export const RequestMatrix: React.FC<RequestMatrixProps> = ({
  numProcesses,
  numResources,
  maxMatrix,
  allocation,
  needMatrix,
  onChangeMax,
  deadlockedProcesses = [],
}) => {
  const [activeTab, setActiveTab] = useState<'max' | 'need'>('max');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-3.5 gap-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <ArrowUpRight className="w-4 h-4 text-amber-400" />
          <span>Max Demand & Need Matrix</span>
        </div>

        {/* Tab switch between Max Input and Calculated Need */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('max')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'max'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Max (Editable)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('need')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'need'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3 h-3" />
            Need (Max - Alloc)
          </button>
        </div>
      </div>

      {activeTab === 'max' ? (
        /* Max Matrix view (Editable) */
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-1.5 text-xs font-mono text-slate-400 border-b border-slate-800 text-left w-16">
                  Process
                </th>
                {Array.from({ length: numResources }).map((_, rIdx) => (
                  <th
                    key={rIdx}
                    className="p-1.5 text-xs font-mono font-bold text-cyan-400 border-b border-slate-800"
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
                    <td className="p-1.5 text-xs font-mono font-bold text-left">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          isDeadlocked
                            ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                            : 'bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        {processName}
                      </span>
                    </td>
                    {Array.from({ length: numResources }).map((_, rIdx) => {
                      const cellValue = maxMatrix[pIdx]?.[rIdx] ?? 0;

                      return (
                        <td key={rIdx} className="p-1">
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
                              onChangeMax(pIdx, rIdx, clean);
                            }}
                            className={`w-12 sm:w-14 py-1 px-1 text-center text-xs font-mono rounded bg-slate-950 border transition-all focus:outline-none ${
                              isDeadlocked
                                ? 'border-red-500/50 text-red-200 focus:border-red-400'
                                : 'border-slate-800 text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40'
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
      ) : (
        /* Calculated Need Matrix view */
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-1.5 text-xs font-mono text-slate-400 border-b border-slate-800 text-left w-16">
                  Process
                </th>
                {Array.from({ length: numResources }).map((_, rIdx) => (
                  <th
                    key={rIdx}
                    className="p-1.5 text-xs font-mono font-bold text-cyan-400 border-b border-slate-800"
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
                    <td className="p-1.5 text-xs font-mono font-bold text-left">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          isDeadlocked
                            ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                            : 'bg-slate-800/80 text-slate-300'
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
                        <td key={rIdx} className="p-1">
                          <div
                            className="w-12 sm:w-14 py-1 px-1 text-center text-xs font-mono rounded bg-slate-950 border border-cyan-500/30 text-cyan-300 font-bold mx-auto"
                            title={`Max (${maxVal}) - Alloc (${allocVal}) = ${needVal}`}
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
      )}

      {/* Helper text explaining the Banker's Need equation */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
        <span>Need[i][j] = Max[i][j] − Allocation[i][j]</span>
        <span className="text-cyan-400 font-mono">Auto-calculated in real-time</span>
      </div>
    </div>
  );
};
