#include "display.h"
#include "graph.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void display_clear_screen(void) {
    printf("\033[2J\033[H");
}

void display_header(const SimulatorState *state) {
    if (!state) return;

    printf("\033[48;2;7;10;25m\033[38;2;99;102;241m========================================================================================================\033[0m\n");
    printf("\033[48;2;7;10;25m \033[1;37m[N] NEXUS OS RESOURCE TERMINAL v2.4\033[0m \033[38;2;148;163;184m| Banker's Safety Engine & Deadlock Prevention System\033[0m");

    /* Status Badge */
    const char *status_str = simulator_status_to_string(state->status);
    if (state->status == STATUS_SAFE) {
        printf("  \033[48;2;6;78;59;38;2;167;243;208m [ %s ] \033[0m", status_str);
    } else if (state->status == STATUS_DEADLOCKED || state->status == STATUS_UNSAFE) {
        printf("  \033[48;2;76;5;25;38;2;254;205;211m [ %s ] \033[0m", status_str);
    } else if (state->status == STATUS_RUNNING) {
        printf("  \033[48;2;30;58;138;38;2;191;219;254m [ %s ] \033[0m", status_str);
    } else {
        printf("  \033[48;2;30;27;75;38;2;224;231;255m [ %s ] \033[0m", status_str);
    }

    if (state->search_query[0] != '\0') {
        printf("  \033[38;2;59;130;246m[Search: \"%s\"]\033[0m", state->search_query);
    }

    printf("\n\033[48;2;7;10;25m\033[38;2;99;102;241m========================================================================================================\033[0m\n");
}

void display_footer(void) {
    printf("\033[38;2;25;35;68m--------------------------------------------------------------------------------------------------------\033[0m\n");
    printf(" \033[38;2;148;163;184mNEXUS OS Terminal • Academic OS Simulator • Press section key or [H] Help • [Q] Quit\033[0m\n");
}

void display_nav_bar(const SimulatorState *state) {
    if (!state) return;

    const char *nav_labels[] = {
        "1:Dashboard", "2:Setup", "3:Real-Time Sim", "4:Matrices",
        "5:Resources", "6:Graph & Analytics", "7:Resource Request"
    };

    printf(" ");
    for (int i = 0; i < 7; i++) {
        if ((int)state->active_section == i) {
            printf("\033[48;2;79;70;229;1;37m [ %s ] \033[0m ", nav_labels[i]);
        } else {
            printf("\033[48;2;15;23;42;38;2;148;163;184m [ %s ] \033[0m ", nav_labels[i]);
        }
    }
    printf(" \033[38;2;100;116;139m| [8]Inspect [S]Search [R]Reset\033[0m\n\n");
}

void display_metric_cards(const SimulatorState *state, const SafeStateResult *safe_res) {
    if (!state) return;

    int total_capacity = 0;
    for (int r = 0; r < state->num_resources; r++) {
        total_capacity += state->total_resources[r];
    }

    int safe_count = (safe_res && safe_res->is_safe) ? safe_res->safe_sequence_count : 0;

    printf("┌─────────────────────────┬─────────────────────────┬─────────────────────────┬─────────────────────────┐\n");
    printf("│ \033[1;35mTOTAL PROCESSES\033[0m         │ \033[1;36mRESOURCE TYPES\033[0m          │ \033[1;32mSYSTEM STATE\033[0m            │ \033[1;33mTOTAL CAPACITY\033[0m          │\n");
    printf("│ %-2d Active (P1-P%-2d)    │ %-2d Vector Classes      │ %-23s │ %-4d Total Units        │\n",
           state->num_processes, state->num_processes,
           state->num_resources,
           simulator_status_to_string(state->status),
           total_capacity);
    printf("│ \033[38;2;168;85;247m[P1 .. P%d]\033[0m             │ \033[38;2;6;182;212m[R1 .. R%d]\033[0m             │ ",
           state->num_processes, state->num_resources);

    if (state->status == STATUS_SAFE) {
        printf("\033[38;2;16;185;129m[+100%% SECURE %d/%d Safe]\033[0m │ ", safe_count, state->num_processes);
    } else if (state->status == STATUS_DEADLOCKED) {
        printf("\033[38;2;244;63;94m[BLOCKED: Circular Wait]\033[0m │ ");
    } else if (state->status == STATUS_UNSAFE) {
        printf("\033[38;2;244;63;94m[UNSAFE: Deadlock Risk]\033[0m  │ ");
    } else {
        printf("\033[38;2;99;102;241m[READY: Verifier Idle]\033[0m   │ ");
    }

    printf("\033[38;2;245;158;11m[Pool Capacity Sum]\033[0m     │\n");
    printf("└─────────────────────────┴─────────────────────────┴─────────────────────────┴─────────────────────────┘\n\n");
}

