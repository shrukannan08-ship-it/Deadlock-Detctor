#include "graph.h"
#include <stdio.h>
#include <string.h>

void graph_compute_stats(const SimulatorState *state, const DetectionResult *det_result, RagStats *stats) {
    if (!state || !stats) return;
    memset(stats, 0, sizeof(RagStats));

    stats->process_nodes = state->num_processes;
    stats->resource_nodes = state->num_resources;
    stats->total_nodes = stats->process_nodes + stats->resource_nodes;

    for (int p = 0; p < state->num_processes; p++) {
        for (int r = 0; r < state->num_resources; r++) {
            if (state->allocation[p][r] > 0) {
                stats->allocation_edges_count++;
            }
            if (state->request_matrix[p][r] > 0) {
                stats->request_edges_count++;
            }
        }
    }

    stats->total_edges_count = stats->allocation_edges_count + stats->request_edges_count;
    stats->has_cycle = (det_result && det_result->is_deadlocked);
}

void graph_render_rag(const SimulatorState *state, const DetectionResult *det_result, const SafeStateResult *safe_result) {
    if (!state) return;

    RagStats stats;
    graph_compute_stats(state, det_result, &stats);

    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");
    printf("\033[38;2;99;102;241m|\033[1;37m                       RESOURCE ALLOCATION GRAPH (RAG) - LIVE TOPOLOGY                                \033[38;2;99;102;241m|\033[0m\n");
    printf("\033[38;2;99;102;241m+------------------------------------------------------------------------------------------------------+\033[0m\n");

    /* Status Banner */
    if (det_result && det_result->is_deadlocked) {
        printf(" \033[48;2;76;5;25;38;2;254;205;211m[!] CIRCULAR WAIT / DEADLOCK CYCLE CONFIRMED (Involved: ");
        for (int i = 0; i < det_result->deadlocked_count; i++) {
            printf("%sP%d", (i > 0 ? ", " : ""), det_result->deadlocked_processes[i] + 1);
        }
        printf(") \033[0m\n\n");
    } else if (safe_result && safe_result->is_safe) {
        printf(" \033[48;2;6;78;59;38;2;167;243;208m[*] OPTIMAL SAFE STATE FLOW: No Cycle / All Dependencies Resolvable \033[0m\n\n");
    } else {
        printf(" \033[48;2;16;22;46;38;2;148;163;184m[i] Live Dependency Flow: Allocation (R->P) & Request (P->R) \033[0m\n\n");
    }

    /* ASCII / Unicode Graph Layout */
    printf("  \033[1;34m[PROCESS NODES]\033[0m                                             \033[1;36m[RESOURCE NODES]\033[0m\n");
    printf("  ----------------------------------------------------------------------------------------------------\n");

    for (int p = 0; p < state->num_processes; p++) {
        bool p_deadlocked = false;
        if (det_result && det_result->is_deadlocked) {
            p_deadlocked = deadlock_is_process_deadlocked(det_result, p);
        }

        int seq_num = -1;
        if (safe_result && safe_result->is_safe) {
            for (int s = 0; s < safe_result->safe_sequence_count; s++) {
                if (safe_result->safe_sequence[s] == p) {
                    seq_num = s + 1;
                    break;
                }
            }
        }

        /* Process Node Line */
        if (p_deadlocked) {
            printf("  \033[1;31m( P%d )\033[0m \033[48;2;76;5;25;38;2;244;63;94m[DEADLOCKED]\033[0m", p + 1);
        } else if (seq_num != -1) {
            printf("  \033[1;32m( P%d )\033[0m \033[48;2;6;78;59;38;2;52;211;153m[Seq #%d]\033[0m   ", p + 1, seq_num);
        } else {
            printf("  \033[1;34m( P%d )\033[0m \033[38;2;148;163;184m[READY]   \033[0m   ", p + 1);
        }

        /* Edges held and requested for this process */
        char edges_buf[256] = "";
        int e_pos = 0;

        /* Held allocations from resources: R -> P */
        for (int r = 0; r < state->num_resources; r++) {
            if (state->allocation[p][r] > 0) {
                e_pos += snprintf(edges_buf + e_pos, sizeof(edges_buf) - e_pos,
                                  "\033[38;2;16;185;129m<--[%d]--R%d\033[0m ",
                                  state->allocation[p][r], r + 1);
            }
        }

        /* Requests to resources: P -> R */
        for (int r = 0; r < state->num_resources; r++) {
            if (state->request_matrix[p][r] > 0) {
                e_pos += snprintf(edges_buf + e_pos, sizeof(edges_buf) - e_pos,
                                  "\033[38;2;245;158;11m--[%d]-->R%d\033[0m ",
                                  state->request_matrix[p][r], r + 1);
            }
        }

        if (e_pos == 0) {
            printf("        \033[38;2;100;116;139m(idle - no active edges)\033[0m");
        } else {
            printf("        %s", edges_buf);
        }

        /* If there is a corresponding resource on this line, print it */
        if (p < state->num_resources) {
            int r = p;
            bool r_deadlocked = false;
            if (det_result && det_result->is_deadlocked) {
                r_deadlocked = deadlock_is_resource_involved(det_result, r);
            }

            printf("\n                                                                \033[1;36m|--->\033[0m ");
            if (r_deadlocked) {
                printf("\033[1;31m[ R%d: Avail %d/%d (HELD/BLOCKED) ]\033[0m",
                       r + 1, state->available[r], state->total_resources[r]);
            } else {
                printf("\033[1;36m[ R%d: Avail %d/%d Units ]\033[0m",
                       r + 1, state->available[r], state->total_resources[r]);
            }
        }
        printf("\n");
    }

    /* Print any remaining resources if num_resources > num_processes */
    if (state->num_resources > state->num_processes) {
        for (int r = state->num_processes; r < state->num_resources; r++) {
            printf("                                                                \033[1;36m[ R%d: Avail %d/%d Units ]\033[0m\n",
                   r + 1, state->available[r], state->total_resources[r]);
        }
    }

    printf("  ----------------------------------------------------------------------------------------------------\n");

    /* Comprehensive Edge Matrix Table */
    printf("  \033[1;37mDetailed RAG Relationship Matrix:\033[0m\n");
    printf("  ┌────────┬─────────────┬────────────┬────────┬─────────────────────────────┐\n");
    printf("  │ Source │ Destination │ Edge Type  │ Units  │ Graph Dependency Meaning    │\n");
    printf("  ├────────┼─────────────┼────────────┼────────┼─────────────────────────────┤\n");

    int edge_idx = 0;
    /* Allocation edges: R -> P */
    for (int p = 0; p < state->num_processes; p++) {
        for (int r = 0; r < state->num_resources; r++) {
            if (state->allocation[p][r] > 0) {
                edge_idx++;
                bool dl = (det_result && det_result->is_deadlocked &&
                           deadlock_is_process_deadlocked(det_result, p) &&
                           deadlock_is_resource_involved(det_result, r));
                printf("  │  R%-2d   │    P%-2d    │ \033[38;2;16;185;129mALLOC (held)\033[0m│   %-4d │ %-27s │\n",
                       r + 1, p + 1, state->allocation[p][r],
                       dl ? "\033[31mInvolved in deadlock cycle\033[0m" : "Resource assigned to process");
            }
        }
    }

    /* Request edges: P -> R */
    for (int p = 0; p < state->num_processes; p++) {
        for (int r = 0; r < state->num_resources; r++) {
            if (state->request_matrix[p][r] > 0) {
                edge_idx++;
                bool dl = (det_result && det_result->is_deadlocked &&
                           deadlock_is_process_deadlocked(det_result, p) &&
                           deadlock_is_resource_involved(det_result, r));
                printf("  │  P%-2d   │    R%-2d    │ \033[38;2;245;158;11mREQUEST(wait)\033[0m│   %-4d │ %-27s │\n",
                       p + 1, r + 1, state->request_matrix[p][r],
                       dl ? "\033[31mBlocked in circular wait \033[0m" : "Process awaiting allocation");
            }
        }
    }

    if (edge_idx == 0) {
        printf("  │  None  │    None     │    None    │    0   │ No active edges currently   │\n");
    }

    printf("  └────────┴─────────────┴────────────┴────────┴─────────────────────────────┘\n");

    /* Legend */
    printf("  \033[38;2;148;163;184mLegend: \033[38;2;16;185;129m<--[W]-- (Allocation: R->P)\033[0m  |  \033[38;2;245;158;11m--[W]--> (Request: P->R)\033[0m  |  \033[38;2;244;63;94m(Red: Deadlocked Cycle)\033[0m\n\n");
}
