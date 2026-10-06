#ifndef SIMULATOR_H
#define SIMULATOR_H

#include <stdbool.h>
#include <stddef.h>

#define MAX_PROCESSES 10
#define MAX_RESOURCES 10
#define MAX_STEPS 64
#define MAX_NAME_LEN 16

/* Simulation Status matching types/deadlock.ts */
typedef enum {
    STATUS_READY,
    STATUS_RUNNING,
    STATUS_SAFE,
    STATUS_UNSAFE,
    STATUS_DEADLOCKED
} SimulationStatus;

/* Process State matching types/deadlock.ts */
typedef enum {
    PROC_STATE_WAITING,
    PROC_STATE_ACTIVE,
    PROC_STATE_COMPLETED,
    PROC_STATE_BLOCKED
} ProcessState;

/* Sidebar Navigation Sections matching App.tsx NavSection */
typedef enum {
    NAV_OVERVIEW,      /* 1. Dashboard / Overview */
    NAV_SIMULATION,    /* 2. Simulation Setup */
    NAV_TRACE,         /* 3. Real-Time Simulator & Trace */
    NAV_MATRICES,      /* 4. Matrices Workspace */
    NAV_RESOURCES,     /* 5. Resources Monitor */
    NAV_ANALYTICS,     /* 6. Graph & Analytics */
    NAV_REQUEST        /* 7. Resource Request & Prevention */
} NavSection;

/* Matrix Workspace Tab Views matching MatrixSection.tsx */
typedef enum {
    TAB_BANKER,        /* 3-Column: Allocation, Max, Need */
    TAB_DEADLOCK,      /* 2-Column: Allocation, Request */
    TAB_ALL,           /* All 4 Matrices */
    TAB_ALLOCATION,    /* Allocation only */
    TAB_MAXIMUM,       /* Maximum only */
    TAB_NEED,          /* Need only */
    TAB_REQUEST        /* Request only */
} MatrixTab;

/* Forward declarations */
typedef struct DetectionResult DetectionResult;
typedef struct SafeStateResult SafeStateResult;
typedef struct ResourceRequestResult ResourceRequestResult;

/* Core Simulator State struct coordinating full system state */
typedef struct {
    /* Dimensions */
    int num_processes;
    int num_resources;

    /* Resource Vectors and Matrices */
    int total_resources[MAX_RESOURCES];
    int allocation[MAX_PROCESSES][MAX_RESOURCES];
    int max_matrix[MAX_PROCESSES][MAX_RESOURCES];
    int need_matrix[MAX_PROCESSES][MAX_RESOURCES];
    int request_matrix[MAX_PROCESSES][MAX_RESOURCES];
    int available[MAX_RESOURCES];

    /* Dynamic States */
    SimulationStatus status;
    ProcessState process_states[MAX_PROCESSES];

    /* Navigation & Search */
    NavSection active_section;
    MatrixTab active_matrix_tab;
    char search_query[64];
    int inspected_process; /* -1 for none, or 0..num_processes-1 */

    /* Animation & Stepper Controls */
    int current_step_index;
    double play_speed;
    bool is_playing;

    /* Resource Request Interactive Context */
    int selected_request_process;
    int request_vector[MAX_RESOURCES];
    bool request_applied;

    /* Cached Algorithm Execution Results */
    bool has_detection_result;
    bool has_safe_state_result;
    bool has_request_result;
} SimulatorState;

/* Lifecycle & Configuration functions */
void simulator_init_defaults(SimulatorState *state);
void simulator_reset(SimulatorState *state);
void simulator_configure(SimulatorState *state, int num_proc, int num_res, const int *totals);
void simulator_recompute(SimulatorState *state);
bool simulator_validate(const SimulatorState *state, char *error_msg, size_t msg_size);
void simulator_update_process_states(SimulatorState *state);

/* Value Setters */
void simulator_set_allocation(SimulatorState *state, int p, int r, int val);
void simulator_set_max(SimulatorState *state, int p, int r, int val);
void simulator_set_request(SimulatorState *state, int p, int r, int val);
void simulator_set_total(SimulatorState *state, int r, int val);

/* Helper queries */
const char* simulator_status_to_string(SimulationStatus status);
const char* process_state_to_string(ProcessState state);
const char* nav_section_to_string(NavSection section);

#endif /* SIMULATOR_H */