void display_view_overview(const SimulatorState *state, const DetectionResult *det_res, const SafeStateResult *safe_res) {
    display_metric_cards(state, safe_res);

    /* Quick Action Controls Banner */
    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");
    printf("\033[38;2;99;102;241m|\033[1;37m                                   ALGORITHM EXECUTION SHORTCUTS                                      \033[38;2;99;102;241m|\033[0m\n");
    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");
    printf("  \033[1;32m[C]\033[0m \033[1mCheck Safe State (Banker's Algorithm)\033[0m    \033[1;31m[D]\033[0m \033[1mDetect Deadlock (Standard Cycle Detection)\033[0m\n");
    printf("  \033[1;36m[M]\033[0m \033[1mView & Edit Matrices Workspace\033[0m            \033[1;33m[E]\033[0m \033[1mEvaluate Resource Request / Prevention\033[0m\n");
    printf("  \033[1;34m[P]\033[0m \033[1mRun / Play Step-by-Step Simulation\033[0m        \033[1;35m[R]\033[0m \033[1mReset All Simulator States\033[0m\n\n");

    /* Results Showcase */
    if (safe_res && safe_res->is_safe) {
        display_safe_sequence_card(safe_res);
    } else if (safe_res && !safe_res->is_safe && state->status == STATUS_UNSAFE) {
        display_unsafe_explanation_card(safe_res);
    }

    if (det_res && det_res->is_deadlocked) {
        display_detection_result_card(det_res);
    }

    /* Matrices Snapshot */
    printf("\033[1;37mAllocation Matrix Snapshot (Currently Held):\033[0m\n");
    display_matrix_table("ALLOCATION MATRIX", "Held Instances", COLOR_EMERALD,
                         state->num_processes, state->num_resources, state->allocation,
                         state->search_query, -1, NULL, 0);

    printf("\033[1;37mAvailable Resource Vector:\033[0m\n  ");
    for (int r = 0; r < state->num_resources; r++) {
        printf("\033[1;36mR%d: %d/%d\033[0m  ", r + 1, state->available[r], state->total_resources[r]);
    }
    printf(" \033[38;2;148;163;184m(Formula: Available = Total - Sum(Allocation))\033[0m\n\n");
}

void display_view_simulation_setup(const SimulatorState *state) {
    if (!state) return;

    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");
    printf("\033[38;2;99;102;241m|\033[1;37m                                   SIMULATION CONFIGURATION PANEL                                     \033[38;2;99;102;241m|\033[0m\n");
    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");

    printf("  Processes Count (N)  : \033[1;35m%d\033[0m (Range: 1..%d)\n", state->num_processes, MAX_PROCESSES);
    printf("  Resource Types  (M)  : \033[1;36m%d\033[0m (Range: 1..%d)\n\n", state->num_resources, MAX_RESOURCES);

    printf("  Total Resource Capacities:\n  ");
    for (int r = 0; r < state->num_resources; r++) {
        printf("\033[1;33m[R%d = %d]\033[0m ", r + 1, state->total_resources[r]);
    }
    printf("\n\n");

    printf("  \033[1;37mConfiguration Actions:\033[0m\n");
    printf("  \033[1;36m[C]\033[0m Change Dimensions (Processes / Resources count & Total capacities)\n");
    printf("  \033[1;32m[I]\033[0m Initialize / Clear Matrices to Zero\n");
    printf("  \033[1;33m[T]\033[0m Edit Total Resource Capacities\n");
    printf("  \033[1;34m[D]\033[0m Load Standard Textbook Scenario (5 processes, 3 resources)\n");
    printf("  \033[1;35m[R]\033[0m Reset Simulator to Clean State\n\n");

    char err[256];
    if (!simulator_validate(state, err, sizeof(err))) {
        printf("  \033[48;2;76;5;25;38;2;254;205;211m[!] %s\033[0m\n\n", err);
    } else {
        printf("  \033[38;2;16;185;129m[*] Validation Check: System state is consistent (Allocation <= Max and Sum <= Total).\033[0m\n\n");
    }
}

