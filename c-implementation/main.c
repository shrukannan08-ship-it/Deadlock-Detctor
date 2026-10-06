#include "simulator.h"
#include "deadlock.h"
#include "prevention.h"
#include "display.h"
#include "graph.h"
#include "trace.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <ctype.h>

#ifdef _WIN32
#include <windows.h>
static void enable_windows_terminal(void) {
    HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);
    if (hOut != INVALID_HANDLE_VALUE) {
        DWORD dwMode = 0;
        if (GetConsoleMode(hOut, &dwMode)) {
            dwMode |= ENABLE_VIRTUAL_TERMINAL_PROCESSING;
            SetConsoleMode(hOut, dwMode);
        }
    }
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);
}
#else
static void enable_windows_terminal(void) {}
#endif

/* Helper to trim whitespace */
static char* trim_whitespace(char *str) {
    if (!str) return NULL;
    while (isspace((unsigned char)*str)) str++;
    if (*str == 0) return str;
    char *end = str + strlen(str) - 1;
    while (end > str && isspace((unsigned char)*end)) end--;
    end[1] = '\0';
    return str;
}

/* Helper to read a line from stdin */
static bool read_input_line(char *buf, size_t size) {
    if (!fgets(buf, (int)size, stdin)) return false;
    buf[strcspn(buf, "\r\n")] = 0;
    return true;
}

/* Automated test for Safe Case specified in Section 23 */
static int run_test_safe(void) {
    printf("\n=== RUNNING VERIFICATION TEST: SAFE CASE (Section 23) ===\n");
    SimulatorState state;
    simulator_reset(&state);

    state.num_processes = 3;
    state.num_resources = 2;
    state.total_resources[0] = 3;
    state.total_resources[1] = 2;

    int alloc[3][2] = {
        {1, 0},
        {1, 1},
        {0, 0}
    };

    int req[3][2] = {
        {0, 1},
        {0, 0},
        {1, 0}
    };

    for (int p = 0; p < 3; p++) {
        for (int r = 0; r < 2; r++) {
            state.allocation[p][r] = alloc[p][r];
            state.request_matrix[p][r] = req[p][r];
            /* Max >= Allocation for consistency */
            state.max_matrix[p][r] = alloc[p][r] + req[p][r];
        }
    }

    simulator_recompute(&state);

    printf("Processes: %d, Resources: %d\n", state.num_processes, state.num_resources);
    printf("Total: R1=%d, R2=%d\n", state.total_resources[0], state.total_resources[1]);
    printf("Available calculated: R1=%d, R2=%d\n", state.available[0], state.available[1]);

    /* Run Deadlock Detection */
    DetectionResult det_result;
    detect_deadlock(&state, &det_result);

    printf("Deadlock Detection Result: %s\n", det_result.is_deadlocked ? "DEADLOCKED" : "SAFE (NO DEADLOCK)");
    printf("Resolved sequence: ");
    for (int i = 0; i < det_result.resolved_count; i++) {
        printf("%sP%d", (i > 0 ? " -> " : ""), det_result.resolved_processes[i] + 1);
    }
    printf("\n");

    /* Run Banker's Safety Check */
    SafeStateResult safe_result;
    check_safe_state(&state, &safe_result);

    printf("Banker's Safety Check Result: %s\n", safe_result.is_safe ? "SAFE STATE" : "UNSAFE STATE");
    if (safe_result.is_safe) {
        printf("Safe Sequence: ");
        for (int s = 0; s < safe_result.safe_sequence_count; s++) {
            printf("%sP%d", (s > 0 ? " -> " : ""), safe_result.safe_sequence[s] + 1);
        }
        printf("\n");
    }

    if (!det_result.is_deadlocked && safe_result.is_safe) {
        printf(">>> TEST RESULT: PASSED (System is SAFE as expected!)\n\n");
        return 0;
    } else {
        printf(">>> TEST RESULT: FAILED (Expected SAFE state)\n\n");
        return 1;
    }
}

