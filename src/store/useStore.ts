import { create } from 'zustand';
import { 
  Edge, 
  Node, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge 
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import { CustomNodeData, NodeInput, NodeOutput, NodeTemplate } from '../types/diagram';

interface DiagramState {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isModalOpen: boolean;
  isSettingsModalOpen: boolean;
  pendingPosition: { x: number; y: number } | null;
  templates: NodeTemplate[];
  types: string[];
  locations: string[];

  // React Flow actions
  onNodesChange: OnNodesChange<Node<CustomNodeData>>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: OnConnect;

  // Node selection
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedEdge: (edgeId: string | null) => void;

  // Node property updates
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeType: (nodeId: string, type: string) => void;
  updateNodeLocation: (nodeId: string, location: string) => void;
  addInput: (nodeId: string) => void;
  removeInput: (nodeId: string, inputId: string) => void;
  updateInputName: (nodeId: string, inputId: string, name: string) => void;
  addOutput: (nodeId: string) => void;
  removeOutput: (nodeId: string, outputId: string) => void;
  updateOutputName: (nodeId: string, outputId: string, name: string) => void;

  // Template actions
   addTemplate: (template: NodeTemplate) => void;
   applyTemplate: (template: NodeTemplate, position: { x: number; y: number }) => void;
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
    locationProperty?: string
  ) => void;
  copyNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  setPendingPosition: (position: { x: number; y: number } | null) => void;
  addType: (type: string) => void;
  removeType: (type: string) => void;
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
}

export const useStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  isModalOpen: false,
  isSettingsModalOpen: false,
  pendingPosition: null,
  templates: [],
  types: [],
  locations: [],

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
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  // Node selection
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setSelectedEdge: (edgeId) => set({ selectedEdgeId: edgeId }),

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

  updateNodeType: (nodeId, type) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, type },
          };
        }
        return node;
      }),
    });
  },

  updateNodeLocation: (nodeId, location) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, location },
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
          const newInput: NodeInput = { id: nanoid(), name: 'New Input' };
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
              inputs: (node.data.inputs || []).filter((input) => input.id !== inputId),
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
                input.id === inputId ? { ...input, name } : input
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
          const newOutput: NodeOutput = { id: nanoid(), name: 'New Output' };
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
              outputs: (node.data.outputs || []).filter((output) => output.id !== outputId),
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
                output.id === outputId ? { ...output, name } : output
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
    const newNode: Node<CustomNodeData> = {
      id: nanoid(),
      type: template.nodeType,
      position,
      data: {
        label: template.name,
        inputs: template.inputs,
        outputs: template.outputs,
        type: template.type,
      },
    };
    set({
      nodes: [...get().nodes, newNode],
    });
  },

  updateTemplate: (template) => {
    set({
      templates: get().templates.map((t) => (t.id === template.id ? template : t)),
    });
  },

  deleteTemplate: (templateId) => {
    set({
      templates: get().templates.filter((t) => t.id !== templateId),
    });
  },

  addNode: (type, position, label, inputsCount = 0, outputsCount = 0, typeProperty, locationProperty) => {
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
      },
    };
    set({
      nodes: [...get().nodes, newNode],
    });
  },

  copyNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newNode: Node<CustomNodeData> = {
      ...node,
      id: nanoid(),
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20,
      },
    };

    set({
      nodes: [...get().nodes, newNode],
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      selectedNodeId: null,
      selectedEdgeId: null,
    });
  },
  deleteEdge: (edgeId) => {
    set({
      edges: get().edges.filter((edge) => edge.id !== edgeId),
      selectedEdgeId: null,
    });
  },

  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setIsSettingsModalOpen: (isOpen) => set({ isSettingsModalOpen: isOpen }),
  setPendingPosition: (position) => set({ pendingPosition: position }),
  addType: (type) => set({ types: [...get().types, type] }),
  removeType: (type) => set({ types: get().types.filter((t) => t !== type) }),
  addLocation: (location) => set({ locations: [...get().locations, location] }),
  removeLocation: (location) => set({ locations: get().locations.filter((l) => l !== location) }),
}));
