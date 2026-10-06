#ifndef DEADLOCK_H
#define DEADLOCK_H

#include "simulator.h"
#include <stdbool.h>

/* Detection Step details */
typedef struct {
    int step_number;
    char process_name[MAX_NAME_LEN];
    int process_index;
    char description[256];
    int work_before[MAX_RESOURCES];
    int allocated_released[MAX_RESOURCES];
    int work_after[MAX_RESOURCES];
    char status_str[16]; /* "released", "waiting", "blocked" */
} DetectionStep;

/* Detection Result structure */
struct DetectionResult {
    bool is_deadlocked;
    int deadlocked_processes[MAX_PROCESSES]; /* 0-based indices */
    int deadlocked_count;
    int resolved_processes[MAX_PROCESSES];   /* 0-based indices */
    int resolved_count;
    DetectionStep steps[MAX_STEPS];
    int step_count;
    int involved_resources[MAX_RESOURCES];   /* 0-based resource indices */
    int involved_resource_count;
};

/* Core Deadlock Detection Algorithm function */
void detect_deadlock(const SimulatorState *state, DetectionResult *result);

/* Deadlock verification test helper */
bool deadlock_is_process_deadlocked(const DetectionResult *result, int process_idx);
bool deadlock_is_resource_involved(const DetectionResult *result, int resource_idx);

#endif /* DEADLOCK_H */