/* Automated test for Deadlock Case specified in Section 23 */
static int run_test_deadlock(void) {
    printf("\n=== RUNNING VERIFICATION TEST: DEADLOCK CASE (Section 23) ===\n");
    SimulatorState state;
    simulator_reset(&state);

    state.num_processes = 2;
    state.num_resources = 2;
    state.total_resources[0] = 1;
    state.total_resources[1] = 1;

    int alloc[2][2] = {
        {1, 0},
        {0, 1}
    };

    int req[2][2] = {
        {0, 1},
        {1, 0}
    };

    for (int p = 0; p < 2; p++) {
        for (int r = 0; r < 2; r++) {
            state.allocation[p][r] = alloc[p][r];
            state.request_matrix[p][r] = req[p][r];
            state.max_matrix[p][r] = alloc[p][r] + req[p][r];
        }
    }

    simulator_recompute(&state);

    printf("Processes: %d, Resources: %d\n", state.num_processes, state.num_resources);
    printf("Total: R1=%d, R2=%d\n", state.total_resources[0], state.total_resources[1]);
    printf("Available calculated: R1=%d, R2=%d\n", state.available[0], state.available[1]);

    DetectionResult det_result;
    detect_deadlock(&state, &det_result);

    printf("Deadlock Detection Result: %s\n", det_result.is_deadlocked ? "DEADLOCK DETECTED" : "SAFE");
    printf("Deadlocked Processes (%d): ", det_result.deadlocked_count);
    for (int i = 0; i < det_result.deadlocked_count; i++) {
        printf("%sP%d", (i > 0 ? ", " : ""), det_result.deadlocked_processes[i] + 1);
    }
    printf("\nInvolved Resources (%d): ", det_result.involved_resource_count);
    for (int r = 0; r < det_result.involved_resource_count; r++) {
        printf("%sR%d", (r > 0 ? ", " : ""), det_result.involved_resources[r] + 1);
    }
    printf("\n");

    bool p1_involved = deadlock_is_process_deadlocked(&det_result, 0);
    bool p2_involved = deadlock_is_process_deadlocked(&det_result, 1);

    if (det_result.is_deadlocked && p1_involved && p2_involved) {
        printf(">>> TEST RESULT: PASSED (DEADLOCK DETECTED with P1, P2 involved as expected!)\n\n");
        return 0;
    } else {
        printf(">>> TEST RESULT: FAILED (Expected deadlock with P1, P2 involved)\n\n");
        return 1;
    }
}

/* Automated test for Resource Request / Prevention Algorithm */
static int run_test_request(void) {
    printf("\n=== RUNNING VERIFICATION TEST: RESOURCE REQUEST / PREVENTION ===\n");
    SimulatorState state;
    simulator_init_defaults(&state);

    printf("Initial textbook state loaded (5 processes, 3 resources).\n");
    printf("Initial Available: [%d, %d, %d]\n", state.available[0], state.available[1], state.available[2]);

    /* Test Case A: Valid grantable request: P2 requests [1, 0, 2] */
    int req_valid[3] = {1, 0, 2};
    ResourceRequestResult res_valid;
    evaluate_resource_request(1, req_valid, &state, &res_valid);

    printf("Test A: Process P2 requests [%d, %d, %d]\n", req_valid[0], req_valid[1], req_valid[2]);
    printf("Result: %s | Reason: %s\n", res_valid.granted ? "GRANTED" : "DENIED", res_valid.reason);

    /* Test Case B: Request exceeds Need: P1 requests [8, 0, 0] (Need is 7) */
    int req_over_need[3] = {8, 0, 0};
    ResourceRequestResult res_over_need;
    evaluate_resource_request(0, req_over_need, &state, &res_over_need);

    printf("Test B: Process P1 requests [%d, %d, %d] (exceeds Need)\n", req_over_need[0], req_over_need[1], req_over_need[2]);
    printf("Result: %s | Step 1 Pass: %s\n", res_over_need.granted ? "GRANTED" : "DENIED", res_over_need.step1_pass ? "YES" : "NO");

    /* Test Case C: Request exceeds Available: P1 requests [4, 0, 0] (Avail is 3) */
    int req_over_avail[3] = {4, 0, 0};
    ResourceRequestResult res_over_avail;
    evaluate_resource_request(0, req_over_avail, &state, &res_over_avail);

    printf("Test C: Process P1 requests [%d, %d, %d] (exceeds Available)\n", req_over_avail[0], req_over_avail[1], req_over_avail[2]);
    printf("Result: %s | Step 2 Pass: %s\n", res_over_avail.granted ? "GRANTED" : "DENIED", res_over_avail.step2_pass ? "YES" : "NO");

    if (res_valid.granted && !res_over_need.granted && !res_over_avail.granted) {
        printf(">>> TEST RESULT: PASSED (Resource Request protocol verified!)\n\n");
        return 0;
    } else {
        printf(">>> TEST RESULT: FAILED\n\n");
        return 1;
    }
}

