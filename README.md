# Deadlock Detection & Prevention Simulator
**Operating Systems Academic Mini Project**

A modern, interactive Operating Systems simulator built with React, TypeScript, and Tailwind CSS to demonstrate core concurrency and resource allocation concepts:

* **Resource Allocation Graph (RAG)**: Visual representation of Processes (● cards/circles) and Resources (■ boxes) with directional allocation ($R_j \rightarrow P_i$) and request ($P_i \rightarrow R_j$) edges.
* **Deadlock Detection Algorithm**: Implementation of the standard OS detection algorithm for single and multi-instance resource systems.
* **Deadlock Prevention (Banker's Safety Check)**: Validates whether the current allocation and need state allows a safe execution sequence (e.g., $P_2 \rightarrow P_1 \rightarrow P_3$) to prevent deadlock.
* **Dynamic User Input Driven**: Configurable number of processes ($P_1 \dots P_N$), resources ($R_1 \dots R_M$), total instances, Allocation Matrix, and Request Matrix.

---

## 🛠️ Tech Stack

* **Frontend**: React 19 + TypeScript
* **Bundler**: Vite
* **Styling**: Tailwind CSS
* **Icons**: Lucide React

---

## 📂 Project Structure

```text
src/
├── algorithms/
│   ├── deadlockDetection.ts   # Standard OS Deadlock Detection algorithm
│   └── safeState.ts           # Banker's Safety State algorithm
├── components/
│   ├── Header.tsx             # Project header & status badge
│   ├── ConfigurationPanel.tsx # Process/Resource count & instance setup
│   ├── AllocationMatrix.tsx   # Process-to-Resource allocation matrix
│   ├── RequestMatrix.tsx      # Process-to-Resource request matrix
│   ├── ResourcePanel.tsx      # Available resources vector calculation
│   ├── ResourceGraph.tsx      # Resource Allocation Graph (SVG)
│   ├── ActionControls.tsx     # Detect Deadlock, Check Safe State, Reset
│   ├── DetectionResult.tsx    # Detection output & execution trace
│   └── SafeStateResult.tsx    # Safety check output & safe sequence flow
├── types/
│   └── deadlock.ts            # TypeScript interfaces
├── App.tsx                    # Main dashboard layout and state coordinator
├── main.tsx                   # App entry point
└── index.css                  # Theme & base styles
```

---

## 🚀 How to Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```
