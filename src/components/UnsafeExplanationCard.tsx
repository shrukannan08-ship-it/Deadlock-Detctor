import React from 'react';
import { AlertTriangle, XCircle, Info } from 'lucide-react';
import type { UnsafeReasoning } from '../types/deadlock';

interface UnsafeExplanationCardProps {
  reasoning?: UnsafeReasoning;
}

export const UnsafeExplanationCard: React.FC<UnsafeExplanationCardProps> = ({ reasoning }) => {
  if (!reasoning) return null;

  return (
    <div className="bg-[#0a0e22] border border-rose-500/40 rounded-2xl p-5 space-y-4 shadow-sm hover:border-rose-500/60 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#141d38] gap-2">
        <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span>Unsafe State Explanation</span>
        </div>
        <span className="text-xs text-rose-300 bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-800/60 font-semibold">
          Deadlock Vulnerability
        </span>
      </div>

      {/* Current Work at Halt */}
      <div className="bg-[#0c1126] p-3.5 rounded-xl border border-[#182346] flex items-center justify-between">
        <div className="text-xs text-slate-300">
          <span className="text-slate-400 uppercase font-bold text-[10px] block mb-0.5">
            Available Work Pool at Algorithm Halt:
          </span>
          <span className="text-white font-bold text-sm font-mono">
            [{reasoning.finalWorkAtHalt.join(', ')}]
          </span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Insufficient instances</span>
        </div>
      </div>

      {/* Process Comparisons */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Blocked Processes (Need &gt; Work):
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {reasoning.failedComparisons.map((fc) => (
            <div
              key={fc.process}
              className="bg-[#0c1126] p-3 rounded-xl border border-[#182346] text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white bg-[#101734] px-2 py-0.5 rounded-md border border-[#1d294d] font-mono">
                  {fc.process}
                </span>
                <span className="text-rose-400 font-semibold flex items-center gap-1 text-xs">
                  <XCircle className="w-3.5 h-3.5" /> Blocked
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-300 pt-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Need:</span>
                  <span className="text-cyan-400 font-bold">[{fc.need.join(', ')}]</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Work:</span>
                  <span className="text-slate-300">[{fc.work.join(', ')}]</span>
                </div>
              </div>

              {fc.failedResources.length > 0 && (
                <div className="text-[11px] text-rose-300/90 pt-1.5 border-t border-[#141c38]">
                  Deficit on: {fc.failedResources.map((r) => `R${r + 1}`).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final Conclusion */}
      <div className="p-3.5 bg-rose-950/40 rounded-xl border border-rose-800/50 text-rose-300 text-xs flex items-start gap-3 leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">No remaining process satisfies: Need ≤ Work</div>
          <div className="text-xs text-rose-300/80 mt-1">
            Therefore a safe execution order cannot be completed. Granting requests in this state leaves the system exposed to circular wait.
          </div>
        </div>
      </div>
    </div>
  );
};
