import React from 'react';
import { HardDrive, AlertCircle } from 'lucide-react';

interface ResourcePanelProps {
  numResources: number;
  totalInstances: number[];
  allocation: number[][];
  deadlockedResources?: string[];
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({
  numResources,
  totalInstances,
  allocation,
  deadlockedResources = [],
}) => {
  const resourceStats = Array.from({ length: numResources }).map((_, rIdx) => {
    const allocated = allocation.reduce((sum, row) => sum + (row[rIdx] || 0), 0);
    const total = totalInstances[rIdx] || 0;
    const available = total - allocated;
    const isOverallocated = available < 0;
    const isDeadlocked = deadlockedResources.includes(`R${rIdx + 1}`);

    return {
      name: `R${rIdx + 1}`,
      total,
      allocated,
      available,
      isOverallocated,
      isDeadlocked,
    };
  });

  const hasOverallocation = resourceStats.some((r) => r.isOverallocated);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3.5">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <span>Available Resources</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Available = Total - Allocated
        </span>
      </div>

      {hasOverallocation && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/60 px-3 py-1.5 rounded-lg border border-rose-500/40">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Over-allocation error: Current allocations exceed total instances!</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {resourceStats.map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-3 border transition-all ${
              stat.isOverallocated
                ? 'bg-rose-950/40 border-rose-500/50'
                : stat.isDeadlocked
                ? 'bg-red-950/40 border-red-500/50 shadow-sm shadow-red-500/10'
                : 'bg-slate-950/90 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold text-cyan-300">{stat.name}:</span>
              <span
                className={`text-sm font-mono font-bold ${
                  stat.isOverallocated
                    ? 'text-rose-400'
                    : stat.available === 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {stat.available}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-1">
              <span>Alloc: {stat.allocated}</span>
              <span>Tot: {stat.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