void display_view_trace(SimulatorState *state, const SafeStateResult *safe_res, const DetectionResult *det_res) {
    if (!state) return;

    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");
    printf("\033[38;2;99;102;241m|\033[1;37m                                   REAL-TIME ALGORITHM SIMULATOR                                      \033[38;2;99;102;241m|\033[0m\n");
    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");

    int total_eval_steps = (safe_res ? safe_res->all_eval_step_count : 0);

    /* Controls Bar */
    printf("  \033[1;37mPlayback Controls:\033[0m [N] Next Step  |  [B] Prev Step  |  [P] Play/Run  |  [0] Reset Stepper  |  [X] Speed\n");
    printf("  Status: %s | Step \033[1m%d\033[0m of \033[1m%d\033[0m | Playback Speed: \033[1;36m%.1fx\033[0m\n\n",
           state->is_playing ? "\033[1;33mRUNNING\033[0m" : "\033[38;2;148;163;184mPAUSED\033[0m",
           total_eval_steps > 0 ? (state->current_step_index + 1) : 0,
           total_eval_steps,
           state->play_speed);

    /* Active Step Banner */
    if (safe_res && total_eval_steps > 0 && state->current_step_index < total_eval_steps) {
        const BankerStep *step = &safe_res->all_eval_steps[state->current_step_index];
        printf("┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐\n");
        printf("│ \033[1;34mSTEP #%-2d\033[0m : Evaluating Process \033[1;37m%-3s\033[0m                                                                  │\n",
               step->step_number, step->process_name);
        printf("│ Status     : %-84s │\n",
               step->can_execute ? "\033[1;32mCAN EXECUTE (Need <= Work Pool) -> Completes and releases allocation\033[0m"
                                 : "\033[1;33mCANNOT EXECUTE (Need > Work Pool) -> Waiting for freed resources\033[0m");

        char need_str[64] = "", work_str[64] = "", alloc_str[64] = "", next_work_str[64] = "";
        int n_pos = 0, w_pos = 0, a_pos = 0, nw_pos = 0;
        for (int r = 0; r < state->num_resources; r++) {
            n_pos += snprintf(need_str + n_pos, sizeof(need_str) - n_pos, "%s%d", (r > 0 ? ", " : ""), step->need[r]);
            w_pos += snprintf(work_str + w_pos, sizeof(work_str) - w_pos, "%s%d", (r > 0 ? ", " : ""), step->work_before[r]);
            a_pos += snprintf(alloc_str + a_pos, sizeof(alloc_str) - a_pos, "%s%d", (r > 0 ? ", " : ""), step->allocation[r]);
            nw_pos += snprintf(next_work_str + nw_pos, sizeof(next_work_str) - nw_pos, "%s%d", (r > 0 ? ", " : ""), step->work_after[r]);
        }

        printf("│ Need Vector: [%-20s]   Work Pool Before: [%-20s]                  │\n", need_str, work_str);
        if (step->can_execute) {
            printf("│ Releasing  : [%-20s]   Work Pool After : [%-20s]                  │\n", alloc_str, next_work_str);
        }
        printf("└──────────────────────────────────────────────────────────────────────────────────────────────────────┘\n\n");
    } else {
        printf("  \033[38;2;148;163;184m[i] Click or press [C] to run safety evaluation, then [N] to step forward.\033[0m\n\n");
    }

    /* Process Lifecycle Monitor */
    printf("  \033[1;37mProcess Lifecycle Monitor:\033[0m\n  ");
    for (int p = 0; p < state->num_processes; p++) {
        ProcessState p_state = state->process_states[p];
        if (p_state == PROC_STATE_ACTIVE) {
            printf("\033[48;2;30;58;138;1;37m [ P%d: ACTIVE ] \033[0m ", p + 1);
        } else if (p_state == PROC_STATE_COMPLETED) {
            printf("\033[48;2;6;78;59;1;32m [ P%d: DONE ✓ ] \033[0m ", p + 1);
        } else if (p_state == PROC_STATE_BLOCKED) {
            printf("\033[48;2;76;5;25;1;31m [ P%d: BLOCKED ] \033[0m ", p + 1);
        } else {
            printf("\033[48;2;15;23;42;38;2;148;163;184m [ P%d: WAIT ] \033[0m ", p + 1);
        }
    }
    printf("\n\n");

    /* Show Execution Trace Table */
    display_trace_table(safe_res,
                        (safe_res && total_eval_steps > 0 && state->current_step_index < total_eval_steps)
                            ? safe_res->all_eval_steps[state->current_step_index].step_number : -1,
                        state->search_query);

    if (det_res && det_res->is_deadlocked) {
        display_detection_result_card(det_res);
    }
}

