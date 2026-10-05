import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import type { WorkProgressionPoint } from '../types/deadlock';

interface WorkProgressionChartProps {
  numResources: number;
  workHistory: WorkProgressionPoint[];
}

const RESOURCE_COLORS = [
  '#06b6d4', // R1: Cyan
  '#3b82f6', // R2: Blue
  '#a855f7', // R3: Purple
  '#10b981', // R4: Emerald
  '#f59e0b', // R5: Amber
  '#ec4899', // R6: Pink
];

export const WorkProgressionChart: React.FC<WorkProgressionChartProps> = ({
  numResources,
  workHistory,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    stepIdx: number;
    rIdx: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  if (workHistory.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm text-center py-8">
        <div className="text-slate-400 text-xs">
          Chart data available once the safety simulation is executed.
        </div>
      </div>
    );
  }

  const svgWidth = 600;
  const svgHeight = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Find max value for Y axis
  let maxY = 1;
  workHistory.forEach((pt) => {
    pt.work.forEach((val) => {
      if (val > maxY) maxY = val;
    });
  });
  maxY = Math.ceil(maxY * 1.15) || 5;

  const totalSteps = workHistory.length;

  const getX = (stepIdx: number) => {
    if (totalSteps <= 1) return padding.left + graphWidth / 2;
    return padding.left + (stepIdx / (totalSteps - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    return padding.top + graphHeight - (val / maxY) * graphHeight;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-3.5 gap-2">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-xs uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>WORK VECTOR PROGRESSION (AVAILABLE EVOLUTION)</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {Array.from({ length: numResources }).map((_, rIdx) => (
            <div key={rIdx} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: RESOURCE_COLORS[rIdx % RESOURCE_COLORS.length] }}
              />
              <span className="text-slate-300 font-bold">R{rIdx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex-1 bg-slate-950/80 rounded-xl border border-slate-800 p-2 overflow-hidden flex items-center justify-center min-h-[240px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none overflow-visible"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding.top + graphHeight * (1 - ratio);
            const val = Math.round(maxY * ratio);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Vertical Step Grid lines */}
          {workHistory.map((pt, stepIdx) => {
            const x = getX(stepIdx);
            return (
              <g key={stepIdx}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + graphHeight}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={x}
                  y={padding.top + graphHeight + 18}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {stepIdx === 0 ? 'Step 0' : pt.process || `S${stepIdx}`}
                </text>
              </g>
            );
          })}

          {/* Resource Lines & Points */}
          {Array.from({ length: numResources }).map((_, rIdx) => {
            const color = RESOURCE_COLORS[rIdx % RESOURCE_COLORS.length];
            const pointsData = workHistory.map((pt, stepIdx) => ({
              x: getX(stepIdx),
              y: getY(pt.work[rIdx] ?? 0),
              val: pt.work[rIdx] ?? 0,
              stepIdx,
            }));

            const pathString = pointsData.reduce((acc, curr, idx) => {
              return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
            }, '');

            return (
              <g key={rIdx}>
                <path
                  d={pathString}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {pointsData.map((p, pIdx) => (
                  <circle
                    key={pIdx}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.stepIdx === p.stepIdx && hoveredPoint?.rIdx === rIdx ? 6 : 4}
                    fill="#090e1a"
                    stroke={color}
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all hover:scale-125"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        stepIdx: p.stepIdx,
                        rIdx,
                        value: p.val,
                        x: p.x,
                        y: p.y,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-10 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-[11px] font-mono shadow-xl pointer-events-none -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${(hoveredPoint.y / svgHeight) * 100 - 4}%`,
            }}
          >
            <div className="font-bold text-cyan-300">
              R{hoveredPoint.rIdx + 1}: {hoveredPoint.value}
            </div>
            <div className="text-[9px] text-slate-400">
              {workHistory[hoveredPoint.stepIdx]?.stepLabel}
            </div>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-500 mt-2.5">
        Live progression of available resources in the Work vector after each process completes.
      </p>
    </div>
  );
};
