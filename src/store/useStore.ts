import { create } from 'zustand';
import { 
  Connection, 
  Edge, 
  EdgeChange, 
  Node, 
  NodeChange, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge 
} from 'reactflow';
import { nanoid } from 'nanoid';
import { CustomNodeData, NodeInput, NodeOutput } from '../types/diagram';

interface DiagramState {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;

  // React Flow actions
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // Node selection
  setSelectedNode: (nodeId: string | null) => void;

  // Node property updates
  updateNodeLabel: (nodeId: string, label: string) => void;
  addInput: (nodeId: string) => void;
  removeInput: (nodeId: string, inputId: string) => void;
  updateInputName: (nodeId: string, inputId: string, name: string) => void;
  addOutput: (nodeId: string) => void;
  removeOutput: (nodeId: string, outputId: string) => void;
  updateOutputName: (nodeId: string, outputId: string, name: string) => void;

  // Canvas actions
  addNode: (type: string, position: { x: number; y: number }) => void;
}

export const useStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

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

  addNode: (type, position) => {
    const newNode: Node<CustomNodeData> = {
      id: nanoid(),
      type,
      position,
      data: {
        label: 'New Node',
        inputs: [],
        outputs: [],
      },
    };
    set({
      nodes: [...get().nodes, newNode],
    });
  },
}));