void display_view_matrices(const SimulatorState *state) {
    if (!state) return;

    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");
    printf("\033[38;2;99;102;241m|\033[1;37m                                      MATRICES WORKSPACE                                               \033[38;2;99;102;241m|\033[0m\n");
    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");

    /* Matrix Workspace Tabs */
    const char *tabs[] = {
        "1:Banker's (3-Col)", "2:Deadlock (2-Col)", "3:All 4 Matrices",
        "4:Alloc", "5:Max", "6:Need", "7:Request"
    };

    printf("  Tabs: ");
    for (int t = 0; t < 7; t++) {
        if ((int)state->active_matrix_tab == t) {
            printf("\033[48;2;79;70;229;1;37m [%s] \033[0m ", tabs[t]);
        } else {
            printf("\033[48;2;15;23;42;38;2;148;163;184m [%s] \033[0m ", tabs[t]);
        }
    }
    printf("\n  Editing Shortcuts: \033[1;32m[A]\033[0m Edit Alloc | \033[1;33m[M]\033[0m Edit Max | \033[1;35m[Q]\033[0m Edit Request | \033[1;36m[T]\033[0m Switch Tab\n\n");

    if (state->active_matrix_tab == TAB_BANKER || state->active_matrix_tab == TAB_ALL || state->active_matrix_tab == TAB_ALLOCATION) {
        display_matrix_table("ALLOCATION MATRIX", "Currently Held Instances", COLOR_EMERALD,
                             state->num_processes, state->num_resources, state->allocation,
                             state->search_query, -1, NULL, 0);
    }

    if (state->active_matrix_tab == TAB_BANKER || state->active_matrix_tab == TAB_ALL || state->active_matrix_tab == TAB_MAXIMUM) {
        display_matrix_table("MAXIMUM MATRIX", "Max Declared Demand Limit", COLOR_AMBER,
                             state->num_processes, state->num_resources, state->max_matrix,
                             state->search_query, -1, NULL, 0);
    }

    if (state->active_matrix_tab == TAB_BANKER || state->active_matrix_tab == TAB_ALL || state->active_matrix_tab == TAB_NEED) {
        display_matrix_table("NEED MATRIX (AUTO-CALCULATED)", "Demand: Max - Allocation", COLOR_CYAN,
                             state->num_processes, state->num_resources, state->need_matrix,
                             state->search_query, -1, NULL, 0);
    }

    if (state->active_matrix_tab == TAB_DEADLOCK || state->active_matrix_tab == TAB_ALL || state->active_matrix_tab == TAB_REQUEST) {
        display_matrix_table("REQUEST MATRIX", "Outstanding Claims for Deadlock Verification", COLOR_PURPLE,
                             state->num_processes, state->num_resources, state->request_matrix,
                             state->search_query, -1, NULL, 0);
    }
}

void display_view_resources(const SimulatorState *state) {
    if (!state) return;

    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");
    printf("\033[38;2;99;102;241m|\033[1;37m                                AVAILABLE RESOURCES & POOL MONITOR                                     \033[38;2;99;102;241m|\033[0m\n");
    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");

    const char *names[] = {
        "Primary Vector", "Memory Pool", "I/O Channels",
        "Storage Disks", "CPU Sockets", "Network Ports",
        "Bus Channels", "GPU Cores", "DMA Buffers", "Cache Units"
    };

    printf("┌────────────┬──────────────────┬──────────────┬───────────────┬────────────────┬──────────────────────┐\n");
    printf("│ Resource   │ Pool Name        │ Total Units  │ Held / Alloc  │ Available Pool │ Utilization Gauge    │\n");
    printf("├────────────┼──────────────────┼──────────────┼───────────────┼────────────────┼──────────────────────┤\n");

    for (int r = 0; r < state->num_resources; r++) {
        int alloc_sum = 0;
        for (int p = 0; p < state->num_processes; p++) {
            alloc_sum += state->allocation[p][r];
        }
        int tot = state->total_resources[r];
        int avail = state->available[r];
        int pct = (tot > 0) ? (alloc_sum * 100 / tot) : 0;
        if (pct > 100) pct = 100;

        /* Progress Bar */
        char bar[15] = "          ";
        int filled = pct / 10;
        for (int b = 0; b < filled && b < 10; b++) {
            bar[b] = '#';
        }

        printf("│ \033[1;36mR%-2d\033[0m        │ %-16s │ %-12d │ %-13d │ \033[1;32m%-14d\033[0m │ [%s] %3d%%     │\n",
               r + 1, names[r % 10], tot, alloc_sum, avail, bar, pct);
    }
    printf("└────────────┴──────────────────┴──────────────┴───────────────┴────────────────┴──────────────────────┘\n\n");
    printf("  \033[38;2;148;163;184mFormula: Available[j] = Total[j] - Sum(Allocation[i][j]) | Press [T] to edit total capacities\033[0m\n\n");
}

