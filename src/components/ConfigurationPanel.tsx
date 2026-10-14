import React from 'react';
import { Sliders, RefreshCw, Play } from 'lucide-react';

interface ConfigurationPanelProps {
  numProcesses: number;
  numResources: number;
  onNumProcessesChange: (val: number) => void;
  onNumResourcesChange: (val: number) => void;
  onInitialize: () => void;
  onReset: () => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  numProcesses,
  numResources,
  onNumProcessesChange,
  onNumResourcesChange,
  onInitialize,
  onReset,
}) => {
  return (
    <div className="glass-panel-primary rounded-2xl p-5 space-y-4 hover:border-cyan-500/35 transition-all holo-shimmer">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <Sliders className="w-4 h-4" />
          </div>
          <span className="font-sans">Simulation Vector Configuration</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-xl bg-slate-950/60 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-200 transition-colors border border-cyan-500/20 hover:border-cyan-400/50 cursor-pointer"
          title="Reset Setup"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          Reset Setup
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Processes Input */}
        <div>
          <label className="block text-xs font-mono font-semibold text-cyan-300/90 mb-1.5">
            PROCESSES COUNT (N)
          </label>
          <input
            type="number"
            min={1}
            max={8}
            value={numProcesses}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const raw = e.target.value;
              const parsed = parseInt(raw, 10);
              const val = isNaN(parsed) ? 1 : Math.max(1, Math.min(8, parsed));
              onNumProcessesChange(val);
            }}
            className="w-full py-2 px-3 bg-slate-950/70 border border-cyan-500/20 rounded-xl text-sm text-cyan-100 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all shadow-inner"
          />
          <span className="text-[11px] font-mono text-slate-400 mt-1 block truncate">
            Vector range: {Array.from({ length: numProcesses }, (_, i) => `P${i + 1}`).join(', ')}
          </span>
        </div>

        {/* Resources Input */}
        <div>
          <label className="block text-xs font-mono font-semibold text-cyan-300/90 mb-1.5">
            RESOURCE CLASSES (M)
          </label>
          <input
            type="number"
            min={1}
            max={6}
            value={numResources}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const raw = e.target.value;
              const parsed = parseInt(raw, 10);
              const val = isNaN(parsed) ? 1 : Math.max(1, Math.min(6, parsed));
              onNumResourcesChange(val);
            }}
            className="w-full py-2 px-3 bg-slate-950/70 border border-cyan-500/20 rounded-xl text-sm text-cyan-100 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all shadow-inner"
          />
          <span className="text-[11px] font-mono text-slate-400 mt-1 block truncate">
            Vector classes: {Array.from({ length: numResources }, (_, i) => `R${i + 1}`).join(', ')}
          </span>
        </div>
      </div>

      {/* Initialize Matrix Button */}
      <button
        onClick={onInitialize}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>INITIALIZE SIMULATION MATRICES</span>
      </button>
    </div>
  );
};
