#include "prevention.h"
#include <stdio.h>
#include <string.h>

void check_safe_state_custom(int num_proc, int num_res,
                             const int *available,
                             const int alloc[][MAX_RESOURCES],
                             const int need[][MAX_RESOURCES],
                             SafeStateResult *result) {
    if (!result) return;
    memset(result, 0, sizeof(SafeStateResult));
    result->num_processes = num_proc;
    result->num_resources = num_res;

    int work[MAX_RESOURCES];
    bool finish[MAX_PROCESSES];

    for (int r = 0; r < num_res; r++) {
        result->initial_available[r] = available[r];
        work[r] = available[r];
    }

    for (int i = 0; i < num_proc; i++) {
        finish[i] = false;
    }

    int count = 0;
    int step_counter = 1;
    int eval_counter = 1;
    bool made_progress = true;

    while (count < num_proc && made_progress) {
        made_progress = false;

        for (int i = 0; i < num_proc; i++) {
            if (!finish[i]) {
                bool can_finish = true;
                for (int r = 0; r < num_res; r++) {
                    if (need[i][r] > work[r]) {
                        can_finish = false;
                        break;
                    }
                }

                if (can_finish) {
                    BankerStep *step = &result->steps[result->step_count];
                    step->step_number = step_counter++;
                    step->process_index = i;
                    snprintf(step->process_name, sizeof(step->process_name), "P%d", i + 1);
                    step->can_execute = true;

                    for (int r = 0; r < num_res; r++) {
                        step->work_before[r] = work[r];
                        step->need[r] = need[i][r];
                        step->allocation[r] = alloc[i][r];
                        work[r] += alloc[i][r];
                        step->work_after[r] = work[r];
                    }

                    /* Format description */
                    char need_str[64] = "", work_str[64] = "", alloc_str[64] = "";
                    int n_pos = 0, w_pos = 0, a_pos = 0;
                    for (int r = 0; r < num_res; r++) {
                        n_pos += snprintf(need_str + n_pos, sizeof(need_str) - n_pos, "%s%d", (r > 0 ? ", " : ""), step->need[r]);
                        w_pos += snprintf(work_str + w_pos, sizeof(work_str) - w_pos, "%s%d", (r > 0 ? ", " : ""), step->work_before[r]);
                        a_pos += snprintf(alloc_str + a_pos, sizeof(alloc_str) - a_pos, "%s%d", (r > 0 ? ", " : ""), step->allocation[r]);
                    }
                    snprintf(step->description, sizeof(step->description),
                             "Need: [%s] <= Work: [%s]. Process finishes and releases [%s].",
                             need_str, work_str, alloc_str);

                    /* Also record into all_eval_steps */
                    if (result->all_eval_step_count < MAX_STEPS) {
                        BankerStep *eval_step = &result->all_eval_steps[result->all_eval_step_count++];
                        *eval_step = *step;
                        eval_step->step_number = eval_counter++;
                    }

                    result->step_count++;
                    finish[i] = true;
                    made_progress = true;
                    result->safe_sequence[result->safe_sequence_count++] = i;
                    count++;
                    break; /* Restart scan to find next executable process */
                } else {
                    /* Record failed evaluation attempt */
                    if (result->all_eval_step_count < MAX_STEPS) {
                        BankerStep *eval_step = &result->all_eval_steps[result->all_eval_step_count++];
                        eval_step->step_number = eval_counter++;
                        eval_step->process_index = i;
                        snprintf(eval_step->process_name, sizeof(eval_step->process_name), "P%d", i + 1);
                        eval_step->can_execute = false;

                        for (int r = 0; r < num_res; r++) {
                            eval_step->work_before[r] = work[r];
                            eval_step->need[r] = need[i][r];
                            eval_step->allocation[r] = alloc[i][r];
                            eval_step->work_after[r] = work[r];
                        }

                        char need_str[64] = "", work_str[64] = "";
                        int n_pos = 0, w_pos = 0;
                        for (int r = 0; r < num_res; r++) {
                            n_pos += snprintf(need_str + n_pos, sizeof(need_str) - n_pos, "%s%d", (r > 0 ? ", " : ""), eval_step->need[r]);
                            w_pos += snprintf(work_str + w_pos, sizeof(work_str) - w_pos, "%s%d", (r > 0 ? ", " : ""), eval_step->work_before[r]);
                        }
                        snprintf(eval_step->description, sizeof(eval_step->description),
                                 "Need: [%s] > Work: [%s]. Process cannot execute yet, waiting for freed resources.",
                                 need_str, work_str);
                    }
                }
            }
        }
    }

    for (int r = 0; r < num_res; r++) {
        result->final_work[r] = work[r];
    }

    bool all_finished = true;
    for (int i = 0; i < num_proc; i++) {
        if (!finish[i]) {
            all_finished = false;
            result->unfinished_processes[result->unfinished_count++] = i;
        }
    }

    result->is_safe = all_finished;

    if (result->is_safe) {
        char seq_str[128] = "";
        int s_pos = 0;
        for (int s = 0; s < result->safe_sequence_count; s++) {
            s_pos += snprintf(seq_str + s_pos, sizeof(seq_str) - s_pos, "%sP%d", (s > 0 ? " -> " : ""), result->safe_sequence[s] + 1);
        }
        snprintf(result->explanation, sizeof(result->explanation),
                 "The system is in a SAFE STATE. All %d processes can execute in the safe sequence %s without deadlocking.",
                 num_proc, seq_str);
    } else {
        result->has_unsafe_reasoning = true;
        UnsafeReasoning *ur = &result->unsafe_reasoning;
        for (int r = 0; r < num_res; r++) {
            ur->final_work_at_halt[r] = work[r];
        }
        ur->failed_comparison_count = 0;

        char unfin_str[128] = "";
        int u_pos = 0;
        for (int idx = 0; idx < result->unfinished_count; idx++) {
            int p = result->unfinished_processes[idx];
            u_pos += snprintf(unfin_str + u_pos, sizeof(unfin_str) - u_pos, "%sP%d", (idx > 0 ? ", " : ""), p + 1);

            FailedProcessComparison *fc = &ur->failed_comparisons[ur->failed_comparison_count++];
            fc->process_index = p;
            snprintf(fc->process_name, sizeof(fc->process_name), "P%d", p + 1);
            fc->failed_resource_count = 0;

            for (int r = 0; r < num_res; r++) {
                fc->need[r] = need[p][r];
                fc->work[r] = work[r];
                if (need[p][r] > work[r]) {
                    fc->failed_resources[fc->failed_resource_count++] = r;
                }
            }
        }

        snprintf(ur->summary, sizeof(ur->summary),
                 "No remaining process satisfies: Need <= Work. Therefore a complete safe sequence cannot be formed.");
        snprintf(result->explanation, sizeof(result->explanation),
                 "The system is in an UNSAFE STATE. No safe execution sequence exists for all processes. Blocked processes: %s.",
                 unfin_str);
    }
}

