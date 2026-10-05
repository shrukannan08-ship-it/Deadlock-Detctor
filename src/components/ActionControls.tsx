import React from 'react';
import { ShieldCheck, ShieldAlert, RotateCcw, Activity, Search, Database, Layers } from 'lucide-react';

interface ActionControlsProps {
  onCheckSafeState: () => void;
  onDetectDeadlock: () => void;
  onReset: () => void;
  isInvalid: boolean;
  isLoading?: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  onCheckSafeState,
  onDetectDeadlock,
  onReset,
  isInvalid,
  isLoading = false,
}) => {
  return (
    <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-5 space-y-4 shadow-sm hover:border-[#202e58] transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-[#141d38]">
        <div className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <span>Algorithm Execution Controls</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onCheckSafeState}
            disabled={isInvalid || isLoading}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isInvalid || isLoading
                ? 'bg-[#10152b] text-slate-500 cursor-not-allowed border border-[#1a2342]'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>{isLoading ? 'Evaluating...' : 'Check Safe State'}</span>
          </button>

          <button
            onClick={onDetectDeadlock}
            disabled={isInvalid || isLoading}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isInvalid || isLoading
                ? 'bg-[#10152b] text-slate-500 cursor-not-allowed border border-[#1a2342]'
                : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-950/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-200" />
            <span>Detect Deadlock</span>
          </button>
        </div>

        {/* 4 Mini Action Cards matching Reference Center Cards: Analyze, Signals, Portfolio, News */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={onCheckSafeState}
            className="p-2.5 rounded-xl bg-[#0d1229] border border-blue-900/30 hover:border-blue-500/50 flex flex-col items-start gap-1 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] text-blue-400 group-hover:translate-x-0.5 transition-transform">+</span>
            </div>
            <span className="text-xs font-bold text-white">Analyze</span>
            <span className="text-[10px] text-slate-400">Safety Check</span>
          </button>

          <button
            onClick={onDetectDeadlock}
            className="p-2.5 rounded-xl bg-[#0d1229] border border-purple-900/30 hover:border-purple-500/50 flex flex-col items-start gap-1 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] text-purple-400 group-hover:translate-x-0.5 transition-transform">+</span>
            </div>
            <span className="text-xs font-bold text-white">Signals</span>
            <span className="text-[10px] text-slate-400">Detect Cycle</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('matrices');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-2.5 rounded-xl bg-[#0d1229] border border-emerald-900/30 hover:border-emerald-500/50 flex flex-col items-start gap-1 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 group-hover:translate-x-0.5 transition-transform">+</span>
            </div>
            <span className="text-xs font-bold text-white">Matrices</span>
            <span className="text-[10px] text-slate-400">Allocation</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('resources');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-2.5 rounded-xl bg-[#0d1229] border border-amber-900/30 hover:border-amber-500/50 flex flex-col items-start gap-1 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-amber-400 group-hover:translate-x-0.5 transition-transform">+</span>
            </div>
            <span className="text-xs font-bold text-white">Resources</span>
            <span className="text-[10px] text-slate-400">Pool Monitor</span>
          </button>
        </div>

        <button
          onClick={onReset}
          className="w-full py-2 px-3 bg-[#0d1228] hover:bg-[#141b38] text-slate-300 text-xs font-medium rounded-xl flex items-center justify-center gap-2 border border-[#1e2a4f] transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset All Simulator States</span>
        </button>
      </div>

      {isInvalid && (
        <p className="text-xs text-rose-400 text-center font-mono bg-rose-950/40 p-2 rounded-xl border border-rose-800/40">
          Validation Error: Max Demand must be ≥ Allocation for every cell.
        </p>
      )}
    </div>
  );
};
