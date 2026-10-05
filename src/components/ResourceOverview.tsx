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

  // Resource color schemes matching Reference Market Overview asset colors
  const resThemes = [
    { name: 'Primary Vector', stroke: '#f59e0b', bgPill: 'bg-amber-950/70 text-amber-400 border-amber-700/60' },
    { name: 'Memory Pool', stroke: '#06b6d4', bgPill: 'bg-cyan-950/70 text-cyan-400 border-cyan-700/60' },
    { name: 'I/O Channels', stroke: '#a855f7', bgPill: 'bg-purple-950/70 text-purple-400 border-purple-700/60' },
    { name: 'Storage Disks', stroke: '#10b981', bgPill: 'bg-emerald-950/70 text-emerald-400 border-emerald-700/60' },
    { name: 'CPU Sockets', stroke: '#3b82f6', bgPill: 'bg-blue-950/70 text-blue-400 border-blue-700/60' },
    { name: 'Network Ports', stroke: '#ec4899', bgPill: 'bg-pink-950/70 text-pink-400 border-pink-700/60' },
  ];

  return (
    <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-5 space-y-4 shadow-sm hover:border-[#202e58] transition-all">
      {/* Header matching Reference Market Overview toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#141d38] gap-2.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Server className="w-4 h-4" />
          </div>
          <span>Available Resources & Pool Overview</span>
        </div>
        <div className="text-xs text-slate-400">
          <span className="px-3 py-1 rounded-full bg-[#0d1228] border border-[#1d294d] font-mono">
            Available = Total Instances − Allocated Sum
          </span>
        </div>
      </div>

      {/* Row of Asset-Style Resource Cards matching Reference */}
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
              className={`bg-[#0c1126] border rounded-2xl p-3.5 flex flex-col justify-between shadow-sm transition-all hover:border-[#283664] ${
                isMatched
                  ? 'border-indigo-500 ring-2 ring-indigo-500/60 bg-[#0f1633]'
                  : 'border-[#192344]'
              }`}
            >
              {/* Asset Header: Icon + Name */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                    style={{ backgroundColor: theme.stroke }}
                  >
                    R{rIdx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-none">
                      Resource {rIdx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {theme.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Instances Input */}
              <div className="my-2 bg-[#080c1c] p-2 rounded-xl border border-[#182346]">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
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
                    className="w-12 h-6 text-center text-xs font-bold font-mono bg-[#0e142c] border border-[#202c52] rounded-md text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#141c38]">
                  <span className="text-slate-400">Available:</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">
                    {availVal}
                  </span>
                </div>
              </div>

              {/* Bottom Sparkline & Allocated breakdown matching Reference */}
              <div className="mt-1 pt-1.5 border-t border-[#121935] flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.bgPill}`}>
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
