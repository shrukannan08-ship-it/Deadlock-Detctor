#ifndef TRACE_H
#define TRACE_H

#include "simulator.h"
#include "prevention.h"
#include <stdbool.h>

/* Stepper playback control functions */
void trace_step_forward(SimulatorState *state, const SafeStateResult *safe_res);
void trace_step_back(SimulatorState *state);
void trace_reset_stepper(SimulatorState *state);
void trace_set_speed(SimulatorState *state, double speed);

/* Step inspection */
const BankerStep* trace_get_active_step(const SimulatorState *state, const SafeStateResult *safe_res);

/* Format step info */
void trace_format_eval_banner(const BankerStep *step, char *buffer, size_t buf_size);

#endif /* TRACE_H */
