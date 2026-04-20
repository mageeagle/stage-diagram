# Phase 4: UI Components (Canvas & Inspector)

## Overview
Build the main Diagram Canvas and the Property Inspector side panel.

## Tasks
- [ ] Create `src/components/diagram/DiagramCanvas.tsx`:
    - [ ] Implement the main `ReactFlow` component.
    - [ ] Register `CustomNode` as a node type.
    - [ ] Handle canvas clicks to deselect nodes.
- [ ] Create `src/components/inspector/PropertyInspector.tsx`:
    - [ ] Implement a side panel that appears when a node is selected.
    - [ ] Add an input field for the Node Label.
    - [ ] Create an "Inputs" section with:
        - [ ] List of inputs with text inputs for names.
        - [ ] "Add Input" button.
        - [ ] "Delete" button for each input.
    - [ ] Create an "Outputs" section with:
        - [ ] List of outputs with text inputs for names.
        - [ ] "Add Output" button.
        - [ ] "Delete" button for each output.
