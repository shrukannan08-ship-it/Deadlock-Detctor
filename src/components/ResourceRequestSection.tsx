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
    <div className="bg-[#0a0e22] border border-[#192344] rounded-2xl p-5 space-y-4 shadow-sm hover:border-[#202e58] transition-all">
      {/* Header matching Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#141d38] gap-2.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm tracking-wide">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Send className="w-4 h-4" />
          </div>
          <span>Resource Request & Dynamic Banker’s Safety Procedure</span>
        </div>
        <span className="text-xs text-slate-400 bg-[#0d1228] px-3 py-1 rounded-full border border-[#1d294d]">
          Banker’s Request Protocol
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Input Form Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Process Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Requesting Process:
              </label>
              <select
                value={selectedProcessIdx}
                onChange={(e) => {
                  setSelectedProcessIdx(parseInt(e.target.value, 10));
                  setRequestResult(null);
                  setIsApplied(false);
                }}
                className="w-full py-2 bg-[#0d1228] border border-[#1d294d] rounded-xl px-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {Array.from({ length: numProcesses }).map((_, pIdx) => (
                  <option key={pIdx} value={pIdx}>
                    Process P{pIdx + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Process Context info */}
            <div className="bg-[#0c1126] p-2.5 rounded-xl border border-[#182346] text-xs space-y-1">
              <div className="text-slate-400 flex justify-between">
                <span>{selectedProcessName} Current Need:</span>
                <strong className="text-cyan-400 font-mono">[{currentProcessNeed.join(', ')}]</strong>
              </div>
              <div className="text-slate-400 flex justify-between">
                <span>Available Pool:</span>
                <strong className="text-emerald-400 font-mono">[{available.join(', ')}]</strong>
              </div>
            </div>
          </div>

          {/* Request Vector Inputs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Requested Resource Amounts:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {Array.from({ length: numResources }).map((_, rIdx) => (
                <div key={rIdx} className="bg-[#0c1126] p-2 rounded-xl border border-[#182346] text-center">
                  <span className="block text-xs font-bold text-slate-400 mb-1">
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
                    className="w-full py-1 text-center text-xs font-bold font-mono bg-[#080c1c] border border-[#1d294d] rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={handleCheckRequest}
              className="py-2 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Evaluate Request Protocol</span>
            </button>

            {requestResult?.granted && (
              <button
                onClick={handleApplyAllocation}
                disabled={isApplied}
                className={`py-2 px-4 font-semibold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer border shadow-md ${
                  isApplied
                    ? 'bg-[#10152b] text-slate-500 border-[#1a2342] cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-950/50'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isApplied ? 'Allocation Applied ✓' : 'Apply Allocation to State'}</span>
              </button>
            )}

            <button
              onClick={handleResetRequest}
              className="py-2 px-3 bg-[#0d1228] hover:bg-[#141b38] text-slate-300 font-medium text-xs rounded-xl border border-[#1d294d] flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Evaluation Output & Reasoning Column */}
        <div className="lg:col-span-6 bg-[#0c1126] rounded-2xl border border-[#182346] p-4 space-y-3 min-h-[220px] flex flex-col justify-between">
          {requestResult ? (
            <div className="space-y-3">
              {/* Verdict Header */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  requestResult.granted
                    ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-600/60 text-rose-200'
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
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#080c1c] border border-[#1d294d] text-white">
                  {requestResult.process} Req: [{requestResult.request.join(', ')}]
                </span>
              </div>

              {/* Step Checklist */}
              <div className="space-y-1.5 text-xs">
                {/* Step 1: Request <= Need */}
                <div className="p-2 rounded-xl bg-[#080c1c] border border-[#182346] flex items-center justify-between">
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
                <div className="p-2 rounded-xl bg-[#080c1c] border border-[#182346] flex items-center justify-between">
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
                <div className="p-2 rounded-xl bg-[#080c1c] border border-[#182346] flex items-center justify-between">
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
                    ? 'bg-emerald-950/30 border-emerald-700/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-700/40 text-rose-300'
                }`}
              >
                <div className="font-bold mb-0.5">
                  {requestResult.granted ? 'Action Taken:' : 'Rollback Notice:'}
                </div>
                <div>{requestResult.reason}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400 flex flex-col items-center justify-center h-full">
              <Send className="w-6 h-6 text-slate-600 mb-2" />
              <span>Select process & request amounts, then click "Evaluate Request Protocol".</span>
            </div>
          )}

          {isApplied && (
            <div className="text-xs text-emerald-300 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-600/50 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>State updated: Allocation applied to {selectedProcessName} and matrices refreshed.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
