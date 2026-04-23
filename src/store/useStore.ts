import { create } from "zustand";
import {
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import {
  CustomNodeData,
  NodeInput,
  NodeOutput,
  NodeTemplate,
} from "../types/diagram";
import { ProjectState } from "@/utils/projectIO";

interface HistoryState {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
}

interface DiagramState {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  cableTypes: string[];
  isModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isNodeListModalOpen: boolean;
  pendingPosition: { x: number; y: number } | null;
  templates: NodeTemplate[];
  types: string[];
  locations: string[];
  title: string;
  subtitle: string;
  preparedBy: string;

  // Undo/Redo
  undoStack: HistoryState[];
  redoStack: HistoryState[];
  undo: () => void;
  redo: () => void;
  recordHistory: () => void;

  // React Flow actions
  onNodesChange: OnNodesChange<Node<CustomNodeData>>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: OnConnect;

  // Node selection
  setSelectedNodeIds: (nodeIds: string[]) => void;
  setSelectedEdgeIds: (edgeIds: string[]) => void;

  // Export settings
  updateTitle: (title: string) => void;
  updateSubtitle: (subtitle: string) => void;
  updatePreparedBy: (preparedBy: string) => void;

  // Node property updates
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeType: (nodeIds: string[], type: string) => void;
  updateNodeLocation: (nodeIds: string[], location: string) => void;
  updateNodePower: (nodeIds: string[], power: boolean) => void;
  addInput: (nodeId: string) => void;
  removeInput: (nodeId: string, inputId: string) => void;
  updateInputName: (nodeId: string, inputId: string, name: string) => void;
  addOutput: (nodeId: string) => void;
  removeOutput: (nodeId: string, outputId: string) => void;
  updateOutputName: (nodeId: string, outputId: string, name: string) => void;

  // Template actions
  addTemplate: (template: NodeTemplate) => void;
  applyTemplate: (
    template: NodeTemplate,
    position: { x: number; y: number },
  ) => void;
  updateTemplate: (template: NodeTemplate) => void;
  deleteTemplate: (templateId: string) => void;

  // Canvas actions
  addNode: (
    type: string,
    position: { x: number; y: number },
    label: string,
    inputsCount?: number,
    outputsCount?: number,
    typeProperty?: string,
    locationProperty?: string,
    power?: boolean,
  ) => void;
  copyNodes: (nodeIds: string[]) => void;
  deleteNodes: (nodeIds: string[]) => void;
  deleteEdge: (edgeIds: string[]) => void;
  addCableType: (type: string) => void;
  removeCableType: (type: string) => void;
  updateEdgeCableType: (edgeIds: string[], cableType: string) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  setIsNodeListModalOpen: (isOpen: boolean) => void;
  setPendingPosition: (position: { x: number; y: number } | null) => void;
  addType: (type: string) => void;
  removeType: (type: string) => void;
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  restoreProjectState: (state: ProjectState) => void;
}

export const useStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  selectedEdgeIds: [],
  cableTypes: [],
  isModalOpen: false,
  isSettingsModalOpen: false,
  isNodeListModalOpen: false,
  pendingPosition: null,
  templates: [],
  types: [],
  locations: [],
  title: "Technical Rider",
  subtitle: "I go to school by bus",
  preparedBy: "",
  undoStack: [],
  redoStack: [],

  undo: () => {
    const { undoStack, redoStack, nodes, edges } = get();
    if (undoStack.length === 0) return;

    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    set({
      nodes: previousState.nodes,
      edges: previousState.edges,
      undoStack: newUndoStack,
      redoStack: [...redoStack, { nodes, edges }],
    });
  },

  redo: () => {
    const { undoStack, redoStack, nodes, edges } = get();
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    set({
      nodes: nextState.nodes,
      edges: nextState.edges,
      undoStack: [...undoStack, { nodes, edges }],
      redoStack: newRedoStack,
    });
  },

  recordHistory: () => {
    const { nodes, edges, undoStack } = get();
    const newUndoStack = [...undoStack, { nodes, edges }].slice(-50);
    set({
      undoStack: newUndoStack,
      redoStack: [],
    });
  },

  // React Flow actions
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    get().recordHistory();
    set({
      edges: addEdge(
        {
          ...connection,
          data: { cableType: "none" },
        },
        get().edges,
      ),
    });
  },

  // Node selection
  setSelectedNodeIds: (nodeIds) => set({ selectedNodeIds: nodeIds }),
  setSelectedEdgeIds: (edgeIds) => set({ selectedEdgeIds: edgeIds }),

  // Node property updates
  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, label },
          };
        }
        return node;
      }),
    });
  },

  updateNodeType: (nodeIds, type) => {
    get().recordHistory();
    set({
      nodes: get().nodes.map((node) => {
        if (nodeIds.includes(node.id)) {
          return {
            ...node,
            data: { ...node.data, type },
          };
        }
        return node;
      }),
    });
  },

  updateNodeLocation: (nodeIds, location) => {
    get().recordHistory();
    set({
      nodes: get().nodes.map((node) => {
        if (nodeIds.includes(node.id)) {
          return {
            ...node,
            data: { ...node.data, location },
          };
        }
        return node;
      }),
    });
  },
  updateNodePower: (nodeIds, power) => {
    get().recordHistory();
    set({
      nodes: get().nodes.map((node) => {
        if (nodeIds.includes(node.id)) {
          return {
            ...node,
            data: { ...node.data, power },
          };
        }
        return node;
      }),
    });
  },

  addInput: (nodeId) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          const newInput: NodeInput = { id: nanoid(), name: "New Input" };
          return {
            ...node,
            data: {
              ...node.data,
              inputs: [...(node.data.inputs || []), newInput],
            },
          };
        }
        return node;
      }),
    });
  },

  removeInput: (nodeId, inputId) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              inputs: (node.data.inputs || []).filter(
                (input) => input.id !== inputId,
              ),
            },
          };
        }
        return node;
      }),
    });
  },

  updateInputName: (nodeId, inputId, name) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              inputs: (node.data.inputs || []).map((input) =>
                input.id === inputId ? { ...input, name } : input,
              ),
            },
          };
        }
        return node;
      }),
    });
  },

  addOutput: (nodeId) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          const newOutput: NodeOutput = { id: nanoid(), name: "New Output" };
          return {
            ...node,
            data: {
              ...node.data,
              outputs: [...(node.data.outputs || []), newOutput],
            },
          };
        }
        return node;
      }),
    });
  },

  removeOutput: (nodeId, outputId) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              outputs: (node.data.outputs || []).filter(
                (output) => output.id !== outputId,
              ),
            },
          };
        }
        return node;
      }),
    });
  },

  updateOutputName: (nodeId, outputId, name) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              outputs: (node.data.outputs || []).map((output) =>
                output.id === outputId ? { ...output, name } : output,
              ),
            },
          };
        }
        return node;
      }),
    });
  },

  addTemplate: (template) => {
    set({
      templates: [...get().templates, template],
    });
  },

  applyTemplate: (template, position) => {
    get().recordHistory();
    const newNode: Node<CustomNodeData> = {
      id: nanoid(),
      type: template.nodeType,
      position,
      data: {
        label: template.name,
        inputs: template.inputs,
        outputs: template.outputs,
        type: template.type,
        power: template.power,
      },
    };
    set({
      nodes: [...get().nodes, newNode],
    });
  },

  updateTemplate: (template) => {
    set({
      templates: get().templates.map((t) =>
        t.id === template.id ? template : t,
      ),
    });
  },

  // --- Project State Management ---
  restoreProjectState: (projectState: ProjectState) => {
    get().recordHistory();

    // 1. Nodes/Edges: Restore the main canvas data
    set({
      nodes: projectState.nodes,
      edges: projectState.edges,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      // Clear temporary/local state indicators when reloading
      pendingPosition: null,
    });

    // 2. Templates: Restore saved templates
    set({
      templates: projectState.templates,
      types: projectState.types,
      locations: projectState.locations,
      cableTypes: projectState.cableTypes,
      title: projectState.title,
      preparedBy: projectState.preparedBy,
    });
  },
  deleteTemplate: (templateId) => {
    set({
      templates: get().templates.filter((t) => t.id !== templateId),
    });
  },

  addNode: (
    type,
    position,
    label,
    inputsCount = 0,
    outputsCount = 0,
    typeProperty,
    locationProperty,
    power = false,
  ) => {
    get().recordHistory();
    const inputs = Array.from({ length: inputsCount }, (_, i) => ({
      id: nanoid(),
      name: `Input ${i + 1}`,
    }));

    const outputs = Array.from({ length: outputsCount }, (_, i) => ({
      id: nanoid(),
      name: `Output ${i + 1}`,
    }));

    const newNode: Node<CustomNodeData> = {
      id: nanoid(),
      type,
      position,
      data: {
        label,
        inputs,
        outputs,
        type: typeProperty,
        location: locationProperty,
        power,
      },
    };
    set({
      nodes: [...get().nodes, newNode],
    });
  },

  copyNodes: (nodeIds: string[]) => {
    get().recordHistory();
    const newNodes = nodeIds
      .map((nodeId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (!node) return null;
        return {
          ...node,
          id: nanoid(),
          position: {
            x: node.position.x + 20,
            y: node.position.y + 20,
          },
        };
      })
      .filter((node): node is Node<CustomNodeData> => node !== null);

    set({
      nodes: [...get().nodes, ...newNodes],
    });
  },

  deleteNodes: (nodeIds: string[]) => {
    get().recordHistory();
    set({
      nodes: get().nodes.filter((node) => !nodeIds.includes(node.id)),
      edges: get().edges.filter(
        (edge) =>
          !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target),
      ),
      selectedNodeIds: [],
      selectedEdgeIds: [],
    });
  },

  deleteEdge: (edgeIds: string[]) => {
    get().recordHistory();
    set({
      edges: get().edges.filter((edge) => !edgeIds.includes(edge.id)),
      selectedEdgeIds: [],
    });
  },

  addCableType: (type) => set({ cableTypes: [...get().cableTypes, type] }),
  removeCableType: (type) =>
    set({ cableTypes: get().cableTypes.filter((t) => t !== type) }),
  updateEdgeCableType: (edgeIds, cableType) => {
    get().recordHistory();
    set({
      edges: get().edges.map((edge) => {
        if (edgeIds.includes(edge.id)) {
          return {
            ...edge,
            data: { ...edge.data, cableType: cableType },
          };
        }
        return edge;
      }),
    });
  },

  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setIsSettingsModalOpen: (isOpen) => set({ isSettingsModalOpen: isOpen }),
  setIsNodeListModalOpen: (isOpen) => set({ isNodeListModalOpen: isOpen }),
  setPendingPosition: (position) => set({ pendingPosition: position }),
  updateTitle: (title) => set({ title }),
  updateSubtitle: (subtitle) => set({ subtitle }),
  updatePreparedBy: (preparedBy) => set({ preparedBy }),
  addType: (type) => set({ types: [...get().types, type] }),
  removeType: (type) => set({ types: get().types.filter((t) => t !== type) }),
  addLocation: (location) => set({ locations: [...get().locations, location] }),
  removeLocation: (location) =>
    set({ locations: get().locations.filter((l) => l !== location) }),
}));
