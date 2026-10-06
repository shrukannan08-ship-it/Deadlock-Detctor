#ifndef GRAPH_H
#define GRAPH_H

#include "simulator.h"
#include "deadlock.h"
#include "prevention.h"

/* Structure representing an edge in the Resource Allocation Graph */
typedef struct {
    int from_id; /* Process index or Resource index */
    int to_id;
    bool is_allocation; /* true: Resource -> Process; false: Process -> Resource */
    int weight;
    bool is_deadlocked;
} RagEdge;

/* Graph summary statistics */
typedef struct {
    int total_nodes;
    int process_nodes;
    int resource_nodes;
    int allocation_edges_count;
    int request_edges_count;
    int total_edges_count;
    bool has_cycle;
} RagStats;

/* Compute RAG edges and statistics from current simulator state */
void graph_compute_stats(const SimulatorState *state, const DetectionResult *det_result, RagStats *stats);

/* Render Resource Allocation Graph to console */
void graph_render_rag(const SimulatorState *state, const DetectionResult *det_result, const SafeStateResult *safe_result);

#endif /* GRAPH_H */
