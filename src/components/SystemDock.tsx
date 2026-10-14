import React from 'react';
import {
  LayoutDashboard,
  Sliders,
  Activity,
  Table,
  Layers,
  BarChart3,
  Send,
  Zap,
  Terminal as TerminalIcon,
  HelpCircle,
} from 'lucide-react';
import type { NavSection } from './Sidebar';
import type { SimulationStatus } from '../types/deadlock';

interface SystemDockProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  status: SimulationStatus;
  onOpenTerminal?: () => void;
  onOpenQuickHelp?: () => void;
  onCheckSafeState: () => void;
  onDetectDeadlock: () => void;
}

export const SystemDock: React.FC<SystemDockProps> = ({
  activeSection,
  onSelectSection,
  status,
  onOpenTerminal,
  onOpenQuickHelp,
  onCheckSafeState,
  onDetectDeadlock,
}) => {
  const dockItems: Array<{
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hotkey: string;
  }> = [
    { id: 'overview', label: 'System Overview', icon: LayoutDashboard, hotkey: '1' },
    { id: 'simulation', label: 'Matrices Setup', icon: Sliders, hotkey: '2' },
    { id: 'trace', label: 'Real-Time Stepper', icon: Activity, hotkey: '3' },
    { id: 'matrices', label: 'Data Workspace', icon: Table, hotkey: '4' },
    { id: 'resources', label: 'Resource Vectors', icon: Layers, hotkey: '5' },
    { id: 'analytics', label: 'RAG Graph & Analytics', icon: BarChart3, hotkey: '6' },
    { id: 'request', label: 'Resource Prevention', icon: Send, hotkey: '7' },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 hidden sm:flex items-center gap-1.5 p-2 rounded-2xl glass-panel-hud border border-cyan-500/25 shadow-2xl transition-all duration-300 hover:border-cyan-400/40">
      {/* Brand Hologram Pill */}
      <div className="flex items-center gap-2 pl-2 pr-3 py-1 mr-1 border-r border-cyan-500/15">
        <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <Zap className="w-3.5 h-3.5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold tracking-widest text-white uppercase font-mono leading-none">
            AETHER
          </span>
          <span className="text-[8px] text-cyan-400 font-mono tracking-tight">OS v3.2</span>
        </div>
      </div>

      {/* Primary Navigation Windows */}
      <div className="flex items-center gap-1">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`group relative p-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.35)] scale-105'
                  : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-800/40 border border-transparent hover:border-cyan-500/20'
              }`}
              title={`${item.label} (${item.hotkey})`}
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />

              {/* Active Underdot Glow */}
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              )}

              {/* Holographic Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none px-2.5 py-1 rounded-md bg-[#020612]/95 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-lg">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Action Splitter */}
      <div className="h-5 w-[1px] bg-cyan-500/15 mx-1" />

      {/* Direct Algorithm Triggers from OS Dock */}
      <div className="flex items-center gap-1">
        <button
          onClick={onCheckSafeState}
          className="p-2 rounded-xl text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-400/60 transition-all cursor-pointer group relative"
          title="Direct Banker Safety Evaluation"
        >
          <div className="w-4 h-4 flex items-center justify-center font-mono font-bold text-[10px]">
            §B
          </div>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none px-2.5 py-1 rounded-md bg-[#020612]/95 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 whitespace-nowrap shadow-lg">
            Banker Safety Check
          </div>
        </button>

        <button
          onClick={onDetectDeadlock}
          className="p-2 rounded-xl text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 hover:border-rose-400/60 transition-all cursor-pointer group relative"
          title="Direct Deadlock Detection Algorithm"
        >
          <div className="w-4 h-4 flex items-center justify-center font-mono font-bold text-[10px]">
            !D
          </div>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none px-2.5 py-1 rounded-md bg-[#020612]/95 border border-rose-500/30 text-[10px] font-mono text-rose-300 whitespace-nowrap shadow-lg">
            Deadlock Verification
          </div>
        </button>

        {onOpenTerminal && (
          <button
            onClick={onOpenTerminal}
            className="p-2 rounded-xl text-cyan-400 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer group relative"
            title="Open Holographic CLI / Status Log"
          >
            <TerminalIcon className="w-4 h-4" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none px-2.5 py-1 rounded-md bg-[#020612]/95 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-lg">
              System Console (~/bin)
            </div>
          </button>
        )}

        {onOpenQuickHelp && (
          <button
            onClick={onOpenQuickHelp}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800/40 border border-transparent hover:border-cyan-500/20 transition-all cursor-pointer group relative"
            title="Architecture & Hotkeys"
          >
            <HelpCircle className="w-4 h-4" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none px-2.5 py-1 rounded-md bg-[#020612]/95 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-lg">
              Spatial Hotkeys & Info
            </div>
          </button>
        )}
      </div>

      {/* System State Micro-Beacon */}
      <div className="flex items-center pl-2 pr-1 border-l border-cyan-500/15">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            status === 'safe'
              ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
              : status === 'deadlocked' || status === 'unsafe'
              ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
              : status === 'running'
              ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse'
              : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
          }`}
          title={`Kernel Status: ${status}`}
        />
      </div>
    </div>
  );
};
