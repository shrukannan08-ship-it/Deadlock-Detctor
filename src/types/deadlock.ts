export type SimulationStatus = 'ready' | 'running' | 'safe' | 'unsafe' | 'deadlocked';

export type ProcessState = 'waiting' | 'active' | 'completed' | 'blocked';

export interface BankerStep {
  stepNumber: number;
  process: string; // e.g. "P2"
  workBefore: number[]; // e.g. [3, 3, 2]
  need: number[]; // e.g. [1, 2, 2]
  canExecute: boolean;
  allocation: number[]; // e.g. [2, 0, 0]
  workAfter: number[]; // e.g. [5, 3, 2]
  description: string;
}

export interface WorkProgressionPoint {
  stepLabel: string; // "Step 0", "Step 1 (P2)", ...
  process?: string;
  work: number[]; // [R1, R2, R3]
}

export interface FailedProcessComparison {
  process: string;
  need: number[];
  work: number[];
  failedResources: number[]; // 0-indexed resource indices where Need > Work
}

export interface UnsafeReasoning {
  finalWorkAtHalt: number[];
  failedComparisons: FailedProcessComparison[];
  summary: string;
}

export interface SafeStateResultData {
  isSafe: boolean;
  safeSequence: string[]; // ['P2', 'P4', 'P1', 'P3', 'P5']
  initialAvailable: number[];
  finalWork: number[];
  steps: BankerStep[]; // Successful execution steps
  allEvaluationSteps: BankerStep[]; // Step-by-step full animation trace including failed attempts
  unfinishedProcesses: string[];
  explanation: string;
  workHistory: WorkProgressionPoint[];
  unsafeReasoning?: UnsafeReasoning;
}

export interface ResourceRequestResult {
  process: string;
  processIndex: number;
  request: number[];
  need: number[];
  available: number[];
  step1Pass: boolean; // Request <= Need
  step2Pass: boolean; // Request <= Available
  isSafe: boolean;
  granted: boolean;
  reason: string;
  newAvailable?: number[];
  newAllocation?: number[][];
  newNeed?: number[][];
  safeSequence?: string[];
  safeStateResult?: SafeStateResultData;
}

export interface DetectionStep {
  stepNumber: number;
  process: string;
  description: string;
  workBefore: number[];
  allocatedReleased: number[];
  workAfter: number[];
  status: 'released' | 'waiting' | 'blocked';
}

export interface DetectionResultData {
  isDeadlocked: boolean;
  deadlockedProcesses: string[]; // e.g. ['P1', 'P2']
  resolvedProcesses: string[];
  steps: DetectionStep[];
  involvedResources?: string[];
}

