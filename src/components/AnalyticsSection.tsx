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
    <div className="glass-panel-primary rounded-2xl p-5 space-y-4 hover:border-cyan-500/35 transition-all holo-shimmer">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="font-sans">Holographic Telemetry & Resource Analytics</span>
        </div>
        <span className="text-xs font-mono text-cyan-300 bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-500/25 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
          Real-Time Kernel Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Circular Progress Gauge */}
        <div className="glass-panel-secondary p-4.5 rounded-2xl border border-cyan-500/20 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-300">SYSTEM UTILIZATION</span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.25)]">
              OPTIMAL
            </span>
          </div>

          <div className="flex items-center justify-around my-3">
            {/* SVG Circular Progress Ring with Cyan Glow */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(34, 211, 238, 0.12)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * overallUtilization) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold font-mono text-white tracking-tight">
                  {overallUtilization}%
                </span>
                <span className="text-[9px] text-cyan-400 font-mono uppercase font-semibold">Active</span>
              </div>
            </div>

            <div className="space-y-1 font-mono text-xs text-slate-400">
              <div>
                Allocated: <strong className="text-cyan-200">{totalAllocUnits}</strong>
              </div>
              <div>
                Capacity: <strong className="text-slate-200">{totalSystemUnits}</strong>
              </div>
              <div>
                Available: <strong className="text-emerald-400">{Math.max(0, totalSystemUnits - totalAllocUnits)}</strong>
              </div>
            </div>
          </div>

          <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden mt-1 border border-cyan-500/15">
            <div
              className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
              style={{ width: `${overallUtilization}%` }}
            />
          </div>
        </div>

        {/* Card 2: Semicircle Speedometer Gauge */}
        <div className="glass-panel-secondary p-4.5 rounded-2xl border border-cyan-500/20 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-300">SATURATION GAUGE</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex flex-col items-center justify-center my-2">
            <div className="relative w-36 h-20 overflow-hidden flex items-end justify-center">
              <svg className="w-36 h-36 absolute -top-1" viewBox="0 0 100 100">
                <path
                  d="M 15 50 A 35 35 0 0 1 85 50"
                  fill="none"
                  stroke="rgba(34, 211, 238, 0.12)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 15 50 A 35 35 0 0 1 85 50"
                  fill="none"
                  stroke="url(#holoGaugeGradient)"
                  strokeWidth="8"
                  strokeDasharray="110"
                  strokeDashoffset={110 - (110 * overallUtilization) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="holoGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="60%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center z-10 pb-0.5 font-mono">
                <span className="text-lg font-bold text-white block leading-none">
                  {overallUtilization}%
                </span>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  BALANCED LOAD
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-cyan-500/15">
            <span>Low Risk</span>
            <span className="text-cyan-300 font-semibold">Stable Allocation</span>
            <span>High Risk</span>
          </div>
        </div>

        {/* Card 3: Process Demand Breakdown */}
        <div className="glass-panel-secondary p-4.5 rounded-2xl border border-cyan-500/20 flex flex-col justify-between shadow-sm md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
            <span className="text-xs font-mono font-semibold text-slate-300">PROCESS DEMAND BREAKDOWN</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-2 py-2 max-h-36 overflow-y-auto pr-1">
            {processClaims.map((p) => (
              <div key={p.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-white">{p.name}</span>
                  <span className="text-slate-400 text-[11px]">
                    Alloc: <strong className="text-emerald-400">{p.totalAlloc}</strong> / Max: <strong className="text-cyan-300">{p.totalMax}</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-cyan-500/15">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 h-full rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(6,182,212,0.4)]"
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
