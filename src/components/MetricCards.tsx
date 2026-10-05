import React from 'react';
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
          sub: `${safeSequenceCount}/${numProcesses} Safe Order`,
          badge: '+100% SECURE',
          badgeClass: 'bg-emerald-950/70 text-emerald-400 border-emerald-700/60',
          textColor: 'text-emerald-400',
          sparkColor: '#10b981',
        };
      case 'unsafe':
      case 'deadlocked':
        return {
          title: status === 'deadlocked' ? 'DEADLOCKED' : 'UNSAFE STATE',
          sub: 'Circular Wait Detected',
          badge: 'BLOCKED',
          badgeClass: 'bg-rose-950/70 text-rose-400 border-rose-700/60',
          textColor: 'text-rose-400',
          sparkColor: '#f43f5e',
        };
      case 'running':
        return {
          title: 'SIMULATING',
          sub: 'Executing Banker Step',
          badge: 'ACTIVE RUN',
          badgeClass: 'bg-blue-950/70 text-blue-400 border-blue-700/60',
          textColor: 'text-blue-400',
          sparkColor: '#38bdf8',
        };
      default:
        return {
          title: 'SYSTEM READY',
          sub: 'Safe State Verifier',
          badge: 'READY',
          badgeClass: 'bg-indigo-950/70 text-indigo-300 border-indigo-700/60',
          textColor: 'text-white',
          sparkColor: '#818cf8',
        };
    }
  };

  const stateInfo = getSystemStateDisplay();
  const totalInstanceSum = totalResources.reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Processes (like Total Portfolio) */}
      <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#23315d] transition-all">
        <div>
          <span className="text-xs text-slate-400 font-medium">Total Processes</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">
            {numProcesses} Active
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center text-[11px] font-semibold text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-full">
            P1 – P{numProcesses}
          </span>
          {/* Dynamic mini sparkline matching Reference Card 1 */}
          <svg className="w-24 h-6 text-purple-500 overflow-visible" viewBox="0 0 100 24" fill="none">
            <path
              d="M0 18 Q 20 6, 40 14 T 75 8 T 100 2"
              stroke="#a855f7"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 2: Resource Types (like Daily P/L) */}
      <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#23315d] transition-all">
        <div>
          <span className="text-xs text-slate-400 font-medium">Resource Types</span>
          <div className="text-2xl font-bold text-cyan-400 tracking-tight mt-1">
            {numResources} Vector Classes
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
            R1 – R{numResources}
          </span>
          {/* Dynamic mini sparkline matching Reference Card 2 */}
          <svg className="w-24 h-6 text-cyan-400 overflow-visible" viewBox="0 0 100 24" fill="none">
            <path
              d="M0 20 Q 25 18, 45 10 T 80 12 T 100 4"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 3: System State (like Unrealized P/L) */}
      <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#23315d] transition-all">
        <div>
          <span className="text-xs text-slate-400 font-medium">System State</span>
          <div className={`text-2xl font-bold tracking-tight mt-1 ${stateInfo.textColor}`}>
            {stateInfo.title}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className={`inline-flex items-center text-[11px] font-semibold border px-2 py-0.5 rounded-full ${stateInfo.badgeClass}`}>
            {stateInfo.badge}
          </span>
          {/* Dynamic mini sparkline matching Reference Card 3 */}
          <svg className="w-24 h-6 overflow-visible" viewBox="0 0 100 24" fill="none">
            <path
              d="M0 16 Q 30 22, 55 12 T 85 8 T 100 2"
              stroke={stateInfo.sparkColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Card 4: Buying Power / Total Capacity */}
      <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#23315d] transition-all">
        <div>
          <span className="text-xs text-slate-400 font-medium">Total Capacity</span>
          <div className="text-2xl font-bold text-white tracking-tight mt-1">
            {totalInstanceSum} Units
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full font-mono">
            [{totalResources.join(', ')}]
          </span>
          {/* Dynamic mini sparkline matching Reference Card 4 */}
          <svg className="w-24 h-6 text-amber-400 overflow-visible" viewBox="0 0 100 24" fill="none">
            <path
              d="M0 22 Q 20 12, 50 16 T 80 6 T 100 3"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