void display_view_analytics(const SimulatorState *state, const DetectionResult *det_res, const SafeStateResult *safe_res) {
    if (!state) return;

    /* 1. Compute Analytics */
    int total_system_units = 0;
    int total_allocated_units = 0;
    for (int r = 0; r < state->num_resources; r++) {
        total_system_units += state->total_resources[r];
        for (int p = 0; p < state->num_processes; p++) {
            total_allocated_units += state->allocation[p][r];
        }
    }
    int utilization_pct = (total_system_units > 0) ? (total_allocated_units * 100 / total_system_units) : 0;

    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");
    printf("\033[38;2;99;102;241m|\033[1;37m                                SIMULATION ANALYTICS & ENGINE METRICS                                  \033[38;2;99;102;241m|\033[0m\n");
    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");

    printf("┌───────────────────────────────────┬───────────────────────────────────┬──────────────────────────────┐\n");
    printf("│ \033[1;36mSYSTEM UTILIZATION GAUGE\033[0m          │ \033[1;35mRESOURCE SATURATION ARC\033[0m           │ \033[1;33mTELEMETRY SUMMARY\033[0m            │\n");
    printf("│                                   │                                   │                              │\n");
    printf("│   Load: \033[1;32m%3d%%\033[0m                       │   Capacity Status: \033[1;36m%s\033[0m      │  Active Processes : %-3d      │\n",
           utilization_pct,
           utilization_pct > 85 ? "\033[31mHEAVY LOAD\033[0m" : (utilization_pct > 50 ? "\033[33mBALANCED\033[0m" : "\033[32mOPTIMAL\033[0m"),
           state->num_processes);
    printf("│   Allocated Units : \033[1;37m%-4d\033[0m          │   Total Capacity : \033[1;37m%-4d\033[0m           │  Resource Classes : %-3d      │\n",
           total_allocated_units, total_system_units, state->num_resources);
    printf("│   Available Pool  : \033[1;32m%-4d\033[0m          │   Free Capacity  : \033[1;32m%-4d\033[0m           │  Deadlock Risk    : %-8s │\n",
           total_system_units - total_allocated_units,
           total_system_units - total_allocated_units,
           (det_res && det_res->is_deadlocked) ? "\033[31mCRITICAL\033[0m" : "\033[32mMINIMAL\033[0m");
    printf("└───────────────────────────────────┴───────────────────────────────────┴──────────────────────────────┘\n\n");

    /* 2. Process Demand Breakdown */
    printf("  \033[1;37mProcess Demand Breakdown:\033[0m\n");
    for (int p = 0; p < state->num_processes; p++) {
        int p_alloc = 0, p_max = 0;
        for (int r = 0; r < state->num_resources; r++) {
            p_alloc += state->allocation[p][r];
            p_max += state->max_matrix[p][r];
        }
        int p_pct = (p_max > 0) ? (p_alloc * 100 / p_max) : 0;
        char p_bar[11] = "          ";
        for (int b = 0; b < (p_pct / 10) && b < 10; b++) p_bar[b] = '#';

        printf("  P%-2d : Alloc \033[1;32m%2d\033[0m / Max \033[1;33m%2d\033[0m  [%s] %3d%%\n",
               p + 1, p_alloc, p_max, p_bar, p_pct);
    }
    printf("\n");

    /* 3. Render Resource Allocation Graph (RAG) */
    graph_render_rag(state, det_res, safe_res);

    /* 4. Telemetry Activity Feed */
    display_activity_feed(det_res, safe_res);
}

