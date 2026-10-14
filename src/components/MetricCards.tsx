import React from 'react';
import {
  Users,
  Layers,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Sparkles,
} from 'lucide-react';
import type { SimulationStatus } from '../types/deadlock';

interface MetricCardsProps {
  numProcesses: number;
  numResources: number;
  status: SimulationStatus;
  totalResources: number[];
  safeSequenceCount: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  numProcesses,
  numResources,
  status,
  totalResources,
  safeSequenceCount,
}) => {
  const getSystemStateDisplay = () => {
    switch (status) {
      case 'safe':
        return {
          title: 'SAFE STATE',
          sub: `${safeSequenceCount}/${numProcesses} Safe Sequence Verified`,
          badge: '100% SECURE',
          badgeClass: 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]',
          textColor: 'text-emerald-400',
          sparkColor: '#10b981',
          icon: ShieldCheck,
          glowBorder: 'border-emerald-500/35 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        };
      case 'unsafe':
      case 'deadlocked':
        return {
          title: status === 'deadlocked' ? 'DEADLOCKED' : 'UNSAFE STATE',
          sub: 'Circular Wait Cycle Detected',
          badge: 'BLOCKED',
          badgeClass: 'bg-rose-950/70 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.25)]',
          textColor: 'text-rose-400',
          sparkColor: '#f43f5e',
          icon: ShieldAlert,
          glowBorder: 'border-rose-500/35 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
        };
      case 'running':
        return {
          title: 'SIMULATING',
          sub: 'Tracing Stepper Iteration',
          badge: 'ACTIVE RUN',
          badgeClass: 'bg-cyan-950/70 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]',
          textColor: 'text-cyan-400',
          sparkColor: '#22d3ee',
          icon: Activity,
          glowBorder: 'border-cyan-500/35 shadow-[0_0_20px_rgba(6,182,212,0.2)]',
        };
      default:
        return {
          title: 'SYSTEM READY',
          sub: 'Banker & Deadlock Verifier',
          badge: 'READY',
          badgeClass: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30',
          textColor: 'text-cyan-200',
          sparkColor: '#38bdf8',
          icon: Cpu,
          glowBorder: 'border-cyan-500/20',
        };
    }
  };

  const sysDisplay = getSystemStateDisplay();
  const StateIcon = sysDisplay.icon;
  const totalCapacitySum = totalResources.reduce((acc, curr) => acc + (curr || 0), 0);

  const cards = [
    {
      title: 'TOTAL PROCESSES',
      value: `${numProcesses} Units`,
      sub: Array.from({ length: numProcesses }, (_, i) => `P${i + 1}`).join(', '),
      badge: `RANGE P1..P${numProcesses}`,
      badgeColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
      icon: Users,
    },
    {
      title: 'RESOURCE CLASSES',
      value: `${numResources} Classes`,
      sub: Array.from({ length: numResources }, (_, i) => `R${i + 1}`).join(', '),
      badge: `${totalCapacitySum} TOTAL UNITS`,
      badgeColor: 'text-sky-300 bg-sky-950/60 border-sky-500/30',
      icon: Layers,
    },
    {
      title: 'CONCURRENCY STATE',
      value: sysDisplay.title,
      sub: sysDisplay.sub,
      badge: sysDisplay.badge,
      badgeColor: sysDisplay.badgeClass,
      textColor: sysDisplay.textColor,
      icon: StateIcon,
      customBorder: sysDisplay.glowBorder,
    },
    {
      title: 'TOTAL CAPACITY',
      value: `${totalCapacitySum} Units`,
      sub: `Vector: [${totalResources.slice(0, numResources).join(', ')}]`,
      badge: 'POOL MONITOR',
      badgeColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
      icon: Sparkles,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div
            key={idx}
            className={`glass-panel-secondary rounded-2xl p-4.5 transition-all duration-300 hover:scale-[1.01] hover:border-cyan-500/40 relative overflow-hidden group holo-shimmer ${
              card.customBorder || ''
            }`}
          >
            {/* Top glass reflection line */}
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />

            {/* Header row */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono font-medium text-slate-400 tracking-wider">
                {card.title}
              </span>
              <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Main Value */}
            <div
              className={`text-xl font-bold font-mono tracking-tight ${
                card.textColor || 'text-white'
              }`}
            >
              {card.value}
            </div>

            {/* Subtitle & Badge */}
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-cyan-500/15 gap-2">
              <span className="text-[11px] font-mono text-slate-400 truncate">
                {card.sub}
              </span>
              <span
                className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md border shrink-0 ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
