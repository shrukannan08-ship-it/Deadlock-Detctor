import React, { useState } from 'react';
import { Send, CheckCircle2, XCircle, ShieldAlert, Check, RotateCcw } from 'lucide-react';
import { evaluateResourceRequest } from '../algorithms/resourceRequest';
import type { ResourceRequestResult } from '../types/deadlock';

interface ResourceRequestSectionProps {
  numProcesses: number;
  numResources: number;
  available: number[];
  allocation: number[][];
  needMatrix: number[][];
  onApplyRequest: (
    newAvailable: number[],
    newAllocation: number[][],
    processName: string
  ) => void;
}

export const ResourceRequestSection: React.FC<ResourceRequestSectionProps> = ({
  numProcesses,
  numResources,
  available,
  allocation,
  needMatrix,
  onApplyRequest,
}) => {
  const [selectedProcessIdx, setSelectedProcessIdx] = useState<number>(0);
  const [requestVector, setRequestVector] = useState<number[]>(() =>
    new Array(numResources).fill(0)
  );
  const [requestResult, setRequestResult] = useState<ResourceRequestResult | null>(null);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  // Sync request vector length if numResources changes
  React.useEffect(() => {
    setRequestVector((prev) => {
      const next = new Array(numResources).fill(0);
      for (let i = 0; i < Math.min(prev.length, numResources); i++) {
        next[i] = prev[i] || 0;
      }
      return next;
    });
    setRequestResult(null);
    setIsApplied(false);
  }, [numResources]);

  const selectedProcessName = `P${selectedProcessIdx + 1}`;
  const currentProcessNeed = needMatrix[selectedProcessIdx] || [];

  const handleRequestValueChange = (rIdx: number, val: number) => {
    setRequestVector((prev) => {
      const next = [...prev];
      next[rIdx] = Math.max(0, val);
      return next;
    });
    setRequestResult(null);
    setIsApplied(false);
  };

  const handleCheckRequest = () => {
    setIsApplied(false);
    const result = evaluateResourceRequest(
      selectedProcessIdx,
      requestVector,
      numProcesses,
      numResources,
      available,
      allocation,
      needMatrix
    );
    setRequestResult(result);
  };

  const handleApplyAllocation = () => {
    if (requestResult?.granted && requestResult.newAvailable && requestResult.newAllocation) {
      onApplyRequest(requestResult.newAvailable, requestResult.newAllocation, selectedProcessName);
      setIsApplied(true);
    }
  };

  const handleResetRequest = () => {
    setRequestVector(new Array(numResources).fill(0));
    setRequestResult(null);
    setIsApplied(false);
  };

  return (
    <div className="glass-panel-primary rounded-2xl p-5 space-y-4 hover:border-cyan-500/35 transition-all holo-shimmer">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyan-500/15 gap-2.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <Send className="w-4 h-4" />
          </div>
          <span className="font-sans">Resource Request & Dynamic Banker’s Prevention Engine</span>
        </div>
        <span className="text-xs font-mono text-cyan-300 bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-500/25">
          3-Stage Banker’s Evaluation
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Input Form Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Process Selector */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                REQUESTING PROCESS:
              </label>
              <select
                value={selectedProcessIdx}
                onChange={(e) => {
                  setSelectedProcessIdx(parseInt(e.target.value, 10));
                  setRequestResult(null);
                  setIsApplied(false);
                }}
                className="w-full py-2 bg-slate-950/80 border border-cyan-500/25 rounded-xl px-3 text-sm font-mono font-bold text-cyan-200 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
              >
                {Array.from({ length: numProcesses }).map((_, pIdx) => (
                  <option key={pIdx} value={pIdx} className="bg-[#030712] text-white">
                    Process P{pIdx + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Process Context info */}
            <div className="glass-panel-secondary p-2.5 rounded-xl border border-cyan-500/20 text-xs font-mono space-y-1">
              <div className="text-slate-400 flex justify-between">
                <span>{selectedProcessName} Need:</span>
                <strong className="text-cyan-300 font-mono">[{currentProcessNeed.join(', ')}]</strong>
              </div>
              <div className="text-slate-400 flex justify-between">
                <span>Available Pool:</span>
                <strong className="text-emerald-400 font-mono">[{available.join(', ')}]</strong>
              </div>
            </div>
          </div>

          {/* Request Vector Inputs */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
              CLAIM AMOUNTS FOR EACH RESOURCE CLASS:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {Array.from({ length: numResources }).map((_, rIdx) => (
                <div key={rIdx} className="glass-panel-secondary p-2 rounded-xl border border-cyan-500/20 text-center">
                  <span className="block text-xs font-mono font-bold text-slate-400 mb-1">
                    R{rIdx + 1}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={requestVector[rIdx] ?? 0}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleRequestValueChange(rIdx, isNaN(val) ? 0 : val);
                    }}
                    className="w-full py-1 text-center text-xs font-bold font-mono bg-slate-950/80 border border-cyan-500/30 rounded-lg text-cyan-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 font-mono">
            <button
              onClick={handleCheckRequest}
              className="py-2 px-4 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>EVALUATE REQUEST PROTOCOL</span>
            </button>

            {requestResult?.granted && (
              <button
                onClick={handleApplyAllocation}
                disabled={isApplied}
                className={`py-2 px-4 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer border shadow-md ${
                  isApplied
                    ? 'bg-slate-900/60 text-slate-500 border-slate-800 cursor-not-allowed'
                    : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isApplied ? 'Allocation Applied ✓' : 'Apply Allocation to State'}</span>
              </button>
            )}

            <button
              onClick={handleResetRequest}
              className="py-2 px-3 bg-slate-950/70 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-200 font-medium text-xs rounded-xl border border-cyan-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Evaluation Output & Reasoning Column */}
        <div className="lg:col-span-6 glass-panel-secondary rounded-2xl border border-cyan-500/25 p-4 space-y-3 min-h-[220px] flex flex-col justify-between">
          {requestResult ? (
            <div className="space-y-3 font-mono">
              {/* Verdict Header */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  requestResult.granted
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  {requestResult.granted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>RESULT: REQUEST GRANTED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>RESULT: REQUEST DENIED</span>
                    </>
                  )}
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-950/70 border border-cyan-500/20 text-cyan-300">
                  {requestResult.process} Req: [{requestResult.request.join(', ')}]
                </span>
              </div>

              {/* Step Checklist */}
              <div className="space-y-1.5 text-xs">
                {/* Step 1: Request <= Need */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-cyan-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">1. Request ≤ Need:</span>
                    <span className="text-white font-mono">
                      [{requestResult.request.join(', ')}] ≤ [{requestResult.need.join(', ')}]
                    </span>
                  </div>
                  {requestResult.step1Pass ? (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold text-xs flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> FAIL
                    </span>
                  )}
                </div>

                {/* Step 2: Request <= Available */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-cyan-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">2. Request ≤ Available:</span>
                    <span className="text-white font-mono">
                      [{requestResult.request.join(', ')}] ≤ [{requestResult.available.join(', ')}]
                    </span>
                  </div>
                  {requestResult.step2Pass ? (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold text-xs flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> FAIL
                    </span>
                  )}
                </div>

                {/* Step 3: Safety Check */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-cyan-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">3. Tentative Safety Check:</span>
                  </div>
                  {requestResult.isSafe ? (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SAFE STATE
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold text-xs flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> UNSAFE STATE
                    </span>
                  )}
                </div>
              </div>

              {/* Rationale and State Status */}
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  requestResult.granted
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="font-bold mb-0.5">
                  {requestResult.granted ? 'Action Taken:' : 'Rollback Notice:'}
                </div>
                <div>{requestResult.reason}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs font-mono text-slate-400 flex flex-col items-center justify-center h-full">
              <Send className="w-6 h-6 text-slate-600 mb-2" />
              <span>Select process & request amounts, then click "Evaluate Request Protocol".</span>
            </div>
          )}

          {isApplied && (
            <div className="text-xs font-mono text-emerald-300 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>State updated: Allocation applied to {selectedProcessName} and matrices refreshed.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
