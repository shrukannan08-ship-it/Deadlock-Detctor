import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  X,
  Menu,
  Terminal as TerminalIcon,
  Clock,
  HelpCircle,
} from 'lucide-react';
import type { SimulationStatus } from '../types/deadlock';

interface HeaderProps {
  status?: SimulationStatus;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
  onOpenTerminal?: () => void;
  onOpenQuickHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status = 'ready',
  onReset,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  onOpenTerminal,
  onOpenQuickHelp,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (status) {
      case 'safe':
        return {
          label: 'KERNEL SAFE',
          pillClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
          dotClass: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
        };
      case 'deadlocked':
        return {
          label: 'DEADLOCK CYCLE',
          pillClass: 'bg-rose-950/60 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
          dotClass: 'bg-rose-400 shadow-[0_0_8px_#fb7185] animate-ping',
        };
      case 'unsafe':
        return {
          label: 'POTENTIAL UNSAFE',
          pillClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
          dotClass: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
        };
      case 'running':
        return {
          label: 'SIMULATING STEP',
          pillClass: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
          dotClass: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse',
        };
      default:
        return {
          label: 'SYSTEM ONLINE',
          pillClass: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30',
          dotClass: 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <header className="sticky top-0 z-30 border-b border-cyan-500/15 bg-[#030712]/75 backdrop-blur-xl px-4 sm:px-6 py-2.5 transition-all">
      {/* Top Holographic Flare */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 lg:hidden cursor-pointer transition-colors border border-transparent hover:border-cyan-500/20"
            title="Toggle OS Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar matching Futuristic HUD Terminal */}
          <div className="relative w-full group">
            <Search className="w-4 h-4 text-cyan-400/60 group-focus-within:text-cyan-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              type="text"
              placeholder="Search kernel nodes, processes (P1), resources (R1), matrices..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-950/60 border border-cyan-500/20 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition-all shadow-inner font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-200 cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Telemetry, Terminal Trigger & Reset Action */}
        <div className="flex items-center gap-3">
          {/* Status Pill */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono font-semibold tracking-wider ${statusBadge.pillClass}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusBadge.dotClass}`} />
            <span>{statusBadge.label}</span>
          </div>

          {/* Digital Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/30 border border-cyan-500/15 text-[11px] font-mono text-cyan-300/80">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{currentTime || '00:00:00'}</span>
          </div>

          {/* Holographic Terminal Button */}
          {onOpenTerminal && (
            <button
              onClick={onOpenTerminal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono rounded-xl border border-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]"
              title="Launch Kernel Terminal CLI"
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>CLI</span>
            </button>
          )}

          {/* Quick Help Modal Trigger */}
          {onOpenQuickHelp && (
            <button
              onClick={onOpenQuickHelp}
              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-cyan-500/20"
              title="OS Architecture & Hotkeys"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {/* Reset Action Button with Holographic Shimmer */}
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/60 hover:bg-cyan-950/40 text-slate-200 hover:text-cyan-200 text-xs sm:text-sm font-medium rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] font-mono"
            title="Reset Simulator to Default State"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Reset Kernel</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