void display_view_resource_request(const SimulatorState *state, const ResourceRequestResult *req_res) {
    if (!state) return;

    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");
    printf("\033[38;2;99;102;241m|\033[1;37m                    RESOURCE REQUEST & DYNAMIC BANKER'S SAFETY PROCEDURE                              \033[38;2;99;102;241m|\033[0m\n");
    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");

    int p = state->selected_request_process;
    printf("  Requesting Process : \033[1;35mProcess P%d\033[0m\n", p + 1);

    printf("  Current Need Vector: [ ");
    for (int r = 0; r < state->num_resources; r++) {
        printf("\033[1;36m%d \033[0m", state->need_matrix[p][r]);
    }
    printf("]     Available Pool: [ ");
    for (int r = 0; r < state->num_resources; r++) {
        printf("\033[1;32m%d \033[0m", state->available[r]);
    }
    printf("]\n\n");

    printf("  Requested Quantities:\n  ");
    for (int r = 0; r < state->num_resources; r++) {
        printf("\033[1;33mR%d: %d\033[0m  ", r + 1, state->request_vector[r]);
    }
    printf("\n\n");

    printf("  \033[1;37mActions:\033[0m \033[1;36m[P]\033[0m Change Requesting Process | \033[1;33m[Q]\033[0m Enter Requested Vector | \033[1;32m[E]\033[0m Evaluate Protocol\n");
    if (req_res && req_res->granted) {
        printf("           \033[1;32m[A]\033[0m Apply Allocation to Actual System State\n");
    }
    printf("\n");

    if (req_res) {
        printf("┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐\n");
        if (req_res->granted) {
            printf("│ \033[1;32mVERDICT: REQUEST GRANTED (System remains in Safe State)\033[0m                                              │\n");
        } else {
            printf("│ \033[1;31mVERDICT: REQUEST DENIED  (System rolled back to original state)\033[0m                                      │\n");
        }
        printf("├──────────────────────────────────────────────────────────────────────────────────────────────────────┤\n");
        printf("│ 1. Request <= Need      : %-73s │\n",
               req_res->step1_pass ? "\033[1;32mPASS (Claim within maximum limit)\033[0m" : "\033[1;31mFAIL (Exceeds maximum claim limit)\033[0m");
        printf("│ 2. Request <= Available : %-73s │\n",
               req_res->step2_pass ? "\033[1;32mPASS (Instances currently available in pool)\033[0m" : "\033[1;31mFAIL (Insufficient available instances)\033[0m");
        printf("│ 3. Tentative Safety Test: %-73s │\n",
               req_res->is_safe ? "\033[1;32mPASS (Safe sequence exists in tentative state)\033[0m" : "\033[1;31mFAIL (Unsafe state / Deadlock vulnerability)\033[0m");
        printf("├──────────────────────────────────────────────────────────────────────────────────────────────────────┤\n");
        printf("│ Reason: %-92s │\n", req_res->reason);
        printf("└──────────────────────────────────────────────────────────────────────────────────────────────────────┘\n\n");

        if (state->request_applied) {
            printf("  \033[48;2;6;78;59;1;32m[*] ALLOCATION APPLIED: Matrices and Available resources have been updated in system state.\033[0m\n\n");
        }
    } else {
        printf("  \033[38;2;148;163;184m[i] Enter requested vector and press [E] to execute Banker's safety verification.\033[0m\n\n");
    }
}

void display_view_process_inspector(const SimulatorState *state, int process_idx) {
    if (!state || process_idx < 0 || process_idx >= state->num_processes) return;

    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");
    printf("\033[38;2;99;102;241m|\033[1;37m                                   PROCESS INSPECTION: Process P%-2d                                   \033[38;2;99;102;241m|\033[0m\n", process_idx + 1);
    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");

    printf("  Execution Lifecycle State: \033[1;36m%s\033[0m\n\n",
           process_state_to_string(state->process_states[process_idx]));

    printf("  \033[1;37mResource Vectors for P%d:\033[0m\n", process_idx + 1);
    printf("  Allocation (Held)  : [ ");
    for (int r = 0; r < state->num_resources; r++) printf("\033[1;32m%d \033[0m", state->allocation[process_idx][r]);
    printf("]\n");

    printf("  Max Demand         : [ ");
    for (int r = 0; r < state->num_resources; r++) printf("\033[1;33m%d \033[0m", state->max_matrix[process_idx][r]);
    printf("]\n");

    printf("  Remaining Need     : [ ");
    for (int r = 0; r < state->num_resources; r++) printf("\033[1;36m%d \033[0m", state->need_matrix[process_idx][r]);
    printf("]\n");

    printf("  Current Available  : [ ");
    for (int r = 0; r < state->num_resources; r++) printf("\033[1;37m%d \033[0m", state->available[r]);
    printf("]\n\n");

    /* Feasibility Analysis */
    bool can_exec = true;
    for (int r = 0; r < state->num_resources; r++) {
        if (state->need_matrix[process_idx][r] > state->available[r]) {
            can_exec = false;
            break;
        }
    }

    printf("  \033[1;37mFeasibility Analysis:\033[0m\n");
    if (state->process_states[process_idx] == PROC_STATE_COMPLETED) {
        printf("  \033[1;32mProcess P%d has executed and released all allocated resources back to the pool.\033[0m\n\n", process_idx + 1);
    } else if (can_exec) {
        printf("  \033[1;32mProcess P%d satisfies Need <= Available and is immediately eligible to run.\033[0m\n\n", process_idx + 1);
    } else {
        printf("  \033[1;33mProcess P%d cannot run immediately: Need exceeds currently available instances.\033[0m\n", process_idx + 1);
        printf("  Deficit on: ");
        for (int r = 0; r < state->num_resources; r++) {
            if (state->need_matrix[process_idx][r] > state->available[r]) {
                printf("\033[31mR%d (Need %d > Avail %d) \033[0m",
                       r + 1, state->need_matrix[process_idx][r], state->available[r]);
            }
        }
        printf("\n\n");
    }
}

