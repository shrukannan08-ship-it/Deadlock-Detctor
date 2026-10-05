import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Activity,
  Clock,
  Check,
} from 'lucide-react';
import type { BankerStep, ProcessState } from '../types/deadlock';

interface SimulationPlayerProps {
  isPlaying: boolean;
  currentStepIndex: number;
  totalSteps: number;
  currentStep: BankerStep | null;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  playSpeed: number;
  onSpeedChange: (speed: number) => void;
  processes: string[];
  processStates: Record<string, ProcessState>;
  onSelectProcess?: (processName: string) => void;
  searchQuery?: string;
}

export const SimulationPlayer: React.FC<SimulationPlayerProps> = ({
  isPlaying,
  currentStepIndex,
  totalSteps,
  currentStep,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  playSpeed,
  onSpeedChange,
  processes,
  processStates,
  onSelectProcess,
  searchQuery = '',
}) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return (
    <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-5 space-y-4 shadow-sm hover:border-[#202e58] transition-all">
      {/* Header & Controls matching Reference Terminal chart toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#141d38] gap-3">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <span>Real-Time Algorithm Simulator</span>
        </div>

        {/* Playback & Speed Controls matching reference timeframe toggles (1H 4H 1D 1W 1M) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Speed Pills */}
          <div className="flex items-center bg-[#0d1228] p-1 rounded-xl border border-[#1d294d] gap-1">
            <button
              onClick={() => onSpeedChange(0.5)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                playSpeed === 0.5
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              0.5x
            </button>
            <button
              onClick={() => onSpeedChange(1)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                playSpeed === 1
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1.0x
            </button>
            <button
              onClick={() => onSpeedChange(2)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                playSpeed === 2
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2.0x
            </button>
          </div>

          {/* Stepper buttons & Run Gradient button */}
          <div className="flex items-center bg-[#0d1228] p-1 rounded-xl border border-[#1d294d] gap-1">
            <button
              onClick={onPrev}
              disabled={currentStepIndex === 0 || totalSteps === 0 || isPlaying}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#162044] transition-all cursor-pointer"
              title="Step Back"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={isPlaying ? onPause : onPlay}
              disabled={totalSteps === 0}
              className={`py-1.5 px-4 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-950/60'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{currentStepIndex > 0 ? 'Resume' : 'Run'}</span>
                </>
              )}
            </button>

            <button
              onClick={onNext}
              disabled={currentStepIndex >= totalSteps - 1 || totalSteps === 0 || isPlaying}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#162044] transition-all cursor-pointer"
              title="Step Forward"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#162044] transition-all cursor-pointer"
              title="Reset Animation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time active calculation step banner */}
      {currentStep ? (
        <div className="p-4 rounded-xl bg-[#0c1126] border border-[#1e2a50] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 font-mono text-xs border border-indigo-700/60 font-semibold">
                Step {currentStep.stepNumber} of {totalSteps}
              </span>
              <span className="text-sm font-bold text-white tracking-wide">
                Evaluating Process: {currentStep.process}
              </span>
            </div>

            {currentStep.canExecute ? (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-700/60">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>CAN EXECUTE (Need ≤ Work)</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 bg-amber-950/70 px-3 py-1 rounded-full border border-amber-700/60">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>CANNOT EXECUTE (Need &gt; Work)</span>
              </span>
            )}
          </div>

          {/* 3-column stats box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#080c1c] p-3 rounded-xl border border-[#182346]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                Process Need Vector:
              </span>
              <span className="text-cyan-400 font-bold text-sm font-mono">
                [{currentStep.need.join(', ')}]
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                Available Work Pool:
              </span>
              <span className="text-white font-bold text-sm font-mono">
                [{currentStep.workBefore.join(', ')}]
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                Evaluation Result:
              </span>
              <span className={`font-bold text-sm ${currentStep.canExecute ? 'text-emerald-400' : 'text-slate-400'}`}>
                {currentStep.canExecute ? 'Feasible • Releasing Alloc' : 'Waiting for Resources'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#0c1126] border border-[#1e2a50] text-center text-xs text-slate-400">
          Click "Run" or "Step Forward" to trace algorithm execution step-by-step.
        </div>
      )}

      {/* Process Lifecycle Monitor */}
      <div className="pt-2 border-t border-[#141d38]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-slate-300">
            Process Lifecycle Monitor
          </div>
          <span className="text-[11px] text-slate-400">Click process pill to inspect details</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {processes.map((proc) => {
            const state = processStates[proc] || 'waiting';
            const isMatched =
              normalizedQuery &&
              (normalizedQuery === proc.toLowerCase() ||
                normalizedQuery === proc.replace('P', ''));

            return (
              <button
                key={proc}
                onClick={() => onSelectProcess?.(proc)}
                className={`p-2 rounded-xl border text-xs font-mono flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                  state === 'active'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 font-bold shadow-blue-900/50'
                    : state === 'completed'
                    ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 font-semibold'
                    : isMatched
                    ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-950 text-white'
                    : 'bg-[#0d1228] border-[#1d294d] text-slate-400 hover:text-white hover:border-[#2a3a6d]'
                }`}
              >
                <span className="font-bold">{proc}</span>
                <span className="text-[10px] uppercase">
                  {state === 'completed' ? 'Done ✓' : state === 'active' ? 'Active' : 'Wait'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
