import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Cpu,
} from 'lucide-react';

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
    <div className="glass-panel-primary rounded-2xl p-5 space-y-4 hover:border-cyan-500/35 transition-all holo-shimmer">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
        <div className="text-white font-bold text-sm tracking-wide flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="font-sans">Kernel Algorithm Triggers</span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/80 px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/25">
          DUAL EVALUATION PIPELINE
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Primary Dual Execution Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Banker's Safety Trigger */}
          <button
            onClick={onCheckSafeState}
            disabled={isInvalid || isLoading}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden group ${
              isInvalid || isLoading
                ? 'bg-slate-900/60 text-slate-500 cursor-not-allowed border border-slate-800'
                : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400/70 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 transition-transform group-hover:scale-110" />
            <span>{isLoading ? 'ANALYZING...' : 'CHECK SAFE STATE'}</span>
          </button>

          {/* Deadlock Detection Trigger */}
          <button
            onClick={onDetectDeadlock}
            disabled={isInvalid || isLoading}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden group ${
              isInvalid || isLoading
                ? 'bg-slate-900/60 text-slate-500 cursor-not-allowed border border-slate-800'
                : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 hover:border-rose-400/70 shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:shadow-[0_0_20px_rgba(244,63,94,0.35)]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 transition-transform group-hover:scale-110" />
            <span>DETECT DEADLOCK</span>
          </button>
        </div>

        {/* 4 Technical Quick Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
          <div className="p-2 rounded-xl bg-slate-950/50 border border-cyan-500/15 text-center">
            <div className="text-[10px] text-slate-400">ENGINE</div>
            <div className="text-xs font-bold text-cyan-300 mt-0.5">BANKER v2</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/50 border border-cyan-500/15 text-center">
            <div className="text-[10px] text-slate-400">DETECTION</div>
            <div className="text-xs font-bold text-cyan-300 mt-0.5">SILBERSCHATZ</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/50 border border-cyan-500/15 text-center">
            <div className="text-[10px] text-slate-400">GRAPH</div>
            <div className="text-xs font-bold text-cyan-300 mt-0.5">RAG SVG</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/50 border border-cyan-500/15 text-center">
            <div className="text-[10px] text-slate-400">LATENCY</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">&lt; 1 ms</div>
          </div>
        </div>

        {/* Reset System State */}
        <button
          onClick={onReset}
          className="w-full py-2 px-3 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-cyan-300 bg-slate-950/40 hover:bg-cyan-950/30 border border-cyan-500/15 hover:border-cyan-500/35 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500 hover:text-cyan-400" />
          <span>Reset All Simulator States</span>
        </button>
      </div>
    </div>
  );
};