void display_safe_sequence_card(const SafeStateResult *safe_res) {
    if (!safe_res) return;

    printf("┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐\n");
    if (safe_res->is_safe) {
        printf("│ \033[1;32mSYSTEM IS IN A SAFE STATE - NO DEADLOCK RISK\033[0m                                                         │\n");
        printf("│ Safe Execution Order:                                                                                │\n│   ");
        for (int s = 0; s < safe_res->safe_sequence_count; s++) {
            printf("\033[48;2;6;78;59;1;32m [ P%d ] \033[0m%s",
                   safe_res->safe_sequence[s] + 1,
                   (s < safe_res->safe_sequence_count - 1 ? " \033[1;34m-->\033[0m " : ""));
        }
        printf("\n│                                                                                                      │\n");
        printf("│ Explanation: %-87s │\n", safe_res->explanation);
    } else {
        printf("│ \033[1;31mSYSTEM IS IN AN UNSAFE STATE - DEADLOCK VULNERABILITY DETECTED\033[0m                                      │\n");
        printf("│ Explanation: %-87s │\n", safe_res->explanation);
    }
    printf("└──────────────────────────────────────────────────────────────────────────────────────────────────────┘\n\n");
}

void display_unsafe_explanation_card(const SafeStateResult *safe_res) {
    if (!safe_res || safe_res->is_safe || !safe_res->has_unsafe_reasoning) return;

    const UnsafeReasoning *ur = &safe_res->unsafe_reasoning;
    printf("┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐\n");
    printf("│ \033[1;31mUNSAFE STATE ROOT CAUSE EXPLANATION\033[0m                                                                  │\n");
    printf("│ Available Work Pool at Halt: [ ");
    for (int r = 0; r < MAX_RESOURCES && r < ur->failed_comparisons[0].failed_resource_count + 1; r++) {
        printf("%d ", ur->final_work_at_halt[r]);
    }
    printf("]                                                               │\n");
    printf("│ Blocked Processes (Need > Work):                                                                     │\n");

    for (int f = 0; f < ur->failed_comparison_count; f++) {
        const FailedProcessComparison *fc = &ur->failed_comparisons[f];
        printf("│   * %s: Deficit on resource(s): ", fc->process_name);
        for (int r = 0; r < fc->failed_resource_count; r++) {
            printf("R%d ", fc->failed_resources[r] + 1);
        }
        printf("\n");
    }
    printf("│ Summary: %-91s │\n", ur->summary);
    printf("└──────────────────────────────────────────────────────────────────────────────────────────────────────┘\n\n");
}

void display_detection_result_card(const DetectionResult *det_res) {
    if (!det_res) return;

    printf("┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐\n");
    if (det_res->is_deadlocked) {
        printf("│ \033[1;31mDEADLOCK DETECTION VERIFICATION: DEADLOCK DETECTED (CIRCULAR WAIT CONFIRMED)\033[0m                         │\n");
        printf("│ Deadlocked Processes: ");
        for (int i = 0; i < det_res->deadlocked_count; i++) {
            printf("\033[48;2;76;5;25;1;31m [ P%d ] \033[0m ", det_res->deadlocked_processes[i] + 1);
        }
        printf("\n│ Involved Resources  : ");
        for (int r = 0; r < det_res->involved_resource_count; r++) {
            printf("\033[48;2;15;23;42;1;33m [ R%d ] \033[0m ", det_res->involved_resources[r] + 1);
        }
        printf("\n│ Diagnosis: Circular wait detected. These processes cannot acquire resources and are frozen.         │\n");
    } else {
        printf("│ \033[1;32mDEADLOCK DETECTION VERIFICATION: SAFE - NO DEADLOCK DETECTED\033[0m                                          │\n");
        printf("│ All processes can acquire requested resources and terminate without mutual blocking.                 │\n");
    }
    printf("└──────────────────────────────────────────────────────────────────────────────────────────────────────┘\n\n");
}

