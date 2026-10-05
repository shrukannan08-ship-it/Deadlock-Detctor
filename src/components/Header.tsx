import React from 'react';
import { RotateCcw, Search, X, Menu } from 'lucide-react';
import type { SimulationStatus } from '../types/deadlock';

interface HeaderProps {
  status?: SimulationStatus;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#151e3a] bg-[#070a18]/95 backdrop-blur-md px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121933] lg:hidden cursor-pointer transition-colors"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar matching Reference Terminal style */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search markets, assets, processes (P1), resources (R1)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#0c1126] border border-[#1c274b] rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Reset Action Button aligned seamlessly */}
        <div className="flex items-center">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#0e142c] hover:bg-[#162042] text-slate-200 text-xs sm:text-sm font-medium rounded-xl border border-[#202c52] hover:border-[#2d3e70] transition-colors cursor-pointer shadow-sm"
            title="Reset Simulator to Default State"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Simulator</span>
          </button>
        </div>
      </div>
    </header>
  );
};