/* User Input Matrix Editor */
static void prompt_edit_matrix(SimulatorState *state, const char *name, int matrix[MAX_PROCESSES][MAX_RESOURCES]) {
    printf("\n--- Edit %s ---\n", name);
    printf("Enter process number (1 to %d) or 0 to cancel: ", state->num_processes);
    char buf[64];
    if (!read_input_line(buf, sizeof(buf))) return;
    int p = atoi(trim_whitespace(buf));
    if (p < 1 || p > state->num_processes) return;

    printf("Enter %d values for P%d (separated by space): ", state->num_resources, p);
    if (!read_input_line(buf, sizeof(buf))) return;

    char *token = strtok(buf, " \t,");
    int r = 0;
    while (token && r < state->num_resources) {
        int val = atoi(token);
        if (val >= 0) {
            matrix[p - 1][r] = val;
        }
        r++;
        token = strtok(NULL, " \t,");
    }

    simulator_recompute(state);
    state->has_detection_result = false;
    state->has_safe_state_result = false;
    printf("P%d updated successfully!\n", p);
}

/* User Input Dimensions Configurator */
static void prompt_configure_dimensions(SimulatorState *state) {
    char buf[64];
    printf("\n--- Configure Simulation Setup Dimensions ---\n");
    printf("Enter number of processes (1 to %d) [current %d]: ", MAX_PROCESSES, state->num_processes);
    if (!read_input_line(buf, sizeof(buf))) return;
    char *trimmed = trim_whitespace(buf);
    int num_p = (trimmed[0] != '\0') ? atoi(trimmed) : state->num_processes;
    if (num_p < 1) num_p = 1;
    if (num_p > MAX_PROCESSES) num_p = MAX_PROCESSES;

    printf("Enter number of resource types (1 to %d) [current %d]: ", MAX_RESOURCES, state->num_resources);
    if (!read_input_line(buf, sizeof(buf))) return;
    trimmed = trim_whitespace(buf);
    int num_r = (trimmed[0] != '\0') ? atoi(trimmed) : state->num_resources;
    if (num_r < 1) num_r = 1;
    if (num_r > MAX_RESOURCES) num_r = MAX_RESOURCES;

    int totals[MAX_RESOURCES];
    for (int r = 0; r < num_r; r++) {
        totals[r] = 10;
        printf("Enter total capacity for R%d [default 10]: ", r + 1);
        if (read_input_line(buf, sizeof(buf))) {
            char *t = trim_whitespace(buf);
            if (t[0] != '\0') {
                int val = atoi(t);
                if (val > 0) totals[r] = val;
            }
        }
    }

    simulator_configure(state, num_p, num_r, totals);
    printf("Simulation dimensions initialized (%d processes, %d resources)!\n", num_p, num_r);
}

