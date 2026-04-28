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
  isHelpModalOpen: boolean;
  pendingPosition: { x: number; y: number } | null;
  templates: NodeTemplate[];
  types: string[];
  locations: string[];
  locationGroupsEnabled: boolean;
  riderListTitle: string;
  riderListSubtitle: string;
  riderListPreparedBy: string;
  canvasTitle: string;
  canvasSubtitle: string;
  canvasPreparedBy: string;
  hideTitle: boolean;
  hideRiderTitle: boolean;
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
  updateRiderListTitle: (title: string) => void;
  updateRiderListSubtitle: (subtitle: string) => void;
  updateRiderListPreparedBy: (preparedBy: string) => void;
  updateCanvasTitle: (title: string) => void;
  updateCanvasSubtitle: (subtitle: string) => void;
  updateCanvasPreparedBy: (preparedBy: string) => void;

  // Node property updates
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeType: (nodeIds: string[], type: string) => void;
  updateNodeLocation: (nodeIds: string[], location: string) => void;
  updateNodePower: (nodeIds: string[], power: boolean) => void;
  updateNodeHidden: (nodeIds: string[], hidden: boolean) => void;
  updateNodeHideFromList: (nodeIds: string[], hideFromList: boolean) => void;
  updateEdgeType: (edgeIds: string[], type: string) => void;
  moveNodes: (
    nodeIds: string[],
    delta: {
      x: number;
      y: number;
    },
  ) => void;
  addInput: (nodeId: string) => void;
  removeInput: (nodeId: string, inputId: string) => void;
  updateInputName: (nodeId: string, inputId: string, name: string) => void;
  addOutput: (nodeId: string) => void;
  removeOutput: (nodeId: string, outputId: string) => void;
  updateOutputName: (nodeId: string, outputId: string, name: string) => void;
  prepareNodeForExport: (nodeId: string) => void;
  restoreNodeFromExport: (nodeId: string) => void;
  prepareEdgeForExport: (edgeId: string) => void;
  restoreEdgeFromExport: (edgeId: string) => void;

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
  setIsHelpModalOpen: (isOpen: boolean) => void;
  setPendingPosition: (position: { x: number; y: number } | null) => void;
  addType: (type: string) => void;
  removeType: (type: string) => void;
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  restoreProjectState: (state: ProjectState) => void;
  toggleLocationGroups: () => void;
  toggleHideTitle: () => void;
  toggleHideRiderTitle: () => void;
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
  isHelpModalOpen: false,
  pendingPosition: null,
  templates: [],
  types: [],
  locations: [],
  riderListTitle: "Technical Rider",
  riderListSubtitle: "I go to school by bus",
  riderListPreparedBy: "",
  canvasTitle: "Signal Flow",
  canvasSubtitle: "I go to school by bus",
  canvasPreparedBy: "",
  undoStack: [],
  redoStack: [],
  hideTitle: false,
  hideRiderTitle: false,
  toggleHideTitle: () => set((state) => ({ hideTitle: !state.hideTitle })),
  toggleHideRiderTitle: () => set((state) => ({ hideRiderTitle: !state.hideRiderTitle })),
  toggleLocationGroups: () =>
    set((state) => ({ locationGroupsEnabled: !state.locationGroupsEnabled })),
  locationGroupsEnabled: false,
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

  prepareEdgeForExport: (edgeId: string) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: { ...edge.data, exportingHidden: true },
          };
        }
        return edge;
      }),
    });
  },

  restoreEdgeFromExport: (edgeId: string) => {
    set({
      edges: get().edges.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: { ...edge.data, exportingHidden: false },
          };
        }
        return edge;
      }),
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
          data: {
            cableType: "none",
            hidden: false,
          },
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

    const updatedEdges = get().edges.map((edge) => {
      if (nodeIds.includes(edge.source) || nodeIds.includes(edge.target)) {
        return {
          ...edge,
          data: {
            ...edge.data,
            hidden: hidden,
          },
        };
      }
      return edge;
    });

    set({
      nodes: updatedNodes,
      edges: updatedEdges,
    });
  },

  updateNodeHideFromList: (nodeIds, hideFromList) => {
    get().recordHistory();

    const updatedNodes = get().nodes.map((node) => {
      if (nodeIds.includes(node.id)) {
        return {
          ...node,
          data: { ...node.data, hideFromList },
        };
      }
      return node;
    });

    const updatedEdges = get().edges.map((edge) => {
      if (nodeIds.includes(edge.source) || nodeIds.includes(edge.target)) {
        return {
          ...edge,
          data: {
            ...edge.data,
            hideFromList,
          },
        };
      }
      return edge;
    });

    set({
      nodes: updatedNodes,
      edges: updatedEdges,
    });
  },

  updateEdgeType: (edgeIds, type) => {
    get().recordHistory();
    set({
      edges: get().edges.map((edge) => {
        if (edgeIds.includes(edge.id)) {
          return {
            ...edge,
            type,
          };
        }
        return edge;
      }),
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
        hidden: false,
        hideFromList: false,
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
      riderListTitle: projectState.riderListTitle,
      riderListSubtitle: projectState.riderListSubtitle,
      riderListPreparedBy: projectState.riderListPreparedBy,
      canvasTitle: projectState.canvasTitle,
      canvasSubtitle: projectState.canvasSubtitle,
      canvasPreparedBy: projectState.canvasPreparedBy,
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
        hidden: false,
        hideFromList: false,
      },
    };
    set({
      nodes: [...get().nodes, newNode],
    });
  },

  copyNodes: (nodeIds: string[]) => {
    get().recordHistory();
    const { nodes, edges } = get();

    // 1. Expand nodeIds to include all nodes in any groups selected
    let expandedNodeIds = [...nodeIds];
    for (const id of nodeIds) {
      if (id.startsWith("group-")) {
        const nodesInGroup = nodes
          .filter((n) => n.data.location === id)
          .map((n) => n.id);
        expandedNodeIds = Array.from(
          new Set([...expandedNodeIds, ...nodesInGroup]),
        );
      }
    }

    // 2. Create new nodes
    const nodeMap = new Map<string, string>(); // oldId -> newId
    const newNodes: Node<CustomNodeData>[] = expandedNodeIds
      .map((oldId) => {
        const node = nodes.find((n) => n.id === oldId);
        if (!node) return null;

        const newId = nanoid();
        nodeMap.set(oldId, newId);

        const newNode: Node<CustomNodeData> = {
          ...node,
          id: newId,
          position: {
            x: node.position.x + 20,
            y: node.position.y + 20,
          },
          data: {
            ...node.data,
          },
        };
        return newNode;
      })
      .filter((node): node is Node<CustomNodeData> => node !== null);

    // 3. Create new edges
    const newEdges: Edge[] = edges
      .map((edge) => {
        const sourceInCopy = nodeMap.has(edge.source);
        const targetInCopy = nodeMap.has(edge.target);

        if (sourceInCopy && targetInCopy) {
          // Both nodes are being copied
          return {
            ...edge,
            id: nanoid(),
            source: nodeMap.get(edge.source)!,
            target: nodeMap.get(edge.target)!,
          };
        } else if (sourceInCopy) {
          // Only source is being copied
          return {
            ...edge,
            id: nanoid(),
            source: nodeMap.get(edge.source)!,
            target: edge.target,
          };
        } else if (targetInCopy) {
          // Only target is being copied
          return {
            ...edge,
            id: nanoid(),
            source: edge.source,
            target: nodeMap.get(edge.target)!,
          };
        }
        // Neither is being copied
        return null;
      })
      .filter((edge): edge is Edge => edge !== null);

    // 4. Update state
    set((state) => {
      const updatedNodes = state.nodes.map((node) => {
        if (expandedNodeIds.includes(node.id)) {
          return { ...node, selected: false };
        }
        return node;
      });

      return {
        nodes: [
          ...updatedNodes,
          ...newNodes.map((n) => ({ ...n, selected: true })),
        ],
        edges: [...state.edges, ...newEdges],
        selectedNodeIds: newNodes.map((n) => n.id),
        selectedEdgeIds: [],
      };
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

  addCableType: (type) => {
    if (!get().cableTypes.includes(type)) {
      set({ cableTypes: [...get().cableTypes, type] });
    }
  },
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
  setIsHelpModalOpen: (isOpen) => set({ isHelpModalOpen: isOpen }),
  setPendingPosition: (position) => set({ pendingPosition: position }),
  updateRiderListTitle: (title) => set({ riderListTitle: title }),
  updateRiderListSubtitle: (subtitle) => set({ riderListSubtitle: subtitle }),
  updateRiderListPreparedBy: (preparedBy) =>
    set({ riderListPreparedBy: preparedBy }),
  updateCanvasTitle: (title) => set({ canvasTitle: title }),
  updateCanvasSubtitle: (subtitle) => set({ canvasSubtitle: subtitle }),
  updateCanvasPreparedBy: (preparedBy) => set({ canvasPreparedBy: preparedBy }),
  addType: (type) => {
    if (!get().types.includes(type)) {
      set({ types: [...get().types, type] });
    }
  },
  removeType: (type) => set({ types: get().types.filter((t) => t !== type) }),
  addLocation: (location) => {
    if (!get().locations.includes(location)) {
      set({ locations: [...get().locations, location] });
    }
  },
  removeLocation: (location) =>
    set({ locations: get().locations.filter((l) => l !== location) }),
}));
