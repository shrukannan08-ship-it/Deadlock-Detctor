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
  Cpu,
  Sparkles,
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
    <div className="glass-panel-primary rounded-2xl p-5 space-y-4 hover:border-cyan-500/35 transition-all holo-shimmer">
      {/* Header & Controls matching Futuristic HUD Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyan-500/15 gap-3">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-sans">Real-Time Banker & Deadlock Simulation Player</span>
        </div>

        {/* Playback Button Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Step Back */}
          <button
            onClick={onPrev}
            disabled={currentStepIndex <= 0 || totalSteps === 0}
            className={`p-2 rounded-xl text-xs font-medium transition-colors border cursor-pointer ${
              currentStepIndex <= 0 || totalSteps === 0
                ? 'bg-slate-950/40 text-slate-600 border-slate-800/40 cursor-not-allowed'
                : 'bg-slate-950/60 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-200 border-cyan-500/20 hover:border-cyan-400/40'
            }`}
            title="Step Back"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={totalSteps === 0 && !isPlaying}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              isPlaying
                ? 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-950/70 hover:bg-cyan-950/40 text-slate-200 hover:text-cyan-200 border-cyan-500/25 hover:border-cyan-400/50'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current text-cyan-400" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
                <span>RUN SIM</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={onNext}
            disabled={currentStepIndex >= totalSteps - 1 || totalSteps === 0}
            className={`p-2 rounded-xl text-xs font-medium transition-colors border cursor-pointer ${
              currentStepIndex >= totalSteps - 1 || totalSteps === 0
                ? 'bg-slate-950/40 text-slate-600 border-slate-800/40 cursor-not-allowed'
                : 'bg-slate-950/60 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-200 border-cyan-500/20 hover:border-cyan-400/40'
            }`}
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Reset Stepper */}
          <button
            onClick={onReset}
            className="p-2 rounded-xl text-xs font-medium bg-slate-950/60 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-200 transition-colors border border-cyan-500/20 hover:border-cyan-400/40 cursor-pointer"
            title="Reset Player to Step 0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-950/70 border border-cyan-500/20 rounded-xl p-0.5">
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => onSpeedChange(spd)}
                className={`px-2 py-1 text-[10px] font-mono font-medium rounded-lg transition-colors cursor-pointer ${
                  playSpeed === spd
                    ? 'bg-cyan-500/25 text-cyan-300 font-bold border border-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Process Lifecycle Pills Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Process Lifecycle Matrix
          </span>
          <span className="text-[11px] text-cyan-400/80">
            Step {totalSteps > 0 ? currentStepIndex + 1 : 0} of {totalSteps}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {processes.map((pName) => {
            const state = processStates[pName] || 'waiting';
            const isMatch = normalizedQuery && pName.toLowerCase().includes(normalizedQuery);

            let pillStyle =
              'bg-slate-950/60 text-slate-400 border-slate-800/80';
            if (state === 'active') {
              pillStyle =
                'bg-cyan-950/70 text-cyan-300 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.35)] animate-pulse';
            } else if (state === 'completed') {
              pillStyle =
                'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]';
            }

            return (
              <button
                key={pName}
                onClick={() => onSelectProcess?.(pName)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${pillStyle} ${
                  isMatch ? 'ring-2 ring-cyan-400' : ''
                }`}
                title={`Inspect Process ${pName} (${state})`}
              >
                <span>{pName}</span>
                {state === 'completed' && <Check className="w-3 h-3 text-emerald-400" />}
                {state === 'active' && <Clock className="w-3 h-3 text-cyan-400 animate-spin" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Telemetry Banner */}
      {currentStep ? (
        <div className="p-4 rounded-xl glass-panel-secondary border border-cyan-500/25 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              STEP #{currentStep.stepNumber}: EVALUATING PROCESS {currentStep.process}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                currentStep.canExecute
                  ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                  : 'bg-rose-950/70 text-rose-400 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
              }`}
            >
              {currentStep.canExecute ? 'CAN EXECUTE (Need ≤ Work)' : 'CANNOT EXECUTE (Need > Work)'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            {currentStep.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-500/15">
              <span className="text-slate-500 block text-[10px]">WORK BEFORE</span>
              <span className="text-cyan-200">[{currentStep.workBefore.join(', ')}]</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-500/15">
              <span className="text-slate-500 block text-[10px]">PROCESS NEED</span>
              <span className="text-cyan-200">[{currentStep.need.join(', ')}]</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-500/15">
              <span className="text-slate-500 block text-[10px]">ALLOC RELEASED</span>
              <span className="text-emerald-300">
                {currentStep.canExecute ? `+ [${currentStep.allocation.join(', ')}]` : 'None'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-500/15">
              <span className="text-slate-500 block text-[10px]">WORK AFTER</span>
              <span className="text-cyan-200">[{currentStep.workAfter.join(', ')}]</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-cyan-500/20 text-center text-xs font-mono text-slate-400">
          Press "Run Sim" or "Check Safe State" to trace algorithm execution step-by-step.
        </div>
      )}
    </div>
  );
};
