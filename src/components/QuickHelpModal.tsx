import React from 'react';
import { X, Layers, Cpu, Sparkles, Terminal } from 'lucide-react';

interface QuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickHelpModal: React.FC<QuickHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="glass-panel-hud rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto border border-cyan-400/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-wide">
                AETHER OS // SYSTEM ARCHITECTURE & HOTKEYS
              </h2>
              <span className="text-[11px] font-mono text-cyan-400/80">
                Operating System Spatial Guide
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 font-mono text-xs text-slate-300">
          {/* Section 1: Spatial OS Paradigm */}
          <div className="glass-panel-secondary p-3.5 rounded-xl border border-cyan-500/20 space-y-2">
            <div className="text-cyan-300 font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>SPATIAL CONCURRENCY ARCHITECTURE</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              AETHER OS combines a floating glass operating environment with standard academic concurrency engines:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li><strong className="text-cyan-200">Banker's Safety Check:</strong> Simulates whether a safe sequence exists where all processes can acquire maximum claims and release resources without deadlocking.</li>
              <li><strong className="text-rose-300">Silberschatz Deadlock Detection:</strong> Traverses allocation and request matrices to identify active circular wait dependency knots.</li>
              <li><strong className="text-emerald-300">Prevention Protocol:</strong> 3-stage validation for incoming dynamic resource requests before physical allocation.</li>
            </ul>
          </div>

          {/* Section 2: Dock & Window Controls */}
          <div className="glass-panel-secondary p-3.5 rounded-xl border border-cyan-500/20 space-y-2">
            <div className="text-cyan-300 font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>FLOATING DOCK & CONTROLS</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-cyan-500/15">
                <span className="text-cyan-400 font-bold block">DOCK [1 .. 7]</span>
                Jump between Overview, Matrices, Player, RAG Graph, and Prevention.
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-cyan-500/15">
                <span className="text-cyan-400 font-bold block">CLI TERMINAL</span>
                Holographic terminal for typing commands like <code className="text-white">safe</code>, <code className="text-white">deadlock</code>, <code className="text-white">status</code>.
              </div>
            </div>
          </div>

          {/* Section 3: Dual C Engine Reference */}
          <div className="glass-panel-secondary p-3.5 rounded-xl border border-cyan-500/20 space-y-1.5">
            <div className="text-cyan-300 font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>C COMPANION KERNEL</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The project includes a 100% verified pure C implementation in <code className="text-cyan-300">c-implementation/</code>. Run <code className="text-white">cd c-implementation && .\build.bat</code> to compile and launch the interactive terminal dashboard or run test suites.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-cyan-950/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500/25 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-400/50 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer"
          >
            DISMISS GUIDE
          </button>
        </div>
      </div>
    </div>
  );
};
