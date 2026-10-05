import React, { useState } from 'react';
import { Database, Layers, Calculator, GitPullRequest } from 'lucide-react';

export type MatrixTab =
  | 'banker'
  | 'deadlock'
  | 'all'
  | 'allocation'
  | 'maximum'
  | 'need'
  | 'request';

interface MatrixSectionProps {
  numProcesses: number;
  numResources: number;
  allocation: number[][];
  maxMatrix: number[][];
  needMatrix: number[][];
  requestMatrix: number[][];
  onAllocationChange: (processIndex: number, resourceIndex: number, value: number) => void;
  onMaxChange: (processIndex: number, resourceIndex: number, value: number) => void;
  onRequestChange: (processIndex: number, resourceIndex: number, value: number) => void;
  deadlockedProcesses?: string[];
  activeProcess?: string | null;
  completedProcesses?: string[];
  onSelectProcess?: (processName: string) => void;
  searchQuery?: string;
}

export const MatrixSection: React.FC<MatrixSectionProps> = ({
  numProcesses,
  numResources,
  allocation,
  maxMatrix,
  needMatrix,
  requestMatrix,
  onAllocationChange,
  onMaxChange,
  onRequestChange,
  deadlockedProcesses = [],
  activeProcess = null,
  completedProcesses = [],
  onSelectProcess,
  searchQuery = '',
}) => {
  const [activeTab, setActiveTab] = useState<MatrixTab>('banker');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const isProcessMatched = (pIdx: number) => {
    if (!normalizedQuery) return false;
    const name = `p${pIdx + 1}`;
    return normalizedQuery === name || normalizedQuery === String(pIdx + 1);
  };

  const isResourceMatched = (rIdx: number) => {
    if (!normalizedQuery) return false;
    const name = `r${rIdx + 1}`;
    return normalizedQuery === name || normalizedQuery === String(rIdx + 1);
  };

  // 1. ALLOCATION MATRIX (Currently Held)
  const renderAllocationMatrix = () => (
    <div className="bg-[#0c1126] border border-[#192344] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#202e58] transition-all">
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-[#141d38] mb-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wide">
            <div className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-3.5 h-3.5" />
            </div>
            <span>Allocation Matrix</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-700/60 px-2 py-0.5 rounded-full font-semibold">
            Currently Held
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Current resource instances held by each process.
        </p>

        <div className="overflow-x-auto pb-1">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-1.5 text-xs font-semibold text-slate-400 border-b border-[#151e3a] text-left w-12">
                  Proc
                </th>
                {Array.from({ length: numResources }).map((_, rIdx) => {
                  const isMatch = isResourceMatched(rIdx);
                  return (
                    <th
                      key={rIdx}
                      className={`p-1.5 text-xs font-mono font-bold border-b border-[#151e3a] w-14 transition-colors ${
                        isMatch ? 'text-blue-400 bg-blue-950/40' : 'text-slate-300'
                      }`}
                    >
                      R{rIdx + 1}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numProcesses }).map((_, pIdx) => {
                const processName = `P${pIdx + 1}`;
                const isDeadlocked = deadlockedProcesses.includes(processName);
                const isActive = activeProcess === processName;
                const isCompleted = completedProcesses.includes(processName);
                const isMatched = isProcessMatched(pIdx);

                return (
                  <tr
                    key={pIdx}
                    className={`border-b border-[#121935] transition-colors ${
                      isMatched
                        ? 'bg-blue-950/60 ring-1 ring-blue-500/80'
                        : isActive
                        ? 'bg-blue-950/50'
                        : isCompleted
                        ? 'bg-emerald-950/20'
                        : isDeadlocked
                        ? 'bg-rose-950/30'
                        : 'hover:bg-[#0e142e]'
                    }`}
                  >
                    <td className="p-1.5 text-left font-mono">
                      <button
                        type="button"
                        onClick={() => onSelectProcess?.(processName)}
                        title={`Inspect ${processName}`}
                        className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          isActive || isMatched
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400'
                            : isCompleted
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                            : isDeadlocked
                            ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                            : 'bg-[#0f152f] text-slate-300 border-[#202c52] hover:border-[#2d3e70]'
                        }`}
                      >
                        {processName}
                      </button>
                    </td>
                    {Array.from({ length: numResources }).map((_, rIdx) => {
                      const cellValue = allocation[pIdx]?.[rIdx] ?? 0;
                      const resMatch = isResourceMatched(rIdx);

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
                              onAllocationChange(pIdx, rIdx, clean);
                            }}
                            className={`w-11 sm:w-13 h-7.5 py-0.5 px-0.5 text-center text-xs font-mono font-bold rounded-lg bg-[#080c1c] border text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all ${
                              resMatch ? 'border-blue-500/80 bg-blue-950/40' : 'border-[#1d294d]'
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
      </div>
    </div>
  );

  // 2. MAXIMUM MATRIX (Max Demand)
  const renderMaxMatrix = () => (
    <div className="bg-[#0c1126] border border-[#192344] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#202e58] transition-all">
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-[#141d38] mb-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wide">
            <div className="p-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span>Maximum Matrix</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/70 border border-amber-700/60 px-2 py-0.5 rounded-full font-semibold">
            Max Demand
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Maximum resource limits declared by each process.
        </p>

        <div className="overflow-x-auto pb-1">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-1.5 text-xs font-semibold text-slate-400 border-b border-[#151e3a] text-left w-12">
                  Proc
                </th>
                {Array.from({ length: numResources }).map((_, rIdx) => {
                  const isMatch = isResourceMatched(rIdx);
                  return (
                    <th
                      key={rIdx}
                      className={`p-1.5 text-xs font-mono font-bold border-b border-[#151e3a] w-14 transition-colors ${
                        isMatch ? 'text-amber-400 bg-amber-950/40' : 'text-slate-300'
                      }`}
                    >
                      R{rIdx + 1}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numProcesses }).map((_, pIdx) => {
                const processName = `P${pIdx + 1}`;
                const isActive = activeProcess === processName;
                const isMatched = isProcessMatched(pIdx);

                return (
                  <tr
                    key={pIdx}
                    className={`border-b border-[#121935] transition-colors ${
                      isMatched
                        ? 'bg-amber-950/50 ring-1 ring-amber-500/80'
                        : isActive
                        ? 'bg-blue-950/50'
                        : 'hover:bg-[#0e142e]'
                    }`}
                  >
                    <td className="p-1.5 text-left font-mono">
                      <button
                        type="button"
                        onClick={() => onSelectProcess?.(processName)}
                        title={`Inspect ${processName}`}
                        className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          isActive || isMatched
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400'
                            : 'bg-[#0f152f] text-slate-300 border-[#202c52] hover:border-[#2d3e70]'
                        }`}
                      >
                        {processName}
                      </button>
                    </td>
                    {Array.from({ length: numResources }).map((_, rIdx) => {
                      const maxVal = maxMatrix[pIdx]?.[rIdx] ?? 0;
                      const allocVal = allocation[pIdx]?.[rIdx] ?? 0;
                      const resMatch = isResourceMatched(rIdx);

                      return (
                        <td key={rIdx} className="p-1.5">
                          <input
                            type="number"
                            min={0}
                            max={99}
                            value={maxVal}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const parsed = raw === '' ? 0 : parseInt(raw, 10);
                              const clean = isNaN(parsed) ? 0 : Math.max(0, parsed);
                              onMaxChange(pIdx, rIdx, clean);
                            }}
                            className={`w-11 sm:w-13 h-7.5 py-0.5 px-0.5 text-center text-xs font-mono font-bold rounded-lg bg-[#080c1c] border text-amber-300 focus:outline-none focus:border-amber-500 transition-all ${
                              maxVal < allocVal
                                ? 'border-rose-500 text-rose-300'
                                : resMatch
                                ? 'border-amber-500/80 bg-amber-950/30'
                                : 'border-[#1d294d]'
                            }`}
                            title={maxVal < allocVal ? `Must be >= Allocation (${allocVal})` : undefined}
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
      </div>
    </div>
  );

  // 3. NEED MATRIX (Auto-calculated: Max - Allocation)
  const renderNeedMatrix = () => (
    <div className="bg-[#0c1126] border border-[#192344] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#202e58] transition-all">
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-[#141d38] mb-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wide">
            <div className="p-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <span>Need Matrix</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-700/60 px-2 py-0.5 rounded-full font-semibold">
            AUTO-CALCULATED
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Calculated dynamic demand: Max − Allocation
        </p>

        <div className="overflow-x-auto pb-1">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-1.5 text-xs font-semibold text-slate-400 border-b border-[#151e3a] text-left w-12">
                  Proc
                </th>
                {Array.from({ length: numResources }).map((_, rIdx) => {
                  const isMatch = isResourceMatched(rIdx);
                  return (
                    <th
                      key={rIdx}
                      className={`p-1.5 text-xs font-mono font-bold border-b border-[#151e3a] w-14 transition-colors ${
                        isMatch ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-300'
                      }`}
                    >
                      R{rIdx + 1}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numProcesses }).map((_, pIdx) => {
                const processName = `P${pIdx + 1}`;
                const isActive = activeProcess === processName;
                const isMatched = isProcessMatched(pIdx);

                return (
                  <tr
                    key={pIdx}
                    className={`border-b border-[#121935] transition-colors ${
                      isMatched
                        ? 'bg-cyan-950/50 ring-1 ring-cyan-500/80'
                        : isActive
                        ? 'bg-blue-950/50'
                        : 'hover:bg-[#0e142e]'
                    }`}
                  >
                    <td className="p-1.5 text-left font-mono">
                      <button
                        type="button"
                        onClick={() => onSelectProcess?.(processName)}
                        title={`Inspect ${processName}`}
                        className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          isActive || isMatched
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400'
                            : 'bg-[#0f152f] text-slate-300 border-[#202c52] hover:border-[#2d3e70]'
                        }`}
                      >
                        {processName}
                      </button>
                    </td>
                    {Array.from({ length: numResources }).map((_, rIdx) => {
                      const needVal = needMatrix[pIdx]?.[rIdx] ?? 0;
                      const resMatch = isResourceMatched(rIdx);

                      return (
                        <td key={rIdx} className="p-1.5">
                          <div
                            className={`w-11 sm:w-13 h-7.5 flex items-center justify-center text-xs font-mono font-bold rounded-lg bg-[#080c1c] border text-cyan-300 mx-auto transition-all ${
                              resMatch ? 'border-cyan-500/80 bg-cyan-950/40' : 'border-[#182346]'
                            }`}
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
      </div>
    </div>
  );

  // 4. REQUEST MATRIX (For Deadlock Detection)
  const renderRequestMatrix = () => (
    <div className="bg-[#0c1126] border border-[#192344] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#202e58] transition-all">
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-[#141d38] mb-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wide">
            <div className="p-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <GitPullRequest className="w-3.5 h-3.5" />
            </div>
            <span>Request Matrix</span>
          </div>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-950/70 border border-purple-700/60 px-2 py-0.5 rounded-full font-semibold">
            Deadlock Claim
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Outstanding claims requested by each process for deadlock verification.
        </p>

        <div className="overflow-x-auto pb-1">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-1.5 text-xs font-semibold text-slate-400 border-b border-[#151e3a] text-left w-12">
                  Proc
                </th>
                {Array.from({ length: numResources }).map((_, rIdx) => {
                  const isMatch = isResourceMatched(rIdx);
                  return (
                    <th
                      key={rIdx}
                      className={`p-1.5 text-xs font-mono font-bold border-b border-[#151e3a] w-14 transition-colors ${
                        isMatch ? 'text-purple-400 bg-purple-950/40' : 'text-slate-300'
                      }`}
                    >
                      R{rIdx + 1}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numProcesses }).map((_, pIdx) => {
                const processName = `P${pIdx + 1}`;
                const isDeadlocked = deadlockedProcesses.includes(processName);
                const isActive = activeProcess === processName;
                const isMatched = isProcessMatched(pIdx);

                return (
                  <tr
                    key={pIdx}
                    className={`border-b border-[#121935] transition-colors ${
                      isMatched
                        ? 'bg-purple-950/60 ring-1 ring-purple-500/80'
                        : isActive
                        ? 'bg-blue-950/50'
                        : isDeadlocked
                        ? 'bg-rose-950/30'
                        : 'hover:bg-[#0e142e]'
                    }`}
                  >
                    <td className="p-1.5 text-left font-mono">
                      <button
                        type="button"
                        onClick={() => onSelectProcess?.(processName)}
                        title={`Inspect ${processName}`}
                        className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          isActive || isMatched
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400'
                            : isDeadlocked
                            ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                            : 'bg-[#0f152f] text-slate-300 border-[#202c52] hover:border-[#2d3e70]'
                        }`}
                      >
                        {processName}
                      </button>
                    </td>
                    {Array.from({ length: numResources }).map((_, rIdx) => {
                      const reqVal = requestMatrix[pIdx]?.[rIdx] ?? 0;
                      const resMatch = isResourceMatched(rIdx);

                      return (
                        <td key={rIdx} className="p-1.5">
                          <input
                            type="number"
                            min={0}
                            max={99}
                            value={reqVal}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const parsed = raw === '' ? 0 : parseInt(raw, 10);
                              const clean = isNaN(parsed) ? 0 : Math.max(0, parsed);
                              onRequestChange(pIdx, rIdx, clean);
                            }}
                            className={`w-11 sm:w-13 h-7.5 py-0.5 px-0.5 text-center text-xs font-mono font-bold rounded-lg bg-[#080c1c] border text-purple-300 focus:outline-none focus:border-purple-500 transition-all ${
                              resMatch ? 'border-purple-500/80 bg-purple-950/40' : 'border-[#1d294d]'
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
      </div>
    </div>
  );

  return (
    <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-5 space-y-4 shadow-sm hover:border-[#202e58] transition-all">
      {/* Matrix Tab Selector matching Reference timeframe/category pill toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#141d38] pb-3">
        <div className="flex items-center flex-wrap gap-1 bg-[#0d1228] p-1 rounded-xl border border-[#1d294d] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('banker')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'banker'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-900 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Banker's (3-Column)
          </button>
          <button
            onClick={() => setActiveTab('deadlock')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'deadlock'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-900 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deadlock (Alloc & Req)
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-900 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All 4 Matrices
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'allocation'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Alloc
          </button>
          <button
            onClick={() => setActiveTab('maximum')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'maximum'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-900 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Max
          </button>
          <button
            onClick={() => setActiveTab('need')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'need'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-900 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Need
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'request'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-900 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Request
          </button>
        </div>

        {searchQuery && (
          <div className="text-xs text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full font-mono font-medium">
            Filtered: "{searchQuery}"
          </div>
        )}
      </div>

      {/* 1. Banker's Matrices: 3 columns */}
      {activeTab === 'banker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {renderAllocationMatrix()}
          {renderMaxMatrix()}
          {renderNeedMatrix()}
        </div>
      )}

      {/* 2. Deadlock Detection: 2 columns Allocation + Request */}
      {activeTab === 'deadlock' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderAllocationMatrix()}
          {renderRequestMatrix()}
        </div>
      )}

      {/* 3. All 4 Matrices */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderAllocationMatrix()}
          {renderMaxMatrix()}
          {renderNeedMatrix()}
          {renderRequestMatrix()}
        </div>
      )}

      {/* Individual Focused Views */}
      {activeTab === 'allocation' && renderAllocationMatrix()}
      {activeTab === 'maximum' && renderMaxMatrix()}
      {activeTab === 'need' && renderNeedMatrix()}
      {activeTab === 'request' && renderRequestMatrix()}
    </div>
  );
};
