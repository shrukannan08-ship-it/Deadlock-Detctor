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
  Zap,
  ArrowRight,
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
    { id: 'overview' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'simulation' as NavSection, label: 'Simulation Setup', icon: Sliders },
    { id: 'trace' as NavSection, label: 'Real-Time Simulator', icon: Activity },
    { id: 'matrices' as NavSection, label: 'Matrices Workspace', icon: Table },
    { id: 'resources' as NavSection, label: 'Resources Monitor', icon: Layers },
    { id: 'analytics' as NavSection, label: 'Graph & Analytics', icon: BarChart3 },
    { id: 'request' as NavSection, label: 'Resource Request', icon: Send },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#04060f]/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#070a19] border-r border-[#151e3a] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header matching Reference Logo */}
        <div className="p-4 border-b border-[#141d38] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40">
              <span className="font-extrabold text-sm tracking-wider">N</span>
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider text-white flex items-center gap-1.5 font-sans">
                NEXUS OS
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-tight">
                RESOURCE TERMINAL
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white lg:hidden cursor-pointer rounded-lg hover:bg-[#121935]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items with Gradient Active State matching Reference */}
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-950/60'
                    : 'text-slate-400 hover:text-white hover:bg-[#10162e]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom NEXUS PRO / ALGORITHM ENGINE Promo Card matching Reference */}
        <div className="p-3 border-t border-[#141d38] bg-[#060814] space-y-3">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#121332] to-[#0a0d1e] border border-indigo-900/40 relative overflow-hidden shadow-md">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-purple-900/50">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-wide">
                  NEXUS PRO
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  Active Banker's engine: {numProcesses} Processes • {numResources} Resources
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectSection('simulation')}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-purple-950 hover:brightness-110 transition-all cursor-pointer"
            >
              <span>Setup Terminal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Engine Status indicator matching Reference Market Open tag */}
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                status === 'safe'
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                  : status === 'deadlocked' || status === 'unsafe'
                  ? 'bg-rose-500 shadow-sm shadow-rose-500'
                  : 'bg-emerald-400'
              }`} />
              <span>{status === 'deadlocked' ? 'Deadlock Detected' : 'Terminal Online'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
