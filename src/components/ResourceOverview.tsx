import React from 'react';
import { Server } from 'lucide-react';

interface ResourceOverviewProps {
  numResources: number;
  numProcesses: number;
  totalResources: number[];
  allocation: number[][];
  available: number[];
  onTotalChange: (resourceIndex: number, value: number) => void;
  searchQuery?: string;
}

export const ResourceOverview: React.FC<ResourceOverviewProps> = ({
  numResources,
  numProcesses,
  totalResources,
  allocation,
  available,
  onTotalChange,
  searchQuery = '',
}) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Resource color schemes with electric cyan & cool accents
  const resThemes = [
    { name: 'Core Vector', stroke: '#22d3ee', bgPill: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]' },
    { name: 'Memory Pool', stroke: '#38bdf8', bgPill: 'bg-sky-950/70 text-sky-300 border-sky-500/40 shadow-[0_0_8px_rgba(56,189,248,0.25)]' },
    { name: 'I/O Channels', stroke: '#a855f7', bgPill: 'bg-purple-950/70 text-purple-300 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.25)]' },
    { name: 'Storage Disks', stroke: '#34d399', bgPill: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(52,211,153,0.25)]' },
    { name: 'CPU Sockets', stroke: '#818cf8', bgPill: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40 shadow-[0_0_8px_rgba(129,140,248,0.25)]' },
    { name: 'Network Ports', stroke: '#f43f5e', bgPill: 'bg-rose-950/70 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.25)]' },
  ];

  return (
    <div className="glass-panel-primary rounded-2xl p-5 space-y-4 hover:border-cyan-500/35 transition-all holo-shimmer">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyan-500/15 gap-2.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <Server className="w-4 h-4" />
          </div>
          <span className="font-sans">Available Resource Pool & Capacity Monitor</span>
        </div>
        <div className="text-xs font-mono text-cyan-300">
          <span className="px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/25">
            Available = Total Instances − Allocated Sum
          </span>
        </div>
      </div>

      {/* Row of Floating Glass Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {Array.from({ length: numResources }).map((_, rIdx) => {
          let sumAlloc = 0;
          for (let p = 0; p < numProcesses; p++) {
            sumAlloc += allocation[p]?.[rIdx] ?? 0;
          }
          const totalVal = totalResources[rIdx] ?? 0;
          const availVal = available[rIdx] ?? Math.max(0, totalVal - sumAlloc);
          const percentAlloc = totalVal > 0 ? Math.min(100, Math.round((sumAlloc / totalVal) * 100)) : 0;
          const isMatched =
            normalizedQuery &&
            (normalizedQuery === `r${rIdx + 1}` || normalizedQuery === String(rIdx + 1));
          const theme = resThemes[rIdx % resThemes.length];

          return (
            <div
              key={rIdx}
              className={`glass-panel-secondary rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/50 ${
                isMatched
                  ? 'border-cyan-400 ring-2 ring-cyan-400/50 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'border-cyan-500/20'
              }`}
            >
              {/* Asset Header: Icon + Name */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center font-bold font-mono text-xs text-white shadow-[0_0_8px_rgba(0,0,0,0.5)] border border-white/20"
                    style={{ backgroundColor: theme.stroke }}
                  >
                    R{rIdx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-none font-sans">
                      Resource {rIdx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {theme.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Instances Input */}
              <div className="my-2 bg-slate-950/70 p-2 rounded-xl border border-cyan-500/15">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Capacity:</span>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={totalVal}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const parsed = raw === '' ? 0 : parseInt(raw, 10);
                      const clean = isNaN(parsed) ? 0 : Math.max(0, parsed);
                      onTotalChange(rIdx, clean);
                    }}
                    className="w-12 h-6 text-center text-xs font-bold font-mono bg-cyan-950/40 border border-cyan-500/30 rounded-md text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-cyan-500/15 font-mono">
                  <span className="text-slate-400">Available:</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                    {availVal}
                  </span>
                </div>
              </div>

              {/* Bottom Sparkline & Allocated Breakdown */}
              <div className="mt-1 pt-1.5 border-t border-cyan-500/15 flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${theme.bgPill}`}>
                  {percentAlloc}% Used
                </span>

                {/* Dynamic SVG wave sparkline */}
                <svg className="w-16 h-5 overflow-visible" viewBox="0 0 60 20" fill="none">
                  <path
                    d="M0 15 Q 15 5, 30 12 T 60 3"
                    stroke={theme.stroke}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
