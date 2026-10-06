#include "deadlock.h"
#include <stdio.h>
#include <string.h>

void detect_deadlock(const SimulatorState *state, DetectionResult *result) {
    if (!state || !result) return;

    memset(result, 0, sizeof(DetectionResult));

    int num_p = state->num_processes;
    int num_r = state->num_resources;

    int work[MAX_RESOURCES];
    bool finish[MAX_PROCESSES];

    for (int r = 0; r < num_r; r++) {
        work[r] = state->available[r];
    }

    for (int i = 0; i < num_p; i++) {
        finish[i] = false;
        bool has_alloc = false;
        for (int r = 0; r < num_r; r++) {
            if (state->allocation[i][r] > 0) {
                has_alloc = true;
                break;
            }
        }
        /* A process holding no resources cannot cause or participate in blocking others */
        if (!has_alloc) {
            finish[i] = true;
        }
    }

    bool found = true;
    int step_counter = 1;

    while (found) {
        found = false;

        for (int i = 0; i < num_p; i++) {
            if (!finish[i]) {
                bool can_execute = true;
                for (int r = 0; r < num_r; r++) {
                    if (state->request_matrix[i][r] > work[r]) {
                        can_execute = false;
                        break;
                    }
                }

                if (can_execute) {
                    DetectionStep *step = &result->steps[result->step_count];
                    step->step_number = step_counter++;
                    step->process_index = i;
                    snprintf(step->process_name, sizeof(step->process_name), "P%d", i + 1);
                    strncpy(step->status_str, "released", sizeof(step->status_str));

                    for (int r = 0; r < num_r; r++) {
                        step->work_before[r] = work[r];
                        step->allocated_released[r] = state->allocation[i][r];
                        work[r] += state->allocation[i][r];
                        step->work_after[r] = work[r];
                    }

                    /* Format description matching website */
                    char req_str[64] = "";
                    char work_str[64] = "";
                    char alloc_str[64] = "";
                    int req_pos = 0, work_pos = 0, alloc_pos = 0;

                    for (int r = 0; r < num_r; r++) {
                        req_pos += snprintf(req_str + req_pos, sizeof(req_str) - req_pos, "%s%d", (r > 0 ? ", " : ""), state->request_matrix[i][r]);
                        work_pos += snprintf(work_str + work_pos, sizeof(work_str) - work_pos, "%s%d", (r > 0 ? ", " : ""), step->work_before[r]);
                        alloc_pos += snprintf(alloc_str + alloc_pos, sizeof(alloc_str) - alloc_pos, "%s%d", (r > 0 ? ", " : ""), step->allocated_released[r]);
                    }

                    snprintf(step->description, sizeof(step->description),
                             "Process P%d request [%s] can be satisfied with Work [%s]. Completes and releases [%s].",
                             i + 1, req_str, work_str, alloc_str);

                    result->step_count++;
                    finish[i] = true;
                    found = true;
                    result->resolved_processes[result->resolved_count++] = i;
                    break; /* Restart scan from the beginning */
                }
            }
        }
    }

    /* Check for deadlocked processes */
    for (int i = 0; i < num_p; i++) {
        if (!finish[i]) {
            result->deadlocked_processes[result->deadlocked_count++] = i;
        }
    }

    result->is_deadlocked = (result->deadlocked_count > 0);

    /* Collect involved resources */
    if (result->is_deadlocked) {
        bool res_seen[MAX_RESOURCES] = {false};
        for (int idx = 0; idx < result->deadlocked_count; idx++) {
            int p = result->deadlocked_processes[idx];
            for (int r = 0; r < num_r; r++) {
                if ((state->request_matrix[p][r] > 0 || state->allocation[p][r] > 0) && !res_seen[r]) {
                    res_seen[r] = true;
                    result->involved_resources[result->involved_resource_count++] = r;
                }
            }
        }
    }
}

bool deadlock_is_process_deadlocked(const DetectionResult *result, int process_idx) {
    if (!result) return false;
    for (int i = 0; i < result->deadlocked_count; i++) {
        if (result->deadlocked_processes[i] == process_idx) return true;
    }
    return false;
}

bool deadlock_is_resource_involved(const DetectionResult *result, int resource_idx) {
    if (!result) return false;
    for (int i = 0; i < result->involved_resource_count; i++) {
        if (result->involved_resources[i] == resource_idx) return true;
    }
    return false;
}