void display_trace_table(const SafeStateResult *safe_res, int current_step_num, const char *search_query) {
    (void)search_query;
    if (!safe_res || safe_res->step_count == 0) {
        printf("  \033[38;2;148;163;184m[i] No execution steps recorded yet. Run \"Check Safe State\" to generate execution trace.\033[0m\n\n");
        return;
    }

    printf("  \033[1;37mAlgorithm Execution Trace Log (%d Steps Recorded):\033[0m\n", safe_res->step_count);
    printf("  ┌──────┬─────────┬───────────┬────────────────┬────────────────┬────────────────┬────────────────┐\n");
    printf("  │ Step │ Process │ Status    │ Need Vector    │ Work Before    │ Alloc Released │ New Work Pool  │\n");
    printf("  ├──────┼─────────┼───────────┼────────────────┼────────────────┼────────────────┼────────────────┤\n");

    for (int s = 0; s < safe_res->step_count; s++) {
        const BankerStep *step = &safe_res->steps[s];
        bool is_current = (step->step_number == current_step_num);

        char need_str[32] = "", work_str[32] = "", alloc_str[32] = "", next_work_str[32] = "";
        int n_pos = 0, w_pos = 0, a_pos = 0, nw_pos = 0;
        int num_r = (safe_res->num_resources > 0 ? safe_res->num_resources : 3);
        for (int r = 0; r < num_r; r++) {
            n_pos += snprintf(need_str + n_pos, sizeof(need_str) - n_pos, "%s%d", (r > 0 ? "," : ""), step->need[r]);
            w_pos += snprintf(work_str + w_pos, sizeof(work_str) - w_pos, "%s%d", (r > 0 ? "," : ""), step->work_before[r]);
            a_pos += snprintf(alloc_str + a_pos, sizeof(alloc_str) - a_pos, "%s%d", (r > 0 ? "," : ""), step->allocation[r]);
            nw_pos += snprintf(next_work_str + nw_pos, sizeof(next_work_str) - nw_pos, "%s%d", (r > 0 ? "," : ""), step->work_after[r]);
        }

        if (is_current) {
            printf("  │ \033[1;34m#%-2d\033[0m  │ \033[1;37m%-7s\033[0m │ \033[1;32m%-9s\033[0m │ [%-12s] │ [%-12s] │ +[%-11s] │ \033[1;32m[%-12s]\033[0m │\n",
                   step->step_number, step->process_name,
                   step->can_execute ? "COMPLETED" : "WAITING",
                   need_str, work_str, alloc_str, next_work_str);
        } else {
            printf("  │ #%-2d  │ %-7s │ %-9s │ [%-12s] │ [%-12s] │ +[%-11s] │ [%-12s] │\n",
                   step->step_number, step->process_name,
                   step->can_execute ? "COMPLETED" : "WAITING",
                   need_str, work_str, alloc_str, next_work_str);
        }
    }
    printf("  └──────┴─────────┴───────────┴────────────────┴────────────────┴────────────────┴────────────────┘\n\n");
}

void display_matrix_table(const char *title, const char *subtitle, const char *header_color,
                          int rows, int cols, const int matrix[MAX_PROCESSES][MAX_RESOURCES],
                          const char *search_query, int active_p, const int *deadlocked_p, int dl_count) {
    (void)search_query;
    printf("  %s%s%s \033[38;2;148;163;184m(%s)\033[0m\n", header_color, title, COLOR_RESET, subtitle);
    printf("  ┌───────");
    for (int c = 0; c < cols; c++) printf("┬──────");
    printf("┐\n  │ Proc  ");
    for (int c = 0; c < cols; c++) printf("│  R%-2d ", c + 1);
    printf("│\n  ├───────");
    for (int c = 0; c < cols; c++) printf("┼──────");
    printf("┤\n");

    for (int r = 0; r < rows; r++) {
        bool dl = false;
        if (deadlocked_p) {
            for (int d = 0; d < dl_count; d++) {
                if (deadlocked_p[d] == r) { dl = true; break; }
            }
        }

        if (dl) {
            printf("  │ \033[31mP%-2d\033[0m   ", r + 1);
        } else if (r == active_p) {
            printf("  │ \033[1;34mP%-2d\033[0m   ", r + 1);
        } else {
            printf("  │ P%-2d   ", r + 1);
        }

        for (int c = 0; c < cols; c++) {
            printf("│  %-3d ", matrix[r][c]);
        }
        printf("│\n");
    }

    printf("  └───────");
    for (int c = 0; c < cols; c++) printf("┴──────");
    printf("┘\n\n");
}

void display_activity_feed(const DetectionResult *det_res, const SafeStateResult *safe_res) {
    printf("  \033[1;37mKernel Activity & Telemetry Stream:\033[0m\n");
    if (det_res && det_res->step_count > 0) {
        for (int s = 0; s < det_res->step_count && s < 5; s++) {
            printf("  \033[38;2;148;163;184m[Step #%02d]\033[0m \033[1;37m%s\033[0m: %s\n",
                   det_res->steps[s].step_number,
                   det_res->steps[s].process_name,
                   det_res->steps[s].description);
        }
    } else if (safe_res && safe_res->step_count > 0) {
        for (int s = 0; s < safe_res->step_count && s < 5; s++) {
            printf("  \033[38;2;148;163;184m[Step #%02d]\033[0m \033[1;37m%s\033[0m: %s\n",
                   safe_res->steps[s].step_number,
                   safe_res->steps[s].process_name,
                   safe_res->steps[s].description);
        }
    } else {
        printf("  \033[38;2;148;163;184mAwaiting algorithm run. Press [C] or [D] to stream telemetry events.\033[0m\n");
    }
    printf("\n");
}
