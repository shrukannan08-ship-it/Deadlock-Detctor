#include "trace.h"
#include <stdio.h>
#include <string.h>

void trace_step_forward(SimulatorState *state, const SafeStateResult *safe_res) {
    if (!state || !safe_res) return;
    int total_steps = safe_res->all_eval_step_count;
    if (total_steps == 0) return;

    if (state->current_step_index < total_steps - 1) {
        state->current_step_index++;
    }

    /* Update process states based on progress up to current step */
    for (int p = 0; p < state->num_processes; p++) {
        state->process_states[p] = PROC_STATE_WAITING;
    }

    for (int s = 0; s <= state->current_step_index && s < total_steps; s++) {
        const BankerStep *step = &safe_res->all_eval_steps[s];
        if (step->can_execute) {
            state->process_states[step->process_index] = PROC_STATE_COMPLETED;
        }
    }

    if (state->current_step_index < total_steps) {
        const BankerStep *active = &safe_res->all_eval_steps[state->current_step_index];
        if (state->process_states[active->process_index] != PROC_STATE_COMPLETED) {
            state->process_states[active->process_index] = PROC_STATE_ACTIVE;
        }
    }
}

void trace_step_back(SimulatorState *state) {
    if (!state) return;
    if (state->current_step_index > 0) {
        state->current_step_index--;
    }
}

void trace_reset_stepper(SimulatorState *state) {
    if (!state) return;
    state->current_step_index = 0;
    state->is_playing = false;
    for (int p = 0; p < state->num_processes; p++) {
        state->process_states[p] = PROC_STATE_WAITING;
    }
}

void trace_set_speed(SimulatorState *state, double speed) {
    if (!state) return;
    state->play_speed = speed;
}

const BankerStep* trace_get_active_step(const SimulatorState *state, const SafeStateResult *safe_res) {
    if (!state || !safe_res) return NULL;
    if (state->current_step_index >= 0 && state->current_step_index < safe_res->all_eval_step_count) {
        return &safe_res->all_eval_steps[state->current_step_index];
    }
    return NULL;
}

void trace_format_eval_banner(const BankerStep *step, char *buffer, size_t buf_size) {
    if (!step || !buffer || buf_size == 0) return;
    snprintf(buffer, buf_size, "[Step %d] %s: %s",
             step->step_number, step->process_name, step->description);
}
