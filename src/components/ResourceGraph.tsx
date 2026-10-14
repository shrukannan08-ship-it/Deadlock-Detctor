import React from 'react';
import { Network, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ResourceGraphProps {
  numProcesses: number;
  numResources: number;
  allocation: number[][];
  requestMatrix: number[][];
  available: number[];
  totalResources: number[];
  safeSequence?: string[];
  deadlockedProcesses?: string[];
  onSelectProcess?: (processName: string) => void;
  searchQuery?: string;
}

export const ResourceGraph: React.FC<ResourceGraphProps> = ({
  numProcesses,
  numResources,
  allocation,
  requestMatrix,
  available,
  totalResources,
  safeSequence = [],
  deadlockedProcesses = [],
  onSelectProcess,
  searchQuery = '',
}) => {
  const maxNodes = Math.max(numProcesses, numResources, 2);
  const svgWidth = 620;
  const svgHeight = Math.max(380, maxNodes * 75 + 60);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Spatial layout: Process Nodes Left, Resource Nodes Right
  const processX = 130;
  const resourceX = 490;

  const processPositions = Array.from({ length: numProcesses }).map((_, idx) => {
    const spacing = (svgHeight - 100) / (numProcesses > 1 ? numProcesses - 1 : 1);
    const y = numProcesses === 1 ? svgHeight / 2 : 50 + idx * spacing;
    return { name: `P${idx + 1}`, x: processX, y, index: idx };
  });

  const resourcePositions = Array.from({ length: numResources }).map((_, idx) => {
    const spacing = (svgHeight - 100) / (numResources > 1 ? numResources - 1 : 1);
    const y = numResources === 1 ? svgHeight / 2 : 50 + idx * spacing;
    return { name: `R${idx + 1}`, x: resourceX, y, index: idx };
  });

  // 1. ALLOCATION EDGES: Resource -> Process
  const allocationEdges: Array<{
    id: string;
    from: { x: number; y: number; name: string };
    to: { x: number; y: number; name: string };
    pathData: string;
    midX: number;
    midY: number;
    weight: number;
    isDeadlocked: boolean;
  }> = [];

  for (let p = 0; p < numProcesses; p++) {
    for (let r = 0; r < numResources; r++) {
      const weight = allocation[p]?.[r] || 0;
      if (weight > 0) {
        const pNode = processPositions[p];
        const rNode = resourcePositions[r];
        const pName = `P${p + 1}`;
        const isDeadlocked = deadlockedProcesses.includes(pName);

        const dx = pNode.x - rNode.x;
        const dy = pNode.y - rNode.y;
        const curve = 32;
        const midX = (rNode.x + pNode.x) / 2;
        const midY = (rNode.y + pNode.y) / 2 + (dy === 0 ? curve : (curve * dx) / Math.abs(dx || 1));
        const pathData = `M ${rNode.x} ${rNode.y} Q ${midX} ${midY} ${pNode.x} ${pNode.y}`;

        allocationEdges.push({
          id: `alloc-${r}-${p}`,
          from: rNode,
          to: pNode,
          pathData,
          midX,
          midY,
          weight,
          isDeadlocked,
        });
      }
    }
  }

  // 2. REQUEST EDGES: Process -> Resource
  const requestEdges: Array<{
    id: string;
    from: { x: number; y: number; name: string };
    to: { x: number; y: number; name: string };
    pathData: string;
    midX: number;
    midY: number;
    weight: number;
    isDeadlocked: boolean;
  }> = [];

  for (let p = 0; p < numProcesses; p++) {
    for (let r = 0; r < numResources; r++) {
      const weight = requestMatrix[p]?.[r] || 0;
      if (weight > 0) {
        const pNode = processPositions[p];
        const rNode = resourcePositions[r];
        const pName = `P${p + 1}`;
        const isDeadlocked = deadlockedProcesses.includes(pName);

        const dx = rNode.x - pNode.x;
        const dy = rNode.y - pNode.y;
        const curve = -32;
        const midX = (pNode.x + rNode.x) / 2;
        const midY = (pNode.y + rNode.y) / 2 + (dy === 0 ? curve : (curve * dx) / Math.abs(dx || 1));
        const pathData = `M ${pNode.x} ${pNode.y} Q ${midX} ${midY} ${rNode.x} ${rNode.y}`;

        requestEdges.push({
          id: `req-${p}-${r}`,
          from: pNode,
          to: rNode,
          pathData,
          midX,
          midY,
          weight,
          isDeadlocked,
        });
      }
    }
  }

  const isDeadlockActive = deadlockedProcesses.length > 0;

  return (
    <div className="glass-panel-primary rounded-2xl p-5 flex flex-col h-full hover:border-cyan-500/35 transition-all holo-shimmer">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyan-500/15 mb-3.5 gap-2.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <Network className="w-4 h-4" />
          </div>
          <span className="font-sans">Holographic Resource Allocation Graph (RAG)</span>
        </div>

        {isDeadlockActive ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-mono font-semibold shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Cycle Detected ({deadlockedProcesses.join(', ')})</span>
          </div>
        ) : safeSequence.length > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-semibold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Optimal Safe State Flow</span>
          </div>
        ) : (
          <span className="text-xs font-mono text-cyan-400/80 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/25">
            Live Dependency Flow
          </span>
        )}
      </div>

      {/* SVG Canvas with Holographic Glow & Glass Substrate */}
      <div className="relative flex-1 bg-[#02050f]/80 rounded-xl border border-cyan-500/20 p-2 overflow-hidden flex items-center justify-center min-h-[360px] shadow-inner">
        {/* Subtle cyan technical grid pattern */}
        <div className="absolute inset-0 os-grid-bg opacity-40 pointer-events-none" />

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[480px] select-none relative z-10"
        >
          <defs>
            {/* Markers */}
            <marker
              id="rag-arrow-alloc-green"
              viewBox="0 0 10 10"
              refX="24"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>

            <marker
              id="rag-arrow-alloc-red"
              viewBox="0 0 10 10"
              refX="24"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>

            <marker
              id="rag-arrow-req-cyan"
              viewBox="0 0 10 10"
              refX="30"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#22d3ee" />
            </marker>

            <marker
              id="rag-arrow-req-red"
              viewBox="0 0 10 10"
              refX="30"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>

            {/* Depth Hologram Gradients */}
            <radialGradient id="proc-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="60%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            <radialGradient id="proc-gradient-deadlock" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="60%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#4c0519" />
            </radialGradient>

            <radialGradient id="proc-gradient-safe" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#047857" />
              <stop offset="100%" stopColor="#022c22" />
            </radialGradient>

            <linearGradient id="res-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="60%" stopColor="#0e7490" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>

            {/* Filter for neon glow on active nodes */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Allocation Edges: Resource -> Process */}
          {allocationEdges.map((edge) => (
            <g key={edge.id}>
              <path
                d={edge.pathData}
                fill="none"
                stroke={edge.isDeadlocked ? '#f43f5e' : '#10b981'}
                strokeWidth={edge.isDeadlocked ? 2.5 : 2}
                strokeOpacity={0.85}
                markerEnd={`url(#rag-arrow-alloc-${edge.isDeadlocked ? 'red' : 'green'})`}
              />
              {/* Particle flow */}
              <circle r={3.5} fill={edge.isDeadlocked ? '#f43f5e' : '#34d399'}>
                <animateMotion
                  path={edge.pathData}
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Weight badge */}
              <g transform={`translate(${edge.midX}, ${edge.midY})`}>
                <rect
                  x="-10"
                  y="-9"
                  width="20"
                  height="18"
                  rx="5"
                  fill="#030714"
                  stroke={edge.isDeadlocked ? '#f43f5e' : '#10b981'}
                  strokeWidth="1"
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {edge.weight}
                </text>
              </g>
            </g>
          ))}

          {/* Request Edges: Process -> Resource */}
          {requestEdges.map((edge) => (
            <g key={edge.id}>
              <path
                d={edge.pathData}
                fill="none"
                stroke={edge.isDeadlocked ? '#f43f5e' : '#22d3ee'}
                strokeWidth={edge.isDeadlocked ? 2.5 : 2}
                strokeDasharray="5 3"
                strokeOpacity={0.85}
                markerEnd={`url(#rag-arrow-req-${edge.isDeadlocked ? 'red' : 'cyan'})`}
              />
              {/* Particle flow */}
              <circle r={3.5} fill={edge.isDeadlocked ? '#f43f5e' : '#67e8f9'}>
                <animateMotion
                  path={edge.pathData}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Weight badge */}
              <g transform={`translate(${edge.midX}, ${edge.midY})`}>
                <rect
                  x="-10"
                  y="-9"
                  width="20"
                  height="18"
                  rx="5"
                  fill="#030714"
                  stroke={edge.isDeadlocked ? '#f43f5e' : '#22d3ee'}
                  strokeWidth="1"
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {edge.weight}
                </text>
              </g>
            </g>
          ))}

          {/* Process Nodes (Circles) */}
          {processPositions.map((node) => {
            const isDeadlocked = deadlockedProcesses.includes(node.name);
            const orderIndex = safeSequence.indexOf(node.name);
            const isMatched =
              normalizedQuery &&
              (normalizedQuery === node.name.toLowerCase() ||
                normalizedQuery === String(node.index + 1));

            return (
              <g
                key={node.name}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectProcess?.(node.name)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Search highlight ring */}
                {isMatched && (
                  <circle
                    r={26}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                  />
                )}

                <circle
                  r={20}
                  fill={
                    isDeadlocked
                      ? 'url(#proc-gradient-deadlock)'
                      : orderIndex !== -1
                      ? 'url(#proc-gradient-safe)'
                      : 'url(#proc-gradient)'
                  }
                  stroke={
                    isMatched
                      ? '#22d3ee'
                      : isDeadlocked
                      ? '#f43f5e'
                      : orderIndex !== -1
                      ? '#10b981'
                      : '#0ea5e9'
                  }
                  strokeWidth={isMatched ? 2.5 : isDeadlocked ? 2.5 : 2}
                  filter="url(#neon-glow)"
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.name}
                </text>

                {/* Safe execution sequence badge */}
                {orderIndex !== -1 && (
                  <g transform="translate(14, -14)">
                    <circle r={7.5} fill="#10b981" />
                    <text
                      textAnchor="middle"
                      dy="2.5"
                      fill="#022c22"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {orderIndex + 1}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Resource Nodes (Rectangles) */}
          {resourcePositions.map((node) => {
            const availVal = available[node.index] ?? 0;
            const totalVal = totalResources[node.index] ?? 0;
            const isMatched =
              normalizedQuery &&
              (normalizedQuery === node.name.toLowerCase() ||
                normalizedQuery === String(node.index + 1));

            return (
              <g
                key={node.name}
                transform={`translate(${node.x}, ${node.y})`}
                className="transition-transform hover:scale-105"
              >
                {/* Search highlight ring */}
                {isMatched && (
                  <rect
                    x={-35}
                    y={-25}
                    width={70}
                    height={48}
                    rx={8}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                  />
                )}

                <rect
                  x={-30}
                  y={-20}
                  width={60}
                  height={38}
                  rx={8}
                  fill="url(#res-gradient)"
                  stroke={isMatched ? '#22d3ee' : '#0891b2'}
                  strokeWidth={isMatched ? 2.5 : 2}
                  filter="url(#neon-glow)"
                />
                <text
                  x={0}
                  y={-5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.name}
                </text>
                <text
                  x={0}
                  y={9}
                  textAnchor="middle"
                  fill="#a5f3fc"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="semibold"
                >
                  Avail: {availVal}/{totalVal}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Graph Legend */}
      <div className="mt-3.5 pt-3 border-t border-cyan-500/15 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-300 inline-block shadow-[0_0_6px_#0ea5e9]"></span>
          <span>Process Node (P)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-cyan-600 border border-cyan-400 inline-block shadow-[0_0_6px_#06b6d4]"></span>
          <span>Resource Node (R)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-emerald-400 inline-block shadow-[0_0_6px_#34d399]"></span>
          <span className="text-emerald-300">Allocated (R→P)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-t border-dashed border-cyan-400 inline-block shadow-[0_0_6px_#22d3ee]"></span>
          <span className="text-cyan-300">Requested (P→R)</span>
        </div>
      </div>
    </div>
  );
};
