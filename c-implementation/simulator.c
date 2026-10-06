#include "simulator.h"
#include "deadlock.h"
#include "prevention.h"
#include <stdio.h>
#include <string.h>

void simulator_init_defaults(SimulatorState *state) {
    if (!state) return;
    memset(state, 0, sizeof(SimulatorState));

    state->num_processes = 5;
    state->num_resources = 3;

    /* Total Resources matching App.tsx: [10, 5, 7] */
    state->total_resources[0] = 10;
    state->total_resources[1] = 5;
    state->total_resources[2] = 7;

    /* Allocation Matrix matching App.tsx */
    int def_alloc[5][3] = {
        {0, 1, 0},
        {2, 0, 0},
        {3, 0, 2},
        {2, 1, 1},
        {0, 0, 2}
    };

    /* Maximum Matrix matching App.tsx */
    int def_max[5][3] = {
        {7, 5, 3},
        {3, 2, 2},
        {9, 0, 2},
        {4, 2, 2},
        {5, 3, 3}
    };

    /* Request Matrix matching App.tsx */
    int def_req[5][3] = {
        {7, 4, 3},
        {1, 2, 2},
        {6, 0, 0},
        {0, 1, 1},
        {4, 3, 1}
    };

    for (int p = 0; p < 5; p++) {
        for (int r = 0; r < 3; r++) {
            state->allocation[p][r] = def_alloc[p][r];
            state->max_matrix[p][r] = def_max[p][r];
            state->request_matrix[p][r] = def_req[p][r];
        }
    }

    state->status = STATUS_READY;
    state->active_section = NAV_OVERVIEW;
    state->active_matrix_tab = TAB_BANKER;
    state->inspected_process = -1;
    state->play_speed = 1.0;
    state->current_step_index = 0;
    state->is_playing = false;

    state->selected_request_process = 0;
    for (int r = 0; r < MAX_RESOURCES; r++) {
        state->request_vector[r] = 0;
    }
    state->request_applied = false;

    state->has_detection_result = false;
    state->has_safe_state_result = false;
    state->has_request_result = false;

    simulator_recompute(state);
    for (int p = 0; p < state->num_processes; p++) {
        state->process_states[p] = PROC_STATE_WAITING;
    }
}

void simulator_reset(SimulatorState *state) {
    if (!state) return;
    int p_count = state->num_processes > 0 ? state->num_processes : 5;
    int r_count = state->num_resources > 0 ? state->num_resources : 3;

    memset(state, 0, sizeof(SimulatorState));
    state->num_processes = p_count;
    state->num_resources = r_count;
    state->status = STATUS_READY;
    state->active_section = NAV_SIMULATION;
    state->active_matrix_tab = TAB_BANKER;
    state->inspected_process = -1;
    state->play_speed = 1.0;
    state->current_step_index = 0;
    state->is_playing = false;

    for (int p = 0; p < state->num_processes; p++) {
        state->process_states[p] = PROC_STATE_WAITING;
    }
    simulator_recompute(state);
}

void simulator_configure(SimulatorState *state, int num_proc, int num_res, const int *totals) {
    if (!state) return;
    state->num_processes = num_proc < 1 ? 1 : (num_proc > MAX_PROCESSES ? MAX_PROCESSES : num_proc);
    state->num_resources = num_res < 1 ? 1 : (num_res > MAX_RESOURCES ? MAX_RESOURCES : num_res);

    for (int r = 0; r < state->num_resources; r++) {
        state->total_resources[r] = totals ? totals[r] : 10;
    }

    for (int p = 0; p < state->num_processes; p++) {
        for (int r = 0; r < state->num_resources; r++) {
            state->allocation[p][r] = 0;
            state->max_matrix[p][r] = 5;
            state->request_matrix[p][r] = 0;
        }
        state->process_states[p] = PROC_STATE_WAITING;
    }

    state->status = STATUS_READY;
    state->has_detection_result = false;
    state->has_safe_state_result = false;
    state->has_request_result = false;
    state->current_step_index = 0;
    state->inspected_process = -1;

    simulator_recompute(state);
}

void simulator_recompute(SimulatorState *state) {
    if (!state) return;

    /* 1. Calculate Need Matrix: Need[i][j] = max(0, Max[i][j] - Allocation[i][j]) */
    for (int p = 0; p < state->num_processes; p++) {
        for (int r = 0; r < state->num_resources; r++) {
            int diff = state->max_matrix[p][r] - state->allocation[p][r];
            state->need_matrix[p][r] = (diff > 0) ? diff : 0;
        }
    }

    /* 2. Calculate Available Vector: Available[j] = max(0, Total[j] - Sum(Allocation[i][j])) */
    for (int r = 0; r < state->num_resources; r++) {
        int alloc_sum = 0;
        for (int p = 0; p < state->num_processes; p++) {
            alloc_sum += state->allocation[p][r];
        }
        int avail = state->total_resources[r] - alloc_sum;
        state->available[r] = (avail > 0) ? avail : 0;
    }
}

