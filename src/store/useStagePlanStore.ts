import { create } from "zustand";
import { Node, OnNodesChange, applyNodeChanges } from "@xyflow/react";
import { CustomNodeData } from "../types/diagram";
import { ProjectState } from "@/utils/projectIO";

interface HistoryState {
  nodes: Node<CustomNodeData>[];
}

interface DiagramState {
  nodes: Node<CustomNodeData>[];
  selectedNodeIds: string[];
  isStagePlanEnabled: boolean;
  title: string;
  subtitle: string;
  preparedBy: string;
  locationGroupsEnabled: boolean;
  // Undo/Redo
  undoStack: HistoryState[];
  redoStack: HistoryState[];
  undo: () => void;
  redo: () => void;
  recordHistory: () => void;

  // React Flow actions
  onNodesChange: OnNodesChange<Node<CustomNodeData>>;

  // Modal controls
  setIsStagePlanEnabled: (isOpen: boolean) => void;
  setSelectedNodeIds: (nodeIds: string[]) => void;

  // Export settings
  updateTitle: (title: string) => void;
  updateSubtitle: (subtitle: string) => void;
  updatePreparedBy: (preparedBy: string) => void;

  // Node property updates
  updateNodeHidden: (nodeIds: string[], hidden: boolean) => void;
  updateNodeShape: (
    nodeIds: string[],
    shape: "rectangle" | "circle" | "triangle",
  ) => void;
  updateNodeRotation: (nodeIds: string[], rotation: number) => void;
  updateNodeDimensions: (
    nodeIds: string[],
    width: number,
    height: number,
  ) => void;
  matchNode: (nodes: Node<CustomNodeData>[]) => void;
  moveNodes: (
    nodeIds: string[],
    delta: {
      x: number;
      y: number;
    },
  ) => void;
  prepareNodeForExport: (nodeId: string) => void;
  restoreNodeFromExport: (nodeId: string) => void;
  toggleLocationGroups: () => void;
  // Canvas actions
  restoreProjectState: (state: ProjectState) => void;
}

export const useStagePlanStore = create<DiagramState>((set, get) => ({
  nodes: [],
  selectedNodeIds: [],
  isStagePlanEnabled: false,
  title: "Stage Plan",
  subtitle: "I go to school by bus",
  preparedBy: "",
  undoStack: [],
  redoStack: [],
  toggleLocationGroups: () =>
    set((state) => ({ locationGroupsEnabled: !state.locationGroupsEnabled })),
  locationGroupsEnabled: false,
  undo: () => {
    const { undoStack, redoStack, nodes } = get();
    if (undoStack.length === 0) return;

    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    set({
      nodes: previousState.nodes,
      undoStack: newUndoStack,
      redoStack: [...redoStack, { nodes }],
    });
  },

  redo: () => {
    const { undoStack, redoStack, nodes } = get();
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    set({
      nodes: nextState.nodes,
      undoStack: [...undoStack, { nodes }],
      redoStack: newRedoStack,
    });
  },

  recordHistory: () => {
    const { nodes, undoStack } = get();
    const newUndoStack = [...undoStack, { nodes }].slice(-50);
    set({
      undoStack: newUndoStack,
      redoStack: [],
    });
  },

  prepareNodeForExport: (nodeId: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, exportingHidden: true },
          };
        }
        return node;
      }),
    });
  },

  restoreNodeFromExport: (nodeId: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, exportingHidden: false },
          };
        }
        return node;
      }),
    });
  },

  // React Flow actions
  onNodesChange: (changes) => {
    set((state) => {
      const newNodes = applyNodeChanges(changes, state.nodes);

      const hasDimensionChange = changes.some((c) => c.type === "dimensions");
      if (!hasDimensionChange) {
        return { nodes: newNodes };
      }

      const updatedNodes = newNodes.map((node) => {
        const dimChange = changes.find(
          (c) => c.type === "dimensions" && c.id === node.id,
        );
        if (dimChange) {
          return {
            ...node,
            data: {
              ...node.data,
              width: node.width,
              height: node.height,
            },
          };
        }
        return node;
      });

      return { nodes: updatedNodes };
    });
  },

  // Node selection
  setSelectedNodeIds: (nodeIds) => set({ selectedNodeIds: nodeIds }),

  updateNodeHidden: (nodeIds, hidden) => {
    const updatedNodes = get().nodes.map((node) => {
      if (nodeIds.includes(node.id)) {
        return {
          ...node,
          data: { ...node.data, hidden },
        };
      }
      return node;
    });

    set({
      nodes: updatedNodes,
    });
  },

  updateNodeShape: (nodeIds, shape) => {
    get().recordHistory();
    const updatedNodes = get().nodes.map((node) => {
      if (nodeIds.includes(node.id)) {
        return {
          ...node,
          data: { ...node.data, shape },
        };
      }
      return node;
    });

    set({
      nodes: updatedNodes,
    });
  },

  updateNodeRotation: (nodeIds, rotation) => {
    get().recordHistory();
    const updatedNodes = get().nodes.map((node) => {
      if (nodeIds.includes(node.id)) {
        return {
          ...node,
          data: { ...node.data, rotation },
        };
      }
      return node;
    });

    set({
      nodes: updatedNodes,
    });
  },

  updateNodeDimensions: (nodeIds, width, height) => {
    get().recordHistory();
    const updatedNodes = get().nodes.map((node) => {
      if (nodeIds.includes(node.id)) {
        return {
          ...node,
          data: { ...node.data, width, height },
        };
      }
      return node;
    });

    set({
      nodes: updatedNodes,
    });
  },

  moveNodes: (
    nodeIds: string[],
    delta: {
      x: number;
      y: number;
    },
  ) => {
    set({
      nodes: get().nodes.map((node) => {
        if (nodeIds.includes(node.id)) {
          return {
            ...node,
            position: {
              x: node.position.x + delta.x,
              y: node.position.y + delta.y,
            },
          };
        }
        return node;
      }),
    });
  },

  // Match nodes from main canvas
  matchNode: (nodes) => {
    get().recordHistory();
    const existingNodes = get().nodes;
    const existingNodesIds = existingNodes.map((node) => node.id);
    const outputNodes = nodes.map((node) => {
      const searchIndex = existingNodesIds.indexOf(node.id);
      if (searchIndex !== -1) return existingNodes[searchIndex];
      const newNode: Node<CustomNodeData> = {
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label,
          location: node.data.location,
          shape: node.data.shape,
          rotation: node.data.rotation,
          width: node.data.width,
          height: node.data.height,
          inputs: node.data.inputs,
          outputs: node.data.outputs,
          power: node.data.power,
          hidden: false,
        },
      };
      return newNode;
    });
    set({
      nodes: outputNodes,
    });
  },

  setIsStagePlanEnabled: (isOpen) => set({ isStagePlanEnabled: isOpen }),

  updateTitle: (title) => set({ title }),
  updateSubtitle: (subtitle) => set({ subtitle }),
  updatePreparedBy: (preparedBy) => set({ preparedBy }),
  clearStagePlan: () => {
    get().recordHistory();
    set({
      nodes: [],
      selectedNodeIds: [],
    });
  },
  restoreProjectState: (projectState: ProjectState) => {
    get().recordHistory();

    // 1. Nodes/Edges: Restore the main canvas data
    set({
      nodes: projectState.nodes,
      selectedNodeIds: [],
    });

     // 2. Templates: Restore saved templates
     set({
       title: projectState.stagePlanTitle,
       subtitle: projectState.stagePlanSubtitle,
       preparedBy: projectState.stagePlanPreparedBy,
     });
   },

}));
