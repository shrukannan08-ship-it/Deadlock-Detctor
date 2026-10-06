# NEXUS OS Deadlock Detection & Prevention Simulator (C Implementation)

A modular, high-fidelity C implementation of the **Deadlock Detection & Prevention Simulator**, converting the entire React/TypeScript web application to standard C while fully preserving its features, workflow, algorithms, terminology, navigation hierarchy, and visual terminal dashboard.

---

## 🌟 Feature Preservation Checklist

Every feature and architectural component from the original simulator is completely preserved:

| Feature / Section | Original Website | C Implementation | Status |
|---|---|---|---|
| **Branding & Header** | NEXUS OS Resource Terminal v2.4, status badges, search filter | Header with TrueColor ANSI styling, real-time status indicators, search query | ✅ Preserved |
| **Navigation & Sidebar** | 7 Main Sections: Dashboard, Setup, Sim Player, Matrices, Resources, Analytics, Request | 7 Active Views with direct numbered shortcuts (`1` to `7`) and tab indicators | ✅ Preserved |
| **Metric Cards** | Total Processes, Resource Types, System State badge with telemetry, Total Capacity | 4-Card Overview Header with identical terminology, values, and vector classes | ✅ Preserved |
| **Simulation Setup** | Configurable Processes (1..8), Resources (1..6), Total Capacities, Initialize, Reset | Interactive `dim`, `init`, `total`, and setup configuration with bounds validation | ✅ Preserved |
| **Allocation Matrix** | Process-to-Resource currently held matrix (P1..Pn x R1..Rm) | Interactive matrix editor, snapshot views, cell & row updates, active highlighting | ✅ Preserved |
| **Maximum Matrix** | Maximum declared demand limit | Interactive matrix editor, ensures Max >= Allocation constraint | ✅ Preserved |
| **Need Matrix** | Auto-calculated dynamically ($Need = Max - Allocation$) | Auto-calculated dynamically on any allocation/maximum matrix edit | ✅ Preserved |
| **Request Matrix** | Process-to-Resource outstanding claims for deadlock detection | Interactive matrix editor, used by standard Deadlock Detection Algorithm | ✅ Preserved |
| **Available Resources** | Calculated automatically: $Available = Total - \sum Allocation$ | Calculated automatically, displayed across all system-state panels | ✅ Preserved |
| **Deadlock Detection** | Standard OS detection algorithm (Silberschatz) for multi-instance resources | Full algorithm in `deadlock.c`: Work, Finish, circular wait cycle detection | ✅ Preserved |
| **Safe State Check** | Banker's Safety Algorithm using Need matrix, safe sequence output | Full algorithm in `prevention.c`: dynamic safe sequence (e.g. $P_2 \rightarrow P_1 \rightarrow P_3$) | ✅ Preserved |
| **Unsafe State Explanation**| Final Work pool at halt, blocked processes, deficit resources | Dynamic reasoning with failed comparisons, deficit resource tags, risk analysis | ✅ Preserved |
| **Resource Request / Prevention** | 3-Step Banker's Request Evaluation: Claim limit, Available check, Tentative safety | Full Banker's request protocol in `prevention.c`: Step 1, Step 2, Step 3, Grant/Deny | ✅ Preserved |
| **Grant / Deny & Apply** | Tentative rollback on Deny; Apply Allocation button on Grant | Dynamic rollback on Deny; `apply` command updates actual state and recalculates | ✅ Preserved |
| **Resource Allocation Graph (RAG)** | Process nodes, Resource nodes, Allocation ($R \rightarrow P$), Request ($P \rightarrow R$) | ASCII/Unicode graph diagram in `graph.c`, cycle highlight, relationship matrix | ✅ Preserved |
| **Process Lifecycle Monitor**| Dynamic pills: WAITING, ACTIVE, COMPLETED, BLOCKED | Dynamic state tracking matching algorithm steps, colored indicator pills | ✅ Preserved |
| **Simulation Player** | Run, Pause, Next Step, Prev Step, Reset Stepper, Speed selector | Step forward (`n`), Step back (`b`), Run (`p`), Reset (`0`), Speed toggle (`x`) | ✅ Preserved |
| **Execution Trace Log** | Step #, Process, Status, Need, Work Before, Alloc Released, New Work | Structured table with step details, highlighted active step, formatted vectors | ✅ Preserved |
| **Resources Pool Monitor** | Resource assets, Capacities, Available, Allocated sum, Utilization gauge | Pool monitor table with capacity, availability, allocated sum, utilization bar | ✅ Preserved |
| **Simulation Analytics** | System utilization gauge, Saturation status, Demand breakdown, Activity stream | Real-time telemetry: load %, capacity status, process breakdown, activity feed | ✅ Preserved |
| **Process Inspector** | Drawer inspecting Process vectors, status, and feasibility analysis | Interactive process inspection (`inspect` or `8`), vector breakdown, deficit report | ✅ Preserved |
| **Reset Functionality** | Clears all states, matrices, traces, and results | `reset` (`r`) command restores default or clean unpopulated state | ✅ Preserved |

---

## 🏗️ Code Architecture

The implementation is modularized into clear, specialized C files:

```text
c-implementation/
├── main.c           # CLI parsing, automated test runner, and interactive TUI loop
├── simulator.h      # Core state data structures, matrix dimensions, enums
├── simulator.c      # State management, Need/Available calculations, validators, setters
├── deadlock.h       # Deadlock detection algorithm headers and step models
├── deadlock.c       # Standard OS Deadlock Detection algorithm (Silberschatz)
├── prevention.h     # Banker's safety and resource request structures and headers
├── prevention.c     # Banker's Safety Algorithm and Banker's Resource-Request Algorithm
├── display.h        # Terminal dashboard layout declarations, TrueColor ANSI palette
├── display.c        # Dashboard views, metric cards, tables, status cards, inspector
├── graph.h          # Resource Allocation Graph (RAG) data models and statistics
├── graph.c          # RAG ASCII/Unicode renderer, cycle detection, edge matrix
├── trace.h          # Stepper playback controls and active step inspector headers
├── trace.c          # Step forward, step back, speed controls, active step banner
├── Makefile         # Standard makefile for Unix/Linux/MinGW build
├── build.bat        # Automated Windows build script supporting MSYS2 / GCC
└── README.md        # Comprehensive documentation and verification guide
```

