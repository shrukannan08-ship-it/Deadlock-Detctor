import type { SafeStateResultData, BankerStep, WorkProgressionPoint } from '../types/deadlock';

/**
 * Banker's Safety Algorithm / Safe State Determination
 * Reference: Silberschatz, Galvin, Gagne - Operating System Concepts
 */
export function checkSafeState(
  numProcesses: number,
  numResources: number,
  available: number[],
  allocation: number[][],
  need: number[][]
): SafeStateResultData {
  const initialAvailable = Array.from({ length: numResources }, (_, r) => available[r] ?? 0);
  const work = [...initialAvailable];
  const finish = new Array(numProcesses).fill(false);
  const safeSequence: string[] = [];
  const steps: BankerStep[] = [];
  const allEvaluationSteps: BankerStep[] = [];
  
  const workHistory: WorkProgressionPoint[] = [
    {
      stepLabel: 'Step 0 (Initial)',
      work: [...work],
    },
  ];

  let count = 0;
  let stepCounter = 1;
  let evaluationCounter = 1;
  let madeProgress = true;

  while (count < numProcesses && madeProgress) {
    madeProgress = false;

    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        const procNeed = Array.from({ length: numResources }, (_, r) => need[i]?.[r] ?? 0);
        const procAlloc = Array.from({ length: numResources }, (_, r) => allocation[i]?.[r] ?? 0);
        const processName = `P${i + 1}`;
        const workBefore = [...work];

        // Check if Need[i] <= Work
        const canFinish = procNeed.every((needVal, rIdx) => needVal <= work[rIdx]);

        if (canFinish) {
          for (let r = 0; r < numResources; r++) {
            work[r] += procAlloc[r];
          }

          finish[i] = true;
          madeProgress = true;
          count++;
          safeSequence.push(processName);

          const stepObj: BankerStep = {
            stepNumber: stepCounter++,
            process: processName,
            workBefore,
            need: procNeed,
            canExecute: true,
            allocation: procAlloc,
            workAfter: [...work],
            description: `Need: [${procNeed.join(', ')}] ≤ Work: [${workBefore.join(', ')}]. Process finishes and releases [${procAlloc.join(', ')}].`,
          };

          steps.push(stepObj);
          allEvaluationSteps.push({
            ...stepObj,
            stepNumber: evaluationCounter++,
          });

          workHistory.push({
            stepLabel: `Step ${stepCounter - 1} (${processName})`,
            process: processName,
            work: [...work],
          });

          // Restart scan to find next executable process in sequence
          break;
        } else {
          allEvaluationSteps.push({
            stepNumber: evaluationCounter++,
            process: processName,
            workBefore,
            need: procNeed,
            canExecute: false,
            allocation: procAlloc,
            workAfter: [...workBefore],
            description: `Need: [${procNeed.join(', ')}] > Work: [${workBefore.join(', ')}]. Process cannot execute yet, waiting for freed resources.`,
          });
        }
      }
    }
  }

  const isSafe = finish.every((val) => val === true);
  const unfinishedProcesses: string[] = [];
  const failedComparisons: Array<{
    process: string;
    need: number[];
    work: number[];
    failedResources: number[];
  }> = [];

  for (let i = 0; i < numProcesses; i++) {
    if (!finish[i]) {
      const processName = `P${i + 1}`;
      unfinishedProcesses.push(processName);
      const procNeed = Array.from({ length: numResources }, (_, r) => need[i]?.[r] ?? 0);
      const failedResources: number[] = [];
      procNeed.forEach((nVal, rIdx) => {
        if (nVal > work[rIdx]) {
          failedResources.push(rIdx);
        }
      });
      failedComparisons.push({
        process: processName,
        need: procNeed,
        work: [...work],
        failedResources,
      });
    }
  }

  const unsafeReasoning = isSafe
    ? undefined
    : {
        finalWorkAtHalt: [...work],
        failedComparisons,
        summary: `No remaining process satisfies: Need ≤ Work. Therefore a complete safe sequence cannot be formed.`,
      };

  const explanation = isSafe
    ? `The system is in a SAFE STATE. All ${numProcesses} processes can execute in the safe sequence ${safeSequence.join(' → ')} without deadlocking.`
    : `The system is in an UNSAFE STATE. No safe execution sequence exists for all processes. Blocked processes: ${unfinishedProcesses.join(', ')}.`;

  return {
    isSafe,
    safeSequence: isSafe ? safeSequence : [],
    initialAvailable,
    finalWork: [...work],
    steps,
    allEvaluationSteps,
    unfinishedProcesses,
    explanation,
    workHistory,
    unsafeReasoning,
  };
}

