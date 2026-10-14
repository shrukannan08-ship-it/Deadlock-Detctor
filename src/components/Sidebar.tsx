import React from 'react';
import {
  LayoutDashboard,
  Sliders,
  Activity,
  Table,
  Layers,
  BarChart3,
  Send,
  X,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import type { SimulationStatus } from '../types/deadlock';

export type NavSection =
  | 'overview'
  | 'simulation'
  | 'trace'
  | 'matrices'
  | 'resources'
  | 'analytics'
  | 'request';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  isOpen: boolean;
  onClose: () => void;
  status: SimulationStatus;
  numProcesses: number;
  numResources: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  isOpen,
  onClose,
  status,
  numProcesses,
  numResources,
}) => {
  const navItems = [
    { id: 'overview' as NavSection, label: 'Kernel Overview', icon: LayoutDashboard },
    { id: 'simulation' as NavSection, label: 'Simulation Setup', icon: Sliders },
    { id: 'trace' as NavSection, label: 'Real-Time Stepper', icon: Activity },
    { id: 'matrices' as NavSection, label: 'Matrices Workspace', icon: Table },
    { id: 'resources' as NavSection, label: 'Resources Monitor', icon: Layers },
    { id: 'analytics' as NavSection, label: 'RAG Graph & Analytics', icon: BarChart3 },
    { id: 'request' as NavSection, label: 'Resource Prevention', icon: Send },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#030712]/80 backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel-primary border-r border-cyan-500/20 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header matching Reference Holographic Logo */}
        <div className="p-4 border-b border-cyan-500/15 flex items-center justify-between bg-gradient-to-r from-cyan-950/30 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300/40">
              <span className="font-extrabold text-sm tracking-wider font-mono">Æ</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider text-white flex items-center gap-1.5 font-sans">
                AETHER OS
              </div>
              <div className="text-[10px] text-cyan-400/80 font-mono tracking-tight font-medium">
                CONCURRENCY KERNEL
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-cyan-300 lg:hidden cursor-pointer rounded-lg hover:bg-cyan-950/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items with Holographic Active State */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left font-mono group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-transparent text-cyan-200 font-semibold border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900/40 border border-transparent hover:border-cyan-500/20'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom OS Core Engine Promo & Telemetry Card */}
        <div className="p-3 border-t border-cyan-500/15 bg-slate-950/50 space-y-3">
          <div className="p-3.5 rounded-xl glass-panel-secondary border border-cyan-500/25 relative overflow-hidden shadow-md">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-wide font-mono">
                  ENGINE TELEMETRY
                </div>
                <div className="text-[10px] text-cyan-300/80 mt-0.5 leading-snug font-mono">
                  Banker & Deadlock • {numProcesses} Proc / {numResources} Res
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectSection('simulation')}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-[11px] font-mono font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.15)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <span>Reconfigure Vectors</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Engine Status indicator matching Reference */}
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-400 font-mono font-medium">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'safe'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : status === 'deadlocked' || status === 'unsafe'
                    ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                    : status === 'running'
                    ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse'
                    : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                }`}
              />
              <span className="text-cyan-300/90 truncate">
                {status === 'deadlocked'
                  ? 'Deadlock Detected'
                  : status === 'safe'
                  ? 'Safe Sequence Active'
                  : 'Kernel Online'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">v3.2</span>
          </div>
        </div>
      </aside>
    </>
  );
};
