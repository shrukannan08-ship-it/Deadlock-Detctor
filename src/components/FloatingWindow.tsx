import React, { useState } from 'react';
import {
  Minus,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
} from 'lucide-react';

interface FloatingWindowProps {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'cyan' | 'emerald' | 'rose' | 'amber' | 'slate';
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
  depth?: 'surface' | 'mid' | 'deep';
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  onClose?: () => void;
  accentColor?: string;
  glow?: boolean;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  id,
  title,
  subtitle,
  badge,
  badgeColor = 'cyan',
  icon: Icon,
  children,
  headerActions,
  className = '',
  depth = 'mid',
  isCollapsible = true,
  defaultExpanded = true,
  onClose,
  glow = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
      case 'rose':
        return 'bg-rose-950/60 text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]';
      case 'amber':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
      case 'slate':
        return 'bg-slate-900/60 text-slate-400 border-slate-700/40';
      case 'cyan':
      default:
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]';
    }
  };

  const depthClass =
    depth === 'surface'
      ? 'glass-panel-primary'
      : depth === 'deep'
      ? 'glass-panel-hud'
      : 'glass-panel-secondary';

  const glowClass = glow ? 'glow-edge-cyan' : '';

  return (
    <div
      id={id}
      className={`rounded-2xl transition-all duration-300 ease-out relative group/window ${depthClass} ${glowClass} ${
        isMaximized
          ? 'fixed inset-4 z-50 overflow-y-auto'
          : 'hover:border-cyan-500/30'
      } ${className}`}
    >
      {/* Upper Subtle Glass Flare Highlight */}
      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

      {/* Holographic Window Header */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-950/20 via-transparent to-transparent select-none">
        {/* Left: Window Title & Meta */}
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)] shrink-0 transition-transform group-hover/window:scale-105">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-white truncate font-sans">
                {title}
              </h2>
              {badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-400 truncate font-mono">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Window Controls & Extra Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {headerActions}

          {/* OS Window Traffic Light Buttons */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-cyan-500/15">
            {isCollapsible && (
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors cursor-pointer"
                title={isExpanded ? 'Minimize / Collapse' : 'Expand Window'}
              >
                <Minus className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={() => setIsMaximized((prev) => !prev)}
              className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors cursor-pointer"
              title={isMaximized ? 'Restore Size' : 'Maximize Window'}
            >
              {isMaximized ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Close Panel"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Holographic Window Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 transition-all duration-200">
          {children}
        </div>
      )}

      {/* Collapsed Preview Strip */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="px-5 py-2.5 text-xs font-mono text-cyan-400/70 hover:text-cyan-300 flex items-center justify-between cursor-pointer bg-cyan-950/10 hover:bg-cyan-950/20 transition-colors rounded-b-2xl"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Window minimized • Click to expand panel
          </span>
          <span className="text-[10px] text-slate-400">RESTORE</span>
        </div>
      )}
    </div>
  );
};