bool simulator_validate(const SimulatorState *state, char *error_msg, size_t msg_size) {
    if (!state) return false;

    /* 1. Allocation <= Max for each cell */
    for (int p = 0; p < state->num_processes; p++) {
        for (int r = 0; r < state->num_resources; r++) {
            if (state->allocation[p][r] > state->max_matrix[p][r]) {
                if (error_msg) {
                    snprintf(error_msg, msg_size,
                             "Validation Error: Process P%d Allocation [%d] exceeds Max [%d] for resource R%d.",
                             p + 1, state->allocation[p][r], state->max_matrix[p][r], r + 1);
                }
                return false;
            }
        }
    }

    /* 2. Total allocated <= Total resources */
    for (int r = 0; r < state->num_resources; r++) {
        int alloc_sum = 0;
        for (int p = 0; p < state->num_processes; p++) {
            alloc_sum += state->allocation[p][r];
        }
        if (alloc_sum > state->total_resources[r]) {
            if (error_msg) {
                snprintf(error_msg, msg_size,
                         "Validation Error: Total allocated [%d] for R%d exceeds Total Capacity [%d].",
                         alloc_sum, r + 1, state->total_resources[r]);
            }
            return false;
        }
    }

    return true;
}

void simulator_update_process_states(SimulatorState *state) {
    if (!state) return;

    for (int p = 0; p < state->num_processes; p++) {
        state->process_states[p] = PROC_STATE_WAITING;
    }

    /* Update based on active step in safe state result */
    if (state->has_safe_state_result) {
        /* If system is completely safe, show safe completion */
        if (state->status == STATUS_SAFE) {
            for (int p = 0; p < state->num_processes; p++) {
                state->process_states[p] = PROC_STATE_COMPLETED;
            }
        }
    }

    /* If deadlock detected, mark involved processes as BLOCKED */
    if (state->status == STATUS_DEADLOCKED && state->has_detection_result) {
        /* Mark resolved as COMPLETED, deadlocked as BLOCKED */
        /* Note: deadlock result will be queried directly in views */
    }
}

void simulator_set_allocation(SimulatorState *state, int p, int r, int val) {
    if (!state || p < 0 || p >= state->num_processes || r < 0 || r >= state->num_resources) return;
    state->allocation[p][r] = val < 0 ? 0 : val;
    if (state->max_matrix[p][r] < state->allocation[p][r]) {
        state->max_matrix[p][r] = state->allocation[p][r];
    }
    simulator_recompute(state);
    state->has_detection_result = false;
    state->has_safe_state_result = false;
}

void simulator_set_max(SimulatorState *state, int p, int r, int val) {
    if (!state || p < 0 || p >= state->num_processes || r < 0 || r >= state->num_resources) return;
    state->max_matrix[p][r] = val < 0 ? 0 : val;
    simulator_recompute(state);
    state->has_detection_result = false;
    state->has_safe_state_result = false;
}

void simulator_set_request(SimulatorState *state, int p, int r, int val) {
    if (!state || p < 0 || p >= state->num_processes || r < 0 || r >= state->num_resources) return;
    state->request_matrix[p][r] = val < 0 ? 0 : val;
    state->has_detection_result = false;
}

void simulator_set_total(SimulatorState *state, int r, int val) {
    if (!state || r < 0 || r >= state->num_resources) return;
    state->total_resources[r] = val < 0 ? 0 : val;
    simulator_recompute(state);
    state->has_detection_result = false;
    state->has_safe_state_result = false;
}

const char* simulator_status_to_string(SimulationStatus status) {
    switch (status) {
        case STATUS_READY: return "SYSTEM READY";
        case STATUS_RUNNING: return "SIMULATING";
        case STATUS_SAFE: return "SAFE STATE";
        case STATUS_UNSAFE: return "UNSAFE STATE";
        case STATUS_DEADLOCKED: return "DEADLOCKED";
        default: return "UNKNOWN";
    }
}

const char* process_state_to_string(ProcessState state) {
    switch (state) {
        case PROC_STATE_WAITING: return "WAITING";
        case PROC_STATE_ACTIVE: return "ACTIVE";
        case PROC_STATE_COMPLETED: return "COMPLETED";
        case PROC_STATE_BLOCKED: return "BLOCKED";
        default: return "WAITING";
    }
}

const char* nav_section_to_string(NavSection section) {
    switch (section) {
        case NAV_OVERVIEW: return "Dashboard";
        case NAV_SIMULATION: return "Simulation Setup";
        case NAV_TRACE: return "Real-Time Simulator";
        case NAV_MATRICES: return "Matrices Workspace";
        case NAV_RESOURCES: return "Resources Monitor";
        case NAV_ANALYTICS: return "Graph & Analytics";
        case NAV_REQUEST: return "Resource Request";
        default: return "Dashboard";
    }
}
