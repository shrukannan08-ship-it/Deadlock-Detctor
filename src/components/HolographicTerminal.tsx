import React, { useState } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Play, Trash2 } from 'lucide-react';

interface HolographicTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
  numProcesses: number;
  numResources: number;
  available: number[];
  onRunSafeCheck: () => void;
  onRunDeadlockDetect: () => void;
}

export const HolographicTerminal: React.FC<HolographicTerminalProps> = ({
  isOpen,
  onClose,
  status,
  numProcesses,
  numResources,
  available,
  onRunSafeCheck,
  onRunDeadlockDetect,
}) => {
  const [logs, setLogs] = useState<string[]>([
    '[KERNEL_INIT] AETHER OS v3.2 Core Concurrency Engine Initialized.',
    `[SUBSYSTEM] Allocated state space: ${numProcesses} processes, ${numResources} resource classes.`,
    `[VECTOR_POOL] Available instances: [${available.join(', ')}]`,
    `[STATUS] System state: ${status.toUpperCase()}. Standby for pipeline commands.`,
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newLogs = [...logs, `$ aether-cli > ${cmd}`];

    if (trimmed === 'help') {
      newLogs.push('Available Kernel Commands:');
      newLogs.push('  safe       - Execute Banker\'s safety state evaluation');
      newLogs.push('  deadlock   - Execute standard deadlock detection algorithm');
      newLogs.push('  status     - Query current telemetry and available pool');
      newLogs.push('  clear      - Clear terminal logs');
      newLogs.push('  exit       - Close holographic console');
    } else if (trimmed === 'safe' || trimmed === 'banker') {
      newLogs.push('[EXEC] Invoking Banker\'s Safety Algorithm...');
      onRunSafeCheck();
      newLogs.push('[EXEC_OK] Evaluation dispatched to primary workspace.');
    } else if (trimmed === 'deadlock' || trimmed === 'detect') {
      newLogs.push('[EXEC] Invoking Silberschatz Deadlock Detection...');
      onRunDeadlockDetect();
      newLogs.push('[EXEC_OK] Circular-wait graph verification dispatched.');
    } else if (trimmed === 'status') {
      newLogs.push(`[TELEMETRY] Status: ${status.toUpperCase()}`);
      newLogs.push(`[TELEMETRY] Processes: ${numProcesses} | Resources: ${numResources}`);
      newLogs.push(`[TELEMETRY] Available Vector: [${available.join(', ')}]`);
    } else if (trimmed === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else if (trimmed === 'exit' || trimmed === 'quit') {
      onClose();
      return;
    } else if (trimmed) {
      newLogs.push(`[ERR] Command not recognized: "${cmd}". Type "help" for kernel commands.`);
    }

    setLogs(newLogs);
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div
        className={`glass-panel-hud rounded-2xl flex flex-col border border-cyan-400/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] transition-all ${
          isMaximized ? 'w-full h-full' : 'w-full max-w-2xl h-[480px]'
        }`}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
              <TerminalIcon className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                AETHER // KERNEL_CLI
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                ACTIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLogs([])}
              className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
              title="Clear output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMaximized((prev) => !prev)}
              className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 text-cyan-100 bg-[#02050e]/80 select-text">
          <div className="text-slate-400 pb-2 border-b border-cyan-500/15">
            AETHER OS Holographic Subsystem Shell [Build 2026.10]
            <br />
            Type <span className="text-cyan-400 font-bold">help</span> to inspect executable kernel triggers.
          </div>

          {logs.map((log, index) => (
            <div
              key={index}
              className={
                log.startsWith('[ERR]')
                  ? 'text-rose-400'
                  : log.startsWith('[EXEC_OK]')
                  ? 'text-emerald-400'
                  : log.startsWith('$')
                  ? 'text-cyan-300 font-bold'
                  : 'text-slate-300'
              }
            >
              {log}
            </div>
          ))}
        </div>

        {/* Terminal Input */}
        <div className="p-3 border-t border-cyan-500/20 bg-cyan-950/20 flex items-center gap-2">
          <span className="font-mono text-xs text-cyan-400 font-bold">$ aether-cli &gt;</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCommand(inputVal);
              }
            }}
            placeholder="Type 'safe', 'deadlock', 'status', or 'help'..."
            className="flex-1 bg-transparent border-none text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => handleCommand(inputVal)}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>RUN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
