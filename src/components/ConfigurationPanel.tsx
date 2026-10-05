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
    <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-5 space-y-4 shadow-sm hover:border-[#202e58] transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-[#141d38]">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <span>Simulation Configuration</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#0f152d] hover:bg-[#151e3f] text-slate-300 transition-colors border border-[#202c52] cursor-pointer"
          title="Reset Setup"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Processes Count (N)
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
            className="w-full py-2 px-3 bg-[#0d1228] border border-[#1d294d] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
          />
          <span className="text-[11px] text-slate-400 mt-1 block truncate">
            Vector range: {Array.from({ length: numProcesses }, (_, i) => `P${i + 1}`).join(', ')}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Resource Types (M)
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
            className="w-full py-2 px-3 bg-[#0d1228] border border-[#1d294d] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
          />
          <span className="text-[11px] text-slate-400 mt-1 block truncate">
            Vector classes: {Array.from({ length: numResources }, (_, i) => `R${i + 1}`).join(', ')}
          </span>
        </div>
      </div>

      <button
        onClick={onInitialize}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/60 transition-all cursor-pointer"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Initialize Simulation Matrices</span>
      </button>
    </div>
  );
};
