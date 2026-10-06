#ifndef DISPLAY_H
#define DISPLAY_H

#include "simulator.h"
#include "deadlock.h"
#include "prevention.h"

/* Terminal ANSI Color Palette Constants */
#define COLOR_RESET       "\033[0m"
#define COLOR_BOLD        "\033[1m"
#define COLOR_DIM         "\033[2m"
#define COLOR_UNDERLINE   "\033[4m"

#define COLOR_HEADER_BG   "\033[48;2;7;10;25m"
#define COLOR_PANEL_BG    "\033[48;2;10;14;34m"
#define COLOR_SUBPANEL_BG "\033[48;2;12;17;38m"

#define COLOR_WHITE       "\033[1;37m"
#define COLOR_SLATE       "\033[38;2;148;163;184m"
#define COLOR_MUTED       "\033[38;2;100;116;139m"
#define COLOR_BORDER      "\033[38;2;25;35;68m"

#define COLOR_BLUE        "\033[38;2;59;130;246m"
#define COLOR_INDIGO      "\033[38;2;99;102;241m"
#define COLOR_CYAN        "\033[38;2;6;182;212m"
#define COLOR_PURPLE      "\033[38;2;168;85;247m"
#define COLOR_EMERALD     "\033[38;2;16;185;129m"
#define COLOR_ROSE        "\033[38;2;244;63;94m"
#define COLOR_AMBER       "\033[38;2;245;158;11m"

/* Screen and Section Rendering Functions */
void display_clear_screen(void);
void display_header(const SimulatorState *state);
void display_footer(void);
void display_nav_bar(const SimulatorState *state);
void display_metric_cards(const SimulatorState *state, const SafeStateResult *safe_res);

/* Section View Renderers */
void display_view_overview(const SimulatorState *state, const DetectionResult *det_res, const SafeStateResult *safe_res);
void display_view_simulation_setup(const SimulatorState *state);
void display_view_trace(SimulatorState *state, const SafeStateResult *safe_res, const DetectionResult *det_res);
void display_view_matrices(const SimulatorState *state);
void display_view_resources(const SimulatorState *state);
void display_view_analytics(const SimulatorState *state, const DetectionResult *det_res, const SafeStateResult *safe_res);
void display_view_resource_request(const SimulatorState *state, const ResourceRequestResult *req_res);
void display_view_process_inspector(const SimulatorState *state, int process_idx);

/* Individual Component Renderers */
void display_safe_sequence_card(const SafeStateResult *safe_res);
void display_unsafe_explanation_card(const SafeStateResult *safe_res);
void display_detection_result_card(const DetectionResult *det_res);
void display_trace_table(const SafeStateResult *safe_res, int current_step_num, const char *search_query);
void display_matrix_table(const char *title, const char *subtitle, const char *header_color,
                          int rows, int cols, const int matrix[MAX_PROCESSES][MAX_RESOURCES],
                          const char *search_query, int active_p, const int *deadlocked_p, int dl_count);
void display_activity_feed(const DetectionResult *det_res, const SafeStateResult *safe_res);

#endif /* DISPLAY_H */