/* Interactive main loop */
int main(int argc, char *argv[]) {
    enable_windows_terminal();

    /* Process CLI Flags */
    if (argc > 1) {
        if (strcmp(argv[1], "--test-safe") == 0) {
            return run_test_safe();
        } else if (strcmp(argv[1], "--test-deadlock") == 0) {
            return run_test_deadlock();
        } else if (strcmp(argv[1], "--test-request") == 0) {
            return run_test_request();
        } else if (strcmp(argv[1], "--test-all") == 0) {
            int r1 = run_test_safe();
            int r2 = run_test_deadlock();
            int r3 = run_test_request();
            if (r1 == 0 && r2 == 0 && r3 == 0) {
                printf("=========================================\n");
                printf("ALL VERIFICATION SUITES PASSED (100%%)\n");
                printf("=========================================\n");
                return 0;
            } else {
                printf("One or more tests failed!\n");
                return 1;
            }
        } else if (strcmp(argv[1], "--help") == 0 || strcmp(argv[1], "-h") == 0) {
            printf("NEXUS OS Deadlock Detection & Prevention Simulator\n");
            printf("Usage:\n");
            printf("  simulator              : Launch full interactive terminal dashboard\n");
            printf("  simulator --test-safe      : Run Section 23 SAFE test case\n");
            printf("  simulator --test-deadlock  : Run Section 23 DEADLOCK test case\n");
            printf("  simulator --test-request   : Run Resource Request / Prevention test\n");
            printf("  simulator --test-all       : Run all verification test suites\n");
            return 0;
        }
    }

    /* Initialize Simulator State */
    SimulatorState state;
    simulator_init_defaults(&state);

    DetectionResult det_result;
    memset(&det_result, 0, sizeof(det_result));

    SafeStateResult safe_result;
    memset(&safe_result, 0, sizeof(safe_result));

    ResourceRequestResult req_result;
    memset(&req_result, 0, sizeof(req_result));

    char input[128];
    bool running = true;

    while (running) {
        display_clear_screen();
        display_header(&state);
        display_nav_bar(&state);

        /* Render Active Section */
        switch (state.active_section) {
            case NAV_OVERVIEW:
                display_view_overview(&state,
                                      state.has_detection_result ? &det_result : NULL,
                                      state.has_safe_state_result ? &safe_result : NULL);
                break;
            case NAV_SIMULATION:
                display_view_simulation_setup(&state);
                break;
            case NAV_TRACE:
                display_view_trace(&state,
                                   state.has_safe_state_result ? &safe_result : NULL,
                                   state.has_detection_result ? &det_result : NULL);
                break;
            case NAV_MATRICES:
                display_view_matrices(&state);
                break;
            case NAV_RESOURCES:
                display_view_resources(&state);
                break;
            case NAV_ANALYTICS:
                display_view_analytics(&state,
                                       state.has_detection_result ? &det_result : NULL,
                                       state.has_safe_state_result ? &safe_result : NULL);
                break;
            case NAV_REQUEST:
                display_view_resource_request(&state,
                                              state.has_request_result ? &req_result : NULL);
                break;
            default:
                display_view_overview(&state,
                                      state.has_detection_result ? &det_result : NULL,
                                      state.has_safe_state_result ? &safe_result : NULL);
                break;
        }

        if (state.inspected_process >= 0) {
            display_view_process_inspector(&state, state.inspected_process);
        }

        display_footer();

        /* Prompt user for command */
        printf("\n\033[1;36mNEXUS-OS>\033[0m Enter command or key: ");
        if (!read_input_line(input, sizeof(input))) {
            break;
        }

        char *cmd = trim_whitespace(input);
        if (cmd[0] == '\0') continue;

        /* Command dispatch */
        if (strcmp(cmd, "q") == 0 || strcmp(cmd, "quit") == 0 || strcmp(cmd, "exit") == 0) {
            running = false;
        } else if (strcmp(cmd, "1") == 0 || strcmp(cmd, "overview") == 0 || strcmp(cmd, "dashboard") == 0) {
            state.active_section = NAV_OVERVIEW;
            state.inspected_process = -1;
        } else if (strcmp(cmd, "2") == 0 || strcmp(cmd, "setup") == 0) {
            state.active_section = NAV_SIMULATION;
            state.inspected_process = -1;
        } else if (strcmp(cmd, "3") == 0 || strcmp(cmd, "trace") == 0 || strcmp(cmd, "sim") == 0) {
            state.active_section = NAV_TRACE;
            state.inspected_process = -1;
        } else if (strcmp(cmd, "4") == 0 || strcmp(cmd, "matrices") == 0) {
            state.active_section = NAV_MATRICES;
            state.inspected_process = -1;
        } else if (strcmp(cmd, "5") == 0 || strcmp(cmd, "resources") == 0) {
            state.active_section = NAV_RESOURCES;
            state.inspected_process = -1;
        } else if (strcmp(cmd, "6") == 0 || strcmp(cmd, "analytics") == 0 || strcmp(cmd, "graph") == 0) {
            state.active_section = NAV_ANALYTICS;
            state.inspected_process = -1;
        } else if (strcmp(cmd, "7") == 0 || strcmp(cmd, "request") == 0) {
            state.active_section = NAV_REQUEST;
            state.inspected_process = -1;
        } else if (strcmp(cmd, "8") == 0 || strcmp(cmd, "inspect") == 0) {
            printf("Enter process number to inspect (1 to %d): ", state.num_processes);
            if (read_input_line(input, sizeof(input))) {
                int p = atoi(trim_whitespace(input));
                if (p >= 1 && p <= state.num_processes) {
                    state.inspected_process = p - 1;
                }
            }
        } else if (strcmp(cmd, "c") == 0 || strcmp(cmd, "check") == 0 || strcmp(cmd, "safe") == 0) {
            check_safe_state(&state, &safe_result);
            state.has_safe_state_result = true;
            state.status = safe_result.is_safe ? STATUS_SAFE : STATUS_UNSAFE;
            state.current_step_index = 0;
            simulator_update_process_states(&state);
        } else if (strcmp(cmd, "d") == 0 || strcmp(cmd, "detect") == 0 || strcmp(cmd, "deadlock") == 0) {
            detect_deadlock(&state, &det_result);
            state.has_detection_result = true;
            state.status = det_result.is_deadlocked ? STATUS_DEADLOCKED : STATUS_SAFE;
            simulator_update_process_states(&state);
        } else if (strcmp(cmd, "n") == 0 || strcmp(cmd, "next") == 0) {
            if (!state.has_safe_state_result) {
                check_safe_state(&state, &safe_result);
                state.has_safe_state_result = true;
                state.status = safe_result.is_safe ? STATUS_SAFE : STATUS_UNSAFE;
            }
            trace_step_forward(&state, &safe_result);
        } else if (strcmp(cmd, "b") == 0 || strcmp(cmd, "prev") == 0) {
            trace_step_back(&state);
        } else if (strcmp(cmd, "0") == 0 || strcmp(cmd, "reset-step") == 0) {
            trace_reset_stepper(&state);
        } else if (strcmp(cmd, "x") == 0 || strcmp(cmd, "speed") == 0) {
            if (state.play_speed == 0.5) state.play_speed = 1.0;
            else if (state.play_speed == 1.0) state.play_speed = 2.0;
            else state.play_speed = 0.5;
        } else if (strcmp(cmd, "p") == 0 || strcmp(cmd, "play") == 0 || strcmp(cmd, "run") == 0) {
            if (!state.has_safe_state_result) {
                check_safe_state(&state, &safe_result);
                state.has_safe_state_result = true;
                state.status = safe_result.is_safe ? STATUS_SAFE : STATUS_UNSAFE;
            }
            /* Step to completion for instant run */
            state.current_step_index = safe_result.all_eval_step_count > 0 ? safe_result.all_eval_step_count - 1 : 0;
            simulator_update_process_states(&state);
        } else if (strcmp(cmd, "r") == 0 || strcmp(cmd, "reset") == 0) {
            simulator_reset(&state);
            memset(&det_result, 0, sizeof(det_result));
            memset(&safe_result, 0, sizeof(safe_result));
            memset(&req_result, 0, sizeof(req_result));
        } else if (strcmp(cmd, "s") == 0 || strcmp(cmd, "search") == 0) {
            printf("Enter search query (process e.g. P1, resource e.g. R1, or blank to clear): ");
            if (read_input_line(input, sizeof(input))) {
                strncpy(state.search_query, trim_whitespace(input), sizeof(state.search_query) - 1);
            }
        } else if (strcmp(cmd, "a") == 0 || strcmp(cmd, "alloc") == 0) {
            prompt_edit_matrix(&state, "Allocation Matrix", state.allocation);
        } else if (strcmp(cmd, "m") == 0 || strcmp(cmd, "max") == 0) {
            prompt_edit_matrix(&state, "Maximum Matrix", state.max_matrix);
        } else if (strcmp(cmd, "req") == 0 || strcmp(cmd, "request-matrix") == 0) {
            prompt_edit_matrix(&state, "Request Matrix", state.request_matrix);
        } else if (strcmp(cmd, "t") == 0 || strcmp(cmd, "tab") == 0) {
            state.active_matrix_tab = (state.active_matrix_tab + 1) % 7;
        } else if (strcmp(cmd, "dim") == 0 || strcmp(cmd, "setup-dim") == 0) {
            prompt_configure_dimensions(&state);
        } else if (strcmp(cmd, "i") == 0 || strcmp(cmd, "init") == 0) {
            for (int p = 0; p < state.num_processes; p++) {
                for (int r = 0; r < state.num_resources; r++) {
                    state.allocation[p][r] = 0;
                    state.max_matrix[p][r] = 5;
                    state.request_matrix[p][r] = 0;
                }
            }
            simulator_recompute(&state);
            state.has_detection_result = false;
            state.has_safe_state_result = false;
            printf("Matrices initialized to zero!\n");
        } else if (strcmp(cmd, "e") == 0 || strcmp(cmd, "eval-req") == 0) {
            evaluate_resource_request(state.selected_request_process, state.request_vector, &state, &req_result);
            state.has_request_result = true;
            state.active_section = NAV_REQUEST;
        } else if (strcmp(cmd, "apply") == 0) {
            if (state.has_request_result && req_result.granted) {
                apply_resource_request(&state, &req_result);
                printf("Allocation applied to system state!\n");
            }
        } else if (strcmp(cmd, "proc") == 0) {
            printf("Select requesting process (1 to %d): ", state.num_processes);
            if (read_input_line(input, sizeof(input))) {
                int p = atoi(trim_whitespace(input));
                if (p >= 1 && p <= state.num_processes) {
                    state.selected_request_process = p - 1;
                    state.has_request_result = false;
                }
            }
        } else if (strcmp(cmd, "q-vec") == 0 || strcmp(cmd, "enter-req") == 0) {
            printf("Enter %d requested amounts for P%d (separated by space): ",
                   state.num_resources, state.selected_request_process + 1);
            if (read_input_line(input, sizeof(input))) {
                char *token = strtok(input, " \t,");
                int r = 0;
                while (token && r < state.num_resources) {
                    state.request_vector[r] = atoi(token);
                    r++;
                    token = strtok(NULL, " \t,");
                }
                state.has_request_result = false;
            }
        } else if (strcmp(cmd, "h") == 0 || strcmp(cmd, "help") == 0) {
            printf("\n--- COMMAND HELP ---\n");
            printf("Navigation:\n");
            printf("  1: Overview Dashboard\n");
            printf("  2: Simulation Setup Panel\n");
            printf("  3: Real-Time Algorithm Simulator\n");
            printf("  4: Matrices Workspace\n");
            printf("  5: Resources Pool Monitor\n");
            printf("  6: Graph & Analytics (RAG)\n");
            printf("  7: Resource Request & Prevention\n");
            printf("  8: Inspect Specific Process\n");
            printf("Algorithm Actions:\n");
            printf("  c: Check Safe State (Banker's Algorithm)\n");
            printf("  d: Detect Deadlock\n");
            printf("  p: Run / Play trace\n");
            printf("  n: Step forward\n");
            printf("  b: Step back\n");
            printf("  e: Evaluate Resource Request Protocol\n");
            printf("  apply: Apply granted request to system state\n");
            printf("Setup & Matrix Editing:\n");
            printf("  dim: Change dimensions (N processes, M resources)\n");
            printf("  a  : Edit Allocation matrix cell/row\n");
            printf("  m  : Edit Maximum matrix cell/row\n");
            printf("  req: Edit Request matrix cell/row\n");
            printf("  s  : Filter with search query\n");
            printf("  r  : Reset simulator state\n");
            printf("  q  : Quit simulator\n");
            printf("\nPress Enter to continue...");
            read_input_line(input, sizeof(input));
        }
    }

    printf("\nExiting NEXUS OS Deadlock Simulator. Goodbye!\n");
    return 0;
}