---

## ⚙️ How to Build and Run

### Option 1: Using `build.bat` (Windows)
Double-click `build.bat` or run in Command Prompt / PowerShell:
```cmd
build.bat
```
This automatically detects your GCC installation (including MSYS2 UCRT64 / MinGW64), builds `simulator.exe`, and runs the self-test suite.

### Option 2: Using standard `gcc` directly
```bash
gcc -Wall -Wextra -std=c11 -O2 -I. main.c simulator.c deadlock.c prevention.c display.c graph.c trace.c -o simulator.exe
```

### Option 3: Using `make`
```bash
make
```

---

## 🧪 Automated Verification Test Suite

The C implementation includes built-in automated test runners matching the exact verification cases specified in Section 23 of the prompt:

### 1. Safe State Verification Case (Section 23)
```bash
./simulator.exe --test-safe
```
* **Configuration**: $N = 3$ Processes, $M = 2$ Resources. Total: $R_1 = 3, R_2 = 2$.
* **Allocation**:
  * $P_1 = [1, 0]$
  * $P_2 = [1, 1]$
  * $P_3 = [0, 0]$
* **Request**:
  * $P_1 = [0, 1]$
  * $P_2 = [0, 0]$
  * $P_3 = [1, 0]$
* **Expected Output**: **SAFE STATE** (Safe Sequence: $P_1 \rightarrow P_2 \rightarrow P_3$).
* **Result**: **PASSED** ✅

### 2. Deadlock Verification Case (Section 23)
```bash
./simulator.exe --test-deadlock
```
* **Configuration**: $N = 2$ Processes, $M = 2$ Resources. Total: $R_1 = 1, R_2 = 1$.
* **Allocation**:
  * $P_1 = [1, 0]$
  * $P_2 = [0, 1]$
* **Request**:
  * $P_1 = [0, 1]$
  * $P_2 = [1, 0]$
* **Expected Output**: **DEADLOCK DETECTED** (Processes $P_1, P_2$ involved in circular wait; Resources $R_1, R_2$ involved).
* **Result**: **PASSED** ✅

### 3. Resource Request / Banker's Prevention Case
```bash
./simulator.exe --test-request
```
* **Test A (Valid Request)**: $P_2$ requests $[1, 0, 2]$ $\rightarrow$ **GRANTED** (System remains in Safe State).
* **Test B (Exceeds Need)**: $P_1$ requests $[8, 0, 0]$ $\rightarrow$ **DENIED** (Exceeds declared maximum claim).
* **Test C (Exceeds Available)**: $P_1$ requests $[4, 0, 0]$ $\rightarrow$ **DENIED** (Insufficient available pool).
* **Result**: **PASSED** ✅

### 4. Run All Verification Suites
```bash
./simulator.exe --test-all
```

---

## 🎮 Interactive Dashboard Guide

Run without arguments to launch the full interactive terminal dashboard:
```bash
./simulator.exe
```

### Key Navigation Shortcuts
* `1` or `overview` : Dashboard Overview & System Statistics
* `2` or `setup`    : Simulation Setup Panel
* `3` or `trace`    : Real-Time Algorithm Simulator & Trace
* `4` or `matrices` : Matrices Workspace (Alloc, Max, Need, Req)
* `5` or `resources`: Available Resources & Pool Monitor
* `6` or `analytics`: Graph & Analytics (Resource Allocation Graph + Telemetry)
* `7` or `request`  : Resource Request & Dynamic Banker's Prevention
* `8` or `inspect`  : Process Inspector Drawer (inspect any process)
* `s` or `search`   : Search filter by process (`P1`) or resource (`R1`)
* `r` or `reset`    : Reset simulator state
* `q` or `quit`     : Exit simulator

### Algorithm Execution Controls
* `c` : Run Banker's Safety Algorithm (**Check Safe State**)
* `d` : Run standard OS Deadlock Detection (**Detect Deadlock**)
* `p` : Run / Play simulation to completion
* `n` : Step forward to next evaluation step
* `b` : Step back to previous evaluation step
* `0` : Reset stepper back to step 0
* `x` : Toggle playback speed ($0.5\times \rightarrow 1.0\times \rightarrow 2.0\times$)

### Matrix Editing Controls
* `a`   : Edit Allocation Matrix (select process and enter values)
* `m`   : Edit Maximum Matrix (select process and enter values)
* `req` : Edit Request Matrix (select process and enter values)
* `t`   : Switch matrix tab (Banker's 3-column, Deadlock 2-column, All 4 matrices)
* `dim` : Change dimensions (configure custom $N$ and $M$)
* `init`: Reinitialize matrices to 0
* `total`: Edit total resource capacities

### Resource Request / Prevention Workflow
1. Press `7` to navigate to **Resource Request**.
2. Press `proc` to select the requesting process (e.g. $P_1 \dots P_N$).
3. Press `enter-req` to enter requested resource quantities.
4. Press `e` to execute the **3-Step Banker's Request Evaluation Protocol**:
   * Step 1: $Request \le Need$
   * Step 2: $Request \le Available$
   * Step 3: Tentative Safety Test
5. If granted, press `apply` to commit the allocation to actual system state.
