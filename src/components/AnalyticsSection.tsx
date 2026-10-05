import React from 'react';
import { BarChart3, Activity, Gauge } from 'lucide-react';

interface AnalyticsSectionProps {
  numProcesses: number;
  allocation: number[][];
  maxMatrix: number[][];
  totalResources: number[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  numProcesses,
  allocation,
  maxMatrix,
  totalResources,
}) => {
  // 1. Overall System Allocation Rate
  const totalAllocUnits = allocation.reduce(
    (sum, row) => sum + row.reduce((rSum, val) => rSum + (val || 0), 0),
    0
  );
  const totalSystemUnits = totalResources.reduce((sum, val) => sum + (val || 0), 0);
  const overallUtilization =
    totalSystemUnits > 0 ? Math.round((totalAllocUnits / totalSystemUnits) * 100) : 0;

  // 2. Process Demand Breakdown (Sum of allocated vs sum of declared max)
  const processClaims = Array.from({ length: numProcesses }).map((_, pIdx) => {
    const totalMax = maxMatrix[pIdx]?.reduce((sum, val) => sum + (val || 0), 0) ?? 0;
    const totalAlloc = allocation[pIdx]?.reduce((sum, val) => sum + (val || 0), 0) ?? 0;
    const pct = totalMax > 0 ? Math.min(100, Math.round((totalAlloc / totalMax) * 100)) : 0;
    return { name: `P${pIdx + 1}`, totalMax, totalAlloc, pct };
  });

  return (
    <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-5 space-y-4 shadow-sm hover:border-[#202e58] transition-all">
      {/* Header matching Reference */}
      <div className="flex items-center justify-between pb-3 border-b border-[#141d38]">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span>Simulation Analytics & Engine Metrics</span>
        </div>
        <span className="text-xs text-slate-400 bg-[#0d1228] px-3 py-1 rounded-full border border-[#1d294d]">
          Real-Time Terminal Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Circular Gauge Ring matching Reference AI Market Insight (82% Confidence Ring) */}
        <div className="bg-[#0c1126] p-4.5 rounded-2xl border border-[#192344] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">System Utilization</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/60 px-2.5 py-0.5 rounded-full">
              OPTIMAL
            </span>
          </div>

          <div className="flex items-center justify-around my-3">
            {/* SVG Circular Progress Ring matching Reference */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#16213e"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * overallUtilization) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-white tracking-tight">
                  {overallUtilization}%
                </span>
                <span className="text-[9px] text-cyan-400 uppercase font-semibold">Active</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">
                Allocated Units: <strong className="text-white font-mono">{totalAllocUnits}</strong>
              </div>
              <div className="text-xs text-slate-400">
                Total Capacity: <strong className="text-white font-mono">{totalSystemUnits}</strong>
              </div>
              <div className="text-xs text-slate-400">
                Remaining Pool: <strong className="text-emerald-400 font-mono">{Math.max(0, totalSystemUnits - totalAllocUnits)}</strong>
              </div>
            </div>
          </div>

          <div className="w-full bg-[#16213e] rounded-full h-2 overflow-hidden mt-1">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallUtilization}%` }}
            />
          </div>
        </div>

        {/* Card 2: Semicircle Speedometer Gauge matching Reference Market Sentiment (68% Arc) */}
        <div className="bg-[#0c1126] p-4.5 rounded-2xl border border-[#192344] flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Resource Saturation Gauge</span>
            <Gauge className="w-4 h-4 text-purple-400" />
          </div>

          <div className="flex flex-col items-center justify-center my-2">
            {/* Semicircular Speedometer Arc */}
            <div className="relative w-36 h-20 overflow-hidden flex items-end justify-center">
              <svg className="w-36 h-36 absolute -top-1" viewBox="0 0 100 100">
                <path
                  d="M 15 50 A 35 35 0 0 1 85 50"
                  fill="none"
                  stroke="#16213e"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 15 50 A 35 35 0 0 1 85 50"
                  fill="none"
                  stroke="url(#sentimentGradient)"
                  strokeWidth="8"
                  strokeDasharray="110"
                  strokeDashoffset={110 - (110 * overallUtilization) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center z-10 pb-0.5">
                <span className="text-lg font-bold text-white block leading-none">
                  {overallUtilization}%
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  STABLE POOL
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#141d38]">
            <span>Low Risk</span>
            <span className="text-indigo-400 font-semibold">Balanced Load</span>
            <span>High Risk</span>
          </div>
        </div>

        {/* Card 3: Process Demand Breakdown matching Reference Breakdown List */}
        <div className="bg-[#0c1126] p-4.5 rounded-2xl border border-[#192344] flex flex-col justify-between shadow-sm md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between pb-2 border-b border-[#141d38]">
            <span className="text-xs font-semibold text-slate-400">Process Demand Breakdown</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-2 py-2 max-h-36 overflow-y-auto pr-1">
            {processClaims.map((p) => (
              <div key={p.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white font-mono">{p.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Alloc: <strong className="text-emerald-400">{p.totalAlloc}</strong> / Max: <strong className="text-amber-400">{p.totalMax}</strong>
                  </span>
                </div>
                <div className="w-full bg-[#16213e] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
