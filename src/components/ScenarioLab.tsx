import React from 'react';
import { FlaskConical, CheckCircle2, AlertTriangle, Sliders } from 'lucide-react';

interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  isSafe: boolean;
  numProcesses: number;
  numResources: number;
  available: number[];
  allocation: number[][];
  maxMatrix: number[][];
}

const PRESETS: ScenarioPreset[] = [
  {
    id: 'safe',
    name: 'Safe Scenario',
    description: 'Standard textbook benchmark with 5 processes & 3 resources. Guarantees safe sequence.',
    isSafe: true,
    numProcesses: 5,
    numResources: 3,
    available: [3, 3, 2],
    allocation: [
      [0, 1, 0], // P1
      [2, 0, 0], // P2
      [3, 0, 2], // P3
      [2, 1, 1], // P4
      [0, 0, 2], // P5
    ],
    maxMatrix: [
      [7, 5, 3], // P1
      [3, 2, 2], // P2
      [9, 0, 2], // P3
      [4, 2, 2], // P4
      [5, 3, 3], // P5
    ],
  },
  {
    id: 'unsafe',
    name: 'Unsafe Scenario',
    description: 'Resources over-allocated with Available [0, 2, 0]. No process can satisfy Need ≤ Work.',
    isSafe: false,
    numProcesses: 5,
    numResources: 3,
    available: [0, 2, 0],
    allocation: [
      [0, 1, 0], // P1
      [3, 0, 2], // P2
      [3, 0, 2], // P3
      [2, 1, 1], // P4
      [0, 0, 2], // P5
    ],
    maxMatrix: [
      [7, 5, 3], // P1
      [3, 2, 2], // P2
      [9, 0, 2], // P3
      [4, 2, 2], // P4
      [5, 3, 3], // P5
    ],
  },
];

interface ScenarioLabProps {
  onLoadScenario: (preset: ScenarioPreset) => void;
  onCustomSimulation: () => void;
}

export const ScenarioLab: React.FC<ScenarioLabProps> = ({
  onLoadScenario,
  onCustomSimulation,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-xs uppercase tracking-wider">
          <FlaskConical className="w-4 h-4 text-purple-400" />
          <span>SCENARIO LAB (PRESETS)</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Load demonstration environments directly into editable state
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESETS.map((preset) => (
          <div
            key={preset.id}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">
                  {preset.name}
                </span>
                {preset.isSafe ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> SAFE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3" /> UNSAFE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                {preset.description}
              </p>
              <div className="text-[10px] font-mono text-slate-500 space-y-0.5 mb-3">
                <div>Processes: {preset.numProcesses} | Resources: {preset.numResources}</div>
                <div>Available: [{preset.available.join(', ')}]</div>
              </div>
            </div>

            <button
              onClick={() => onLoadScenario(preset)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                preset.isSafe
                  ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                  : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10'
              }`}
            >
              Load {preset.name}
            </button>
          </div>
        ))}

        {/* Custom Simulation Reset */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-white">Custom Simulation</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                <Sliders className="w-3 h-3" /> CUSTOM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Clear or initialize custom process and resource counts with manual matrix values.
            </p>
          </div>

          <button
            onClick={onCustomSimulation}
            className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            Custom Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
