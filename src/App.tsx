import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar, type NavSection } from './components/Sidebar';
import { MetricCards } from './components/MetricCards';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { ActionControls } from './components/ActionControls';
import { SimulationPlayer } from './components/SimulationPlayer';
import { SafeSequenceCard } from './components/SafeSequenceCard';
import { UnsafeExplanationCard } from './components/UnsafeExplanationCard';
import { DetectionResult } from './components/DetectionResult';
import { ExecutionTraceTable } from './components/ExecutionTraceTable';
import { MatrixSection } from './components/MatrixSection';
import { ResourceOverview } from './components/ResourceOverview';
import { AnalyticsSection } from './components/AnalyticsSection';
import { ResourceGraph } from './components/ResourceGraph';
import { SimulationActivity } from './components/SimulationActivity';
import { ResourceRequestSection } from './components/ResourceRequestSection';
import { ProcessInspectorDrawer } from './components/ProcessInspectorDrawer';
import { AmbientBackground } from './components/AmbientBackground';
import { SystemDock } from './components/SystemDock';
import { HolographicTerminal } from './components/HolographicTerminal';
import { QuickHelpModal } from './components/QuickHelpModal';
import { detectDeadlock } from './algorithms/deadlockDetection';
import { checkSafeState } from './algorithms/safeState';
import type {
  DetectionResultData,
  SafeStateResultData,
  ProcessState,
  SimulationStatus,
} from './types/deadlock';

/**
 * Creates or resizes a 2D matrix of shape [numRows x numCols].
 */
function createOrResizeMatrix(
  existing: number[][],
  numRows: number,
  numCols: number,
  defaultValue = 0
): number[][] {
  const result: number[][] = [];
  for (let r = 0; r < numRows; r++) {
    const row: number[] = [];
    for (let c = 0; c < numCols; c++) {
      row.push(existing[r]?.[c] ?? defaultValue);
    }
    result.push(row);
  }
  return result;
}

/**
 * Creates or resizes a 1D vector of length numCols.
 */
function createOrResizeVector(
  existing: number[],
  numCols: number,
  defaultValue = 0
): number[] {
  const result: number[] = [];
  for (let c = 0; c < numCols; c++) {
    result.push(existing[c] ?? defaultValue);
  }
  return result;
}

// Initial standard textbook scenario matching media_1791198996777.png (5 processes, 3 resources)
const DEFAULT_NUM_PROCESSES = 5;
const DEFAULT_NUM_RESOURCES = 3;

