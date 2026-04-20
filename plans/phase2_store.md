# Phase 2: State Management (Zustand Store)

## Overview
Implement the central Zustand store to manage nodes, edges, and node properties.

## Tasks
- [ ] Create `src/store/useStore.ts`.
- [ ] Implement base React Flow actions: `onNodesChange`, `onEdgesChange`, `onConnect`.
- [ ] Implement node selection: `setSelectedNode(nodeId)`.
- [ ] Implement node property updates:
    - [ ] `updateNodeLabel(nodeId, label)`
    - [ ] `addInput(nodeId)`, `removeInput(nodeId, inputId)`, `updateInputName(nodeId, inputId, name)`
    - [ ] `addOutput(nodeId)`, `removeOutput(nodeId, outputId)`, `updateOutputName(nodeId, outputId, name)`
- [ ] Implement "Add Node" action for the canvas.
