import type { DetectionResultData, DetectionStep } from '../types/deadlock';

/**
 * Standard OS Deadlock Detection Algorithm (Multiple / Single Instance Resource Types)
 * Reference: Silberschatz, Galvin, Gagne - Operating System Concepts
 */
export function detectDeadlock(
  numProcesses: number,
  numResources: number,
  available: number[],
  allocation: number[][],
  request: number[][]
): DetectionResultData {
  const work = Array.from({ length: numResources }, (_, r) => available[r] ?? 0);
  const finish = new Array(numProcesses).fill(false);
  const steps: DetectionStep[] = [];
  const resolvedProcesses: string[] = [];

  // Step 1 & 2: Initialize finish array
  for (let i = 0; i < numProcesses; i++) {
    const procAlloc = Array.from({ length: numResources }, (_, r) => allocation[i]?.[r] ?? 0);
    const hasAllocation = procAlloc.some((val) => val > 0);
    if (!hasAllocation) {
      finish[i] = true; // Process with no resources held cannot block others
    }
  }

  let found = true;
  let stepCounter = 1;

  while (found) {
    found = false;

    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        const procReq = Array.from({ length: numResources }, (_, r) => request[i]?.[r] ?? 0);
        const procAlloc = Array.from({ length: numResources }, (_, r) => allocation[i]?.[r] ?? 0);

        // Check if Request[i] <= Work
        const canExecute = procReq.every((reqVal, rIdx) => reqVal <= work[rIdx]);

        if (canExecute) {
          const workBefore = [...work];
          const released = [...procAlloc];

          // Work = Work + Allocation[i]
          for (let r = 0; r < numResources; r++) {
            work[r] += procAlloc[r];
          }

          finish[i] = true;
          found = true;
          resolvedProcesses.push(`P${i + 1}`);

          steps.push({
            stepNumber: stepCounter++,
            process: `P${i + 1}`,
            description: `Process P${i + 1} request [${procReq.join(', ')}] can be satisfied with available Work [${workBefore.join(', ')}]. It completes and releases its allocation [${released.join(', ')}].`,
            workBefore,
            allocatedReleased: released,
            workAfter: [...work],
            status: 'released',
          });

          // Restart search to allow any previously blocked process to execute with newly freed resources
          break;
        }
      }
    }
  }

  const deadlockedProcesses: string[] = [];
  for (let i = 0; i < numProcesses; i++) {
    if (!finish[i]) {
      deadlockedProcesses.push(`P${i + 1}`);
    }
  }

  // Identify resources involved in deadlock (requested or held by deadlocked processes)
  const involvedResourcesSet = new Set<string>();
  if (deadlockedProcesses.length > 0) {
    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        for (let r = 0; r < numResources; r++) {
          const reqVal = request[i]?.[r] ?? 0;
          const allocVal = allocation[i]?.[r] ?? 0;
          if (reqVal > 0 || allocVal > 0) {
            involvedResourcesSet.add(`R${r + 1}`);
          }
        }
      }
    }
  }

  return {
    isDeadlocked: deadlockedProcesses.length > 0,
    deadlockedProcesses,
    resolvedProcesses,
    steps,
    involvedResources: Array.from(involvedResourcesSet),
  };
}
