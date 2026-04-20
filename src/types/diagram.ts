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
}
