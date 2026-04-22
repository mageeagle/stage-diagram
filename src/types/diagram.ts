export interface NodeInput {
  id: string;   // Unique ID for the handle
  name: string; // Editable name
}

export interface NodeOutput {
  id: string;   // Unique ID for the handle
  name: string; // Editable name
}

export interface CustomNodeData {
  label: string;           // The node's name
  inputs: NodeInput[];     // Array of input handles
  outputs: NodeOutput[];   // Array of output handles
  type?: string;
  location?: string;
  power: boolean;
  [key: string]: unknown;
}

export interface NodeTemplate {
  id: string;
  name: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  type: string;       // The 'type' property within node.data
  nodeType: string;   // The 'type' property of the Node itself (React Flow type)
  power: boolean;
}
