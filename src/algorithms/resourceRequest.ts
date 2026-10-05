import { checkSafeState } from './safeState';
import type { ResourceRequestResult } from '../types/deadlock';

/**
 * Banker's Resource-Request Algorithm
 * Reference: Operating System Concepts (Silberschatz, Galvin, Gagne)
 */
export function evaluateResourceRequest(
  processIndex: number,
  request: number[],
  numProcesses: number,
  numResources: number,
  available: number[],
  allocation: number[][],
  need: number[][]
): ResourceRequestResult {
  const processName = `P${processIndex + 1}`;
  const procNeed = Array.from({ length: numResources }, (_, r) => need[processIndex]?.[r] ?? 0);
  const currentAvailable = Array.from({ length: numResources }, (_, r) => available[r] ?? 0);

  // 1. Check: Request <= Need
  for (let r = 0; r < numResources; r++) {
    const reqVal = request[r] ?? 0;
    const needVal = procNeed[r] ?? 0;
    if (reqVal > needVal) {
      return {
        process: processName,
        processIndex,
        request,
        need: procNeed,
        available: currentAvailable,
        step1Pass: false,
        step2Pass: false,
        isSafe: false,
        granted: false,
        reason: `Process ${processName} requested ${reqVal} instance(s) of R${r + 1}, exceeding its Need of ${needVal}. Error: Process has exceeded its maximum claim.`,
      };
    }
  }

  // 2. Check: Request <= Available
  for (let r = 0; r < numResources; r++) {
    const reqVal = request[r] ?? 0;
    const availVal = currentAvailable[r] ?? 0;
    if (reqVal > availVal) {
      return {
        process: processName,
        processIndex,
        request,
        need: procNeed,
        available: currentAvailable,
        step1Pass: true,
        step2Pass: false,
        isSafe: false,
        granted: false,
        reason: `Process ${processName} requested ${reqVal} instance(s) of R${r + 1}, but only ${availVal} is currently Available. Process must wait until resources are freed.`,
      };
    }
  }

  // 3. Pretend to allocate requested resources (tentative state)
  const tempAvailable = currentAvailable.map((availVal, r) => availVal - (request[r] ?? 0));
  const tempAllocation = allocation.map((row, p) => {
    if (p !== processIndex) return [...row];
    return row.map((allocVal, r) => allocVal + (request[r] ?? 0));
  });
  const tempNeed = need.map((row, p) => {
    if (p !== processIndex) return [...row];
    return row.map((needVal, r) => needVal - (request[r] ?? 0));
  });

  // 4. Run Safety Check on tentative state
  const safeResult = checkSafeState(
    numProcesses,
    numResources,
    tempAvailable,
    tempAllocation,
    tempNeed
  );

  if (safeResult.isSafe) {
    return {
      process: processName,
      processIndex,
      request,
      need: procNeed,
      available: currentAvailable,
      step1Pass: true,
      step2Pass: true,
      isSafe: true,
      granted: true,
      reason: `Granting request leaves system in a SAFE STATE. Safe sequence exists: ${safeResult.safeSequence.join(' → ')}.`,
      newAvailable: tempAvailable,
      newAllocation: tempAllocation,
      newNeed: tempNeed,
      safeSequence: safeResult.safeSequence,
      safeStateResult: safeResult,
    };
  } else {
    return {
      process: processName,
      processIndex,
      request,
      need: procNeed,
      available: currentAvailable,
      step1Pass: true,
      step2Pass: true,
      isSafe: false,
      granted: false,
      reason: `Granting this request would result in an UNSAFE STATE. Safe sequence cannot be completed. Request is DENIED and state rolled back.`,
      safeStateResult: safeResult,
    };
  }
}