void check_safe_state(const SimulatorState *state, SafeStateResult *result) {
    if (!state || !result) return;
    check_safe_state_custom(state->num_processes, state->num_resources,
                            state->available, state->allocation, state->need_matrix,
                            result);
}

void evaluate_resource_request(int process_index,
                               const int *request,
                               const SimulatorState *state,
                               ResourceRequestResult *result) {
    if (!state || !result) return;
    memset(result, 0, sizeof(ResourceRequestResult));

    result->process_index = process_index;
    snprintf(result->process_name, sizeof(result->process_name), "P%d", process_index + 1);

    int num_p = state->num_processes;
    int num_r = state->num_resources;

    for (int r = 0; r < num_r; r++) {
        result->request[r] = request[r];
        result->need[r] = state->need_matrix[process_index][r];
        result->available[r] = state->available[r];
    }

    /* 1. Step 1: Request <= Need */
    for (int r = 0; r < num_r; r++) {
        if (request[r] > state->need_matrix[process_index][r]) {
            result->step1_pass = false;
            result->step2_pass = false;
            result->is_safe = false;
            result->granted = false;
            snprintf(result->reason, sizeof(result->reason),
                     "Process %s requested %d instance(s) of R%d, exceeding its Need of %d. Error: Process has exceeded its maximum claim.",
                     result->process_name, request[r], r + 1, state->need_matrix[process_index][r]);
            return;
        }
    }
    result->step1_pass = true;

    /* 2. Step 2: Request <= Available */
    for (int r = 0; r < num_r; r++) {
        if (request[r] > state->available[r]) {
            result->step2_pass = false;
            result->is_safe = false;
            result->granted = false;
            snprintf(result->reason, sizeof(result->reason),
                     "Process %s requested %d instance(s) of R%d, but only %d is currently Available. Process must wait until resources are freed.",
                     result->process_name, request[r], r + 1, state->available[r]);
            return;
        }
    }
    result->step2_pass = true;

    /* 3. Pretend allocation to temporary state */
    int temp_available[MAX_RESOURCES];
    int temp_allocation[MAX_PROCESSES][MAX_RESOURCES];
    int temp_need[MAX_PROCESSES][MAX_RESOURCES];

    for (int r = 0; r < num_r; r++) {
        temp_available[r] = state->available[r] - request[r];
    }

    for (int p = 0; p < num_p; p++) {
        for (int r = 0; r < num_r; r++) {
            if (p == process_index) {
                temp_allocation[p][r] = state->allocation[p][r] + request[r];
                temp_need[p][r] = state->need_matrix[p][r] - request[r];
            } else {
                temp_allocation[p][r] = state->allocation[p][r];
                temp_need[p][r] = state->need_matrix[p][r];
            }
        }
    }

    /* 4. Run safety check on tentative state */
    check_safe_state_custom(num_p, num_r, temp_available, temp_allocation, temp_need, &result->safe_state_result);

    result->is_safe = result->safe_state_result.is_safe;

    if (result->is_safe) {
        result->granted = true;
        for (int r = 0; r < num_r; r++) {
            result->new_available[r] = temp_available[r];
        }
        for (int p = 0; p < num_p; p++) {
            for (int r = 0; r < num_r; r++) {
                result->new_allocation[p][r] = temp_allocation[p][r];
                result->new_need[p][r] = temp_need[p][r];
            }
        }

        char seq_str[128] = "";
        int s_pos = 0;
        for (int s = 0; s < result->safe_state_result.safe_sequence_count; s++) {
            s_pos += snprintf(seq_str + s_pos, sizeof(seq_str) - s_pos, "%sP%d", (s > 0 ? " -> " : ""), result->safe_state_result.safe_sequence[s] + 1);
        }

        snprintf(result->reason, sizeof(result->reason),
                 "Granting request leaves system in a SAFE STATE. Safe sequence exists: %s.",
                 seq_str);
    } else {
        result->granted = false;
        snprintf(result->reason, sizeof(result->reason),
                 "Granting this request would result in an UNSAFE STATE. Safe sequence cannot be completed. Request is DENIED and state rolled back.");
    }
}

void apply_resource_request(SimulatorState *state, const ResourceRequestResult *result) {
    if (!state || !result || !result->granted) return;

    int p = result->process_index;
    int num_r = state->num_resources;

    for (int r = 0; r < num_r; r++) {
        state->allocation[p][r] = result->new_allocation[p][r];
    }

    simulator_recompute(state);
    state->has_detection_result = false;
    state->has_safe_state_result = true;
    state->status = STATUS_SAFE;
    state->current_step_index = 0;
    state->request_applied = true;
    simulator_update_process_states(state);
}
