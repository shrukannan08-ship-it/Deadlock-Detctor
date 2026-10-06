#ifndef PREVENTION_H
#define PREVENTION_H

#include "simulator.h"
#include <stdbool.h>

/* Step structure for Banker's Safety Algorithm evaluation */
typedef struct {
    int step_number;
    char process_name[MAX_NAME_LEN];
    int process_index;
    int work_before[MAX_RESOURCES];
    int need[MAX_RESOURCES];
    int allocation[MAX_RESOURCES];
    int work_after[MAX_RESOURCES];
    bool can_execute;
    char description[256];
} BankerStep;

/* Unsafe state comparison failure details */
typedef struct {
    char process_name[MAX_NAME_LEN];
    int process_index;
    int need[MAX_RESOURCES];
    int work[MAX_RESOURCES];
    int failed_resources[MAX_RESOURCES]; /* 0-indexed resource indices where Need > Work */
    int failed_resource_count;
} FailedProcessComparison;

/* Unsafe state reasoning container */
typedef struct {
    int final_work_at_halt[MAX_RESOURCES];
    FailedProcessComparison failed_comparisons[MAX_PROCESSES];
    int failed_comparison_count;
    char summary[256];
} UnsafeReasoning;

/* Safe State Result structure matching safeState.ts */
struct SafeStateResult {
    bool is_safe;
    int num_processes;
    int num_resources;
    int safe_sequence[MAX_PROCESSES]; /* 0-indexed process sequence */
    int safe_sequence_count;
    int initial_available[MAX_RESOURCES];
    int final_work[MAX_RESOURCES];
    BankerStep steps[MAX_STEPS]; /* Successful execution steps */
    int step_count;
    BankerStep all_eval_steps[MAX_STEPS]; /* Full animation trace including failed attempts */
    int all_eval_step_count;
    int unfinished_processes[MAX_PROCESSES];
    int unfinished_count;
    char explanation[512];
    bool has_unsafe_reasoning;
    UnsafeReasoning unsafe_reasoning;
};

/* Resource Request Result structure matching resourceRequest.ts */
struct ResourceRequestResult {
    char process_name[MAX_NAME_LEN];
    int process_index;
    int request[MAX_RESOURCES];
    int need[MAX_RESOURCES];
    int available[MAX_RESOURCES];
    bool step1_pass; /* Request <= Need */
    bool step2_pass; /* Request <= Available */
    bool is_safe;
    bool granted;
    char reason[512];
    int new_available[MAX_RESOURCES];
    int new_allocation[MAX_PROCESSES][MAX_RESOURCES];
    int new_need[MAX_PROCESSES][MAX_RESOURCES];
    SafeStateResult safe_state_result;
};

/* Safety Algorithm Prototypes */
void check_safe_state_custom(int num_proc, int num_res,
                             const int *available,
                             const int alloc[][MAX_RESOURCES],
                             const int need[][MAX_RESOURCES],
                             SafeStateResult *result);

void check_safe_state(const SimulatorState *state, SafeStateResult *result);

/* Resource Request / Banker's Prevention Prototypes */
void evaluate_resource_request(int process_index,
                               const int *request,
                               const SimulatorState *state,
                               ResourceRequestResult *result);

void apply_resource_request(SimulatorState *state, const ResourceRequestResult *result);

#endif /* PREVENTION_H */