export function App() {
  const [numProcesses, setNumProcesses] = useState<number>(DEFAULT_NUM_PROCESSES);
  const [numResources, setNumResources] = useState<number>(DEFAULT_NUM_RESOURCES);

  // Navigation & Search State
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Total Resources Vector (User specified capacity)
  const [totalResources, setTotalResources] = useState<number[]>([10, 5, 7]);

  // Allocation Matrix (Rows: P1..Pn, Cols: R1..Rm)
  const [allocation, setAllocation] = useState<number[][]>([
    [0, 1, 0], // P1
    [2, 0, 0], // P2
    [3, 0, 2], // P3
    [2, 1, 1], // P4
    [0, 0, 2], // P5
  ]);

  // Maximum Matrix (Max Demand) - matching media_1791198996777.png
  const [maxMatrix, setMaxMatrix] = useState<number[][]>([
    [7, 5, 3], // P1
    [3, 2, 2], // P2
    [9, 0, 2], // P3
    [4, 2, 2], // P4
    [5, 3, 3], // P5
  ]);

  // Request Matrix (Rows: P1..Pn, Cols: R1..Rm - For Deadlock Detection)
  const [requestMatrix, setRequestMatrix] = useState<number[][]>([
    [7, 4, 3], // P1
    [1, 2, 2], // P2
    [6, 0, 0], // P3
    [0, 1, 1], // P4
    [4, 3, 1], // P5
  ]);

  const [detectionResult, setDetectionResult] = useState<DetectionResultData | null>(null);
  const [safeStateResult, setSafeStateResult] = useState<SafeStateResultData | null>(null);

  // Animation & Playback States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 0.5 (slow), 1 (normal), 2 (fast)

  // Process Inspector State
  const [inspectedProcess, setInspectedProcess] = useState<string | null>(null);

  // Holographic OS Shell & Guide Modals
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);


  // AUTOMATICALLY CALCULATE NEED MATRIX:
  // Need[i][j] = max(0, Max[i][j] - Allocation[i][j])
  const needMatrix = useMemo(() => {
    return Array.from({ length: numProcesses }).map((_, p) =>
      Array.from({ length: numResources }).map((_, r) => {
        const maxVal = maxMatrix[p]?.[r] ?? 0;
        const allocVal = allocation[p]?.[r] ?? 0;
        return Math.max(0, maxVal - allocVal);
      })
    );
  }, [numProcesses, numResources, maxMatrix, allocation]);

  // AUTOMATICALLY CALCULATE AVAILABLE RESOURCES:
  // Available[j] = max(0, Total[j] - sum(Allocation[i][j]))
  const available = useMemo(() => {
    return Array.from({ length: numResources }).map((_, rIdx) => {
      let allocatedSum = 0;
      for (let pIdx = 0; pIdx < numProcesses; pIdx++) {
        allocatedSum += allocation[pIdx]?.[rIdx] ?? 0;
      }
      const totalVal = totalResources[rIdx] ?? 0;
      return Math.max(0, totalVal - allocatedSum);
    });
  }, [numProcesses, numResources, totalResources, allocation]);

  // Dynamic status badge
  const overallStatus = useMemo<SimulationStatus>(() => {
    if (isPlaying) return 'running';
    if (detectionResult?.isDeadlocked) return 'deadlocked';
    if (safeStateResult?.isSafe) return 'safe';
    if (safeStateResult && !safeStateResult.isSafe) return 'unsafe';
    return 'ready';
  }, [isPlaying, detectionResult, safeStateResult]);

  // Process Labels
  const processesList = useMemo(() => {
    return Array.from({ length: numProcesses }, (_, i) => `P${i + 1}`);
  }, [numProcesses]);

  // Evaluation steps for animation
  const evaluationSteps = useMemo(() => {
    return safeStateResult?.allEvaluationSteps ?? [];
  }, [safeStateResult]);

  const currentStep = useMemo(() => {
    if (evaluationSteps.length === 0 || currentStepIndex >= evaluationSteps.length) {
      return null;
    }
    return evaluationSteps[currentStepIndex];
  }, [evaluationSteps, currentStepIndex]);

  // Dynamic process states based on current animation step
  const processStates = useMemo<Record<string, ProcessState>>(() => {
    const states: Record<string, ProcessState> = {};
    for (let i = 1; i <= numProcesses; i++) {
      states[`P${i}`] = 'waiting';
    }

    if (!safeStateResult || evaluationSteps.length === 0) return states;

    for (let i = 0; i <= currentStepIndex && i < evaluationSteps.length; i++) {
      const s = evaluationSteps[i];
      if (s.canExecute) {
        states[s.process] = 'completed';
      }
    }

    if (currentStepIndex >= 0 && currentStepIndex < evaluationSteps.length) {
      const active = evaluationSteps[currentStepIndex];
      if (states[active.process] !== 'completed') {
        states[active.process] = 'active';
      }
    }

    return states;
  }, [numProcesses, safeStateResult, evaluationSteps, currentStepIndex]);

  // Inspector process data lookup
  const inspectedProcessData = useMemo(() => {
    if (!inspectedProcess) return null;
    const match = inspectedProcess.match(/P(\d+)/i);
    if (!match) return null;
    const pIdx = parseInt(match[1], 10) - 1;
    if (pIdx < 0 || pIdx >= numProcesses) return null;

    return {
      processName: inspectedProcess,
      allocation: allocation[pIdx] || [],
      maxDemand: maxMatrix[pIdx] || [],
      need: needMatrix[pIdx] || [],
      state: processStates[inspectedProcess] || 'waiting',
      isDeadlocked: detectionResult?.deadlockedProcesses?.includes(inspectedProcess) || false,
    };
  }, [inspectedProcess, numProcesses, allocation, maxMatrix, needMatrix, processStates, detectionResult]);

  // Real-time animation interval effect
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(300, Math.floor(1000 / playSpeed));
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= evaluationSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, playSpeed, evaluationSteps.length]);

  // Navigation smooth scroll
  const handleNavigateSection = useCallback((section: NavSection) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      const yOffset = -70; // Header offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  // OS Global Keyboard Shortcuts (1-7 dock navigation, ~ for CLI, ? for help)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      } else if (e.key >= '1' && e.key <= '7') {
        const sections: NavSection[] = [
          'overview',
          'simulation',
          'trace',
          'matrices',
          'resources',
          'analytics',
          'request',
        ];
        const targetSection = sections[parseInt(e.key, 10) - 1];
        if (targetSection) {
          handleNavigateSection(targetSection);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNavigateSection]);

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections: NavSection[] = [
        'overview',
        'simulation',
        'trace',
        'matrices',
        'resources',
        'analytics',
        'request',
      ];
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Process Count Change
  const handleNumProcessesChange = useCallback(
    (newNumProcesses: number) => {
      setNumProcesses(newNumProcesses);
      setAllocation((prev) => createOrResizeMatrix(prev, newNumProcesses, numResources, 0));
      setMaxMatrix((prev) => createOrResizeMatrix(prev, newNumProcesses, numResources, 5));
      setRequestMatrix((prev) => createOrResizeMatrix(prev, newNumProcesses, numResources, 0));
      setDetectionResult(null);
      setSafeStateResult(null);
      setIsPlaying(false);
      setCurrentStepIndex(0);
    },
    [numResources]
  );

  // Resource Count Change
  const handleNumResourcesChange = useCallback(
    (newNumResources: number) => {
      setNumResources(newNumResources);
      setTotalResources((prev) => createOrResizeVector(prev, newNumResources, 10));
      setAllocation((prev) => createOrResizeMatrix(prev, numProcesses, newNumResources, 0));
      setMaxMatrix((prev) => createOrResizeMatrix(prev, numProcesses, newNumResources, 5));
      setRequestMatrix((prev) => createOrResizeMatrix(prev, numProcesses, newNumResources, 0));
      setDetectionResult(null);
      setSafeStateResult(null);
      setIsPlaying(false);
      setCurrentStepIndex(0);
    },
    [numProcesses]
  );

  // Update Total Resources vector
  const handleTotalChange = useCallback((resourceIndex: number, val: number) => {
    setTotalResources((prev) => {
      const next = createOrResizeVector(prev, numResources, 0);
      next[resourceIndex] = val;
      return next;
    });
    setDetectionResult(null);
    setSafeStateResult(null);
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, [numResources]);

  // Update single cell in Allocation Matrix
  const handleAllocationChange = useCallback((row: number, column: number, value: number) => {
    setAllocation((prev) => {
      return prev.map((rArr, rIdx) => {
        if (rIdx !== row) return [...rArr];
        return rArr.map((cVal, cIdx) => (cIdx === column ? value : cVal));
      });
    });
    // Ensure Max >= Allocation
    setMaxMatrix((prev) => {
      return prev.map((rArr, rIdx) => {
        if (rIdx !== row) return [...rArr];
        return rArr.map((cVal, cIdx) => (cIdx === column ? Math.max(cVal, value) : cVal));
      });
    });
    setDetectionResult(null);
    setSafeStateResult(null);
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  // Update single cell in Maximum Matrix
  const handleMaxChange = useCallback((row: number, column: number, value: number) => {
    setMaxMatrix((prev) => {
      return prev.map((rArr, rIdx) => {
        if (rIdx !== row) return [...rArr];
        return rArr.map((cVal, cIdx) => (cIdx === column ? value : cVal));
      });
    });
    setDetectionResult(null);
    setSafeStateResult(null);
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  // Update single cell in Request Matrix
  const handleRequestChange = useCallback((row: number, column: number, value: number) => {
    setRequestMatrix((prev) => {
      return prev.map((rArr, rIdx) => {
        if (rIdx !== row) return [...rArr];
        return rArr.map((cVal, cIdx) => (cIdx === column ? value : cVal));
      });
    });
    setDetectionResult(null);
    setSafeStateResult(null);
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  // Initialize Simulation Matrix grids
  const handleInitialize = useCallback(() => {
    setAllocation(
      Array.from({ length: numProcesses }, () => new Array(numResources).fill(0))
    );
    setMaxMatrix(
      Array.from({ length: numProcesses }, () => new Array(numResources).fill(5))
    );
    setRequestMatrix(
      Array.from({ length: numProcesses }, () => new Array(numResources).fill(0))
    );
    setTotalResources(new Array(numResources).fill(10));
    setDetectionResult(null);
    setSafeStateResult(null);
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, [numProcesses, numResources]);

  // Reset Simulation back to default textbook scenario
  const handleReset = useCallback(() => {
    setNumProcesses(DEFAULT_NUM_PROCESSES);
    setNumResources(DEFAULT_NUM_RESOURCES);
    setTotalResources([10, 5, 7]);
    setAllocation([
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2],
    ]);
    setMaxMatrix([
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [4, 2, 2],
      [5, 3, 3],
    ]);
    setRequestMatrix([
      [7, 4, 3],
      [1, 2, 2],
      [6, 0, 0],
      [0, 1, 1],
      [4, 3, 1],
    ]);
    setDetectionResult(null);
    setSafeStateResult(null);
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setInspectedProcess(null);
    setSearchQuery('');
  }, []);

  // Apply Granted Resource Request
  const handleApplyRequest = useCallback(
    (_newAvailable: number[], newAllocation: number[][], _processName: string) => {
      setAllocation(newAllocation);
      setDetectionResult(null);

      // Recompute safety on updated state with needMatrix
      const result = checkSafeState(
        numProcesses,
        numResources,
        available,
        newAllocation,
        needMatrix
      );
      setSafeStateResult(result);
      setCurrentStepIndex(0);
    },
    [numProcesses, numResources, available, needMatrix]
  );

  // Run Deadlock Detection (uses actual requestMatrix)
  const handleDetectDeadlock = useCallback(() => {
    const result = detectDeadlock(
      numProcesses,
      numResources,
      available,
      allocation,
      requestMatrix
    );
    setDetectionResult(result);
  }, [numProcesses, numResources, available, allocation, requestMatrix]);

  // Run Banker's Safety Algorithm (uses actual needMatrix)
  const handleCheckSafeState = useCallback(() => {
    const result = checkSafeState(
      numProcesses,
      numResources,
      available,
      allocation,
      needMatrix
    );
    setSafeStateResult(result);
    setCurrentStepIndex(0);
  }, [numProcesses, numResources, available, allocation, needMatrix]);

  // Simulation Player controls
  const handlePlay = useCallback(() => {
    if (!safeStateResult) {
      const result = checkSafeState(
        numProcesses,
        numResources,
        available,
        allocation,
        needMatrix
      );
      setSafeStateResult(result);
    }
    if (currentStepIndex >= evaluationSteps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [safeStateResult, numProcesses, numResources, available, allocation, needMatrix, currentStepIndex, evaluationSteps.length]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleNextStep = useCallback(() => {
    if (!safeStateResult) {
      handleCheckSafeState();
    }
    setCurrentStepIndex((prev) => Math.min(prev + 1, evaluationSteps.length - 1));
  }, [safeStateResult, handleCheckSafeState, evaluationSteps.length]);

  const handlePrevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleResetAnimation = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  return (
    <div className="min-h-screen bg-[#03060d] text-slate-100 flex font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* 0. Ambient Holographic Background & Digital Dust Canvas */}
      <AmbientBackground />

      {/* 1. LEFT SIDEBAR */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleNavigateSection}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        status={overallStatus}
        numProcesses={numProcesses}
        numResources={numResources}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0 relative z-10 pb-20 sm:pb-24">
        {/* 2. TOP HEADER */}
        <Header
          status={overallStatus}
          onReset={handleReset}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenTerminal={() => setIsTerminalOpen(true)}
          onOpenQuickHelp={() => setIsHelpOpen(true)}
        />

        {/* Process Inspector Slide-over Drawer */}
        {inspectedProcessData && (
          <ProcessInspectorDrawer
            isOpen={Boolean(inspectedProcess)}
            onClose={() => setInspectedProcess(null)}
            processName={inspectedProcessData.processName}
            numResources={numResources}
            allocation={inspectedProcessData.allocation}
            maxDemand={inspectedProcessData.maxDemand}
            need={inspectedProcessData.need}
            available={available}
            state={inspectedProcessData.state}
            isDeadlocked={inspectedProcessData.isDeadlocked}
          />
        )}

        {/* 3. MAIN DASHBOARD CONTENT */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* A. OVERVIEW / STATUS CARDS */}
          <section id="overview" className="scroll-mt-20">
            <MetricCards
              numProcesses={numProcesses}
              numResources={numResources}
              status={overallStatus}
              totalResources={totalResources}
              safeSequenceCount={safeStateResult?.safeSequence?.length || 0}
            />
          </section>

          {/* B. SIMULATION SETUP & SIMULATOR ACTIONS */}
          <section id="simulation" className="scroll-mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7">
                <ConfigurationPanel
                  numProcesses={numProcesses}
                  numResources={numResources}
                  onNumProcessesChange={handleNumProcessesChange}
                  onNumResourcesChange={handleNumResourcesChange}
                  onInitialize={handleInitialize}
                  onReset={handleReset}
                />
              </div>
              <div className="lg:col-span-5">
                <ActionControls
                  onCheckSafeState={handleCheckSafeState}
                  onDetectDeadlock={handleDetectDeadlock}
                  onReset={handleReset}
                  isInvalid={false}
                />
              </div>
            </div>
          </section>

          {/* C. REAL-TIME ALGORITHM SIMULATOR & EXECUTION TRACE LOG (matching media_1791198998020.png & media_1791198999718.png) */}
          <section id="trace" className="scroll-mt-20 space-y-5">
            {/* Player & Process Lifecycle Monitor */}
            <SimulationPlayer
              isPlaying={isPlaying}
              currentStepIndex={currentStepIndex}
              totalSteps={evaluationSteps.length}
              currentStep={currentStep}
              onPlay={handlePlay}
              onPause={handlePause}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
              onReset={handleResetAnimation}
              playSpeed={playSpeed}
              onSpeedChange={setPlaySpeed}
              processes={processesList}
              processStates={processStates}
              onSelectProcess={(pName) => setInspectedProcess(pName)}
              searchQuery={searchQuery}
            />

            {/* Results row: Safe Sequence / Deadlock Results + Execution Trace Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-5 space-y-4">
                {/* Safe State Result Card */}
                <SafeSequenceCard
                  isSafe={safeStateResult ? safeStateResult.isSafe : null}
                  safeSequence={safeStateResult?.safeSequence || []}
                  processStates={processStates}
                  explanation={safeStateResult?.explanation}
                  onSelectProcess={(pName) => setInspectedProcess(pName)}
                />

                {/* Unsafe State Explanation */}
                {safeStateResult && !safeStateResult.isSafe && (
                  <UnsafeExplanationCard reasoning={safeStateResult.unsafeReasoning} />
                )}

                {/* Deadlock Detection Result Card (matching media_1791199006566.png) */}
                {detectionResult && (
                  <DetectionResult result={detectionResult} />
                )}
              </div>

              <div className="lg:col-span-7">
                {/* Execution Trace Table (matching media_1791198999718.png) */}
                <ExecutionTraceTable
                  steps={safeStateResult?.steps || []}
                  currentStepNumber={currentStep?.stepNumber}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          </section>

          {/* D. MATRICES WORKSPACE (matching media_1791198996777.png: Allocation, Maximum, Need, Request) */}
          <section id="matrices" className="scroll-mt-20">
            <MatrixSection
              numProcesses={numProcesses}
              numResources={numResources}
              allocation={allocation}
              maxMatrix={maxMatrix}
              needMatrix={needMatrix}
              requestMatrix={requestMatrix}
              onAllocationChange={handleAllocationChange}
              onMaxChange={handleMaxChange}
              onRequestChange={handleRequestChange}
              deadlockedProcesses={detectionResult?.deadlockedProcesses}
              activeProcess={currentStep?.process}
              onSelectProcess={(pName) => setInspectedProcess(pName)}
              searchQuery={searchQuery}
            />
          </section>

          {/* E. AVAILABLE RESOURCES MONITOR */}
          <section id="resources" className="scroll-mt-20">
            <ResourceOverview
              numResources={numResources}
              numProcesses={numProcesses}
              totalResources={totalResources}
              allocation={allocation}
              available={available}
              onTotalChange={handleTotalChange}
              searchQuery={searchQuery}
            />
          </section>

          {/* F. GRAPH & ANALYTICS (matching media_1791199001191.png Analytics + RAG Diagram + Activity Stream) */}
          <section id="analytics" className="scroll-mt-20 space-y-5">
            {/* Simulation Analytics & Resource Metrics matching media_1791199001191.png */}
            <AnalyticsSection
              numProcesses={numProcesses}
              allocation={allocation}
              maxMatrix={maxMatrix}
              totalResources={totalResources}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7">
                <ResourceGraph
                  numProcesses={numProcesses}
                  numResources={numResources}
                  allocation={allocation}
                  requestMatrix={requestMatrix}
                  available={available}
                  totalResources={totalResources}
                  safeSequence={safeStateResult?.safeSequence}
                  deadlockedProcesses={detectionResult?.deadlockedProcesses}
                  onSelectProcess={(pName) => setInspectedProcess(pName)}
                  searchQuery={searchQuery}
                />
              </div>

              <div className="lg:col-span-5">
                <SimulationActivity
                  detectionSteps={detectionResult?.steps}
                  bankerSteps={safeStateResult?.steps}
                  isDeadlocked={detectionResult?.isDeadlocked}
                  isSafe={safeStateResult ? safeStateResult.isSafe : null}
                />
              </div>
            </div>
          </section>

          {/* G. RESOURCE REQUEST / PREVENTION */}
          <section id="request" className="scroll-mt-20">
            <ResourceRequestSection
              numProcesses={numProcesses}
              numResources={numResources}
              available={available}
              allocation={allocation}
              needMatrix={needMatrix}
              onApplyRequest={handleApplyRequest}
            />
          </section>

        </main>

        {/* AETHER OS Footer */}
        <footer className="border-t border-cyan-500/15 bg-[#02050f]/80 py-4 px-6 text-center text-xs font-mono text-cyan-400/80">
          AETHER OS Holographic Terminal • Banker’s Safety Engine & Concurrency Kernel v3.2
        </footer>
      </div>

      {/* Floating System Dock with Interactive Shortcuts */}
      <SystemDock
        activeSection={activeSection}
        onSelectSection={handleNavigateSection}
        status={overallStatus}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onOpenQuickHelp={() => setIsHelpOpen(true)}
        onCheckSafeState={handleCheckSafeState}
        onDetectDeadlock={handleDetectDeadlock}
      />

      {/* Holographic Interactive CLI Terminal */}
      <HolographicTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        status={overallStatus}
        numProcesses={numProcesses}
        numResources={numResources}
        available={available}
        onRunSafeCheck={handleCheckSafeState}
        onRunDeadlockDetect={handleDetectDeadlock}
      />

      {/* OS Quick Architecture & Hotkey Guide */}
      <QuickHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default App;
