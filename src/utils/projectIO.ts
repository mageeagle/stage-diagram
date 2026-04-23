import { CustomNodeData, NodeTemplate } from "@/types/diagram";
import { Edge, Node } from "@xyflow/react";

export interface ProjectState {
  templates: NodeTemplate[];
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  types: string[];
  locations: string[];
  cableTypes: string[];
  title: string;
  preparedBy: string;
}

/**
 * Exports the current project state to a downloadable JSON file.
 * @param state The current project state.
 */
export function exportProject(state: ProjectState): void {
  const jsonString = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "project.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports a project state from a JSON file.
 * @param file The File object uploaded by the user.
 * @returns A promise resolving to the validated ProjectState.
 */
export async function importProject(file: File): Promise<ProjectState> {
  const text = await file.text();
  let data: unknown;

  try {
    data = JSON.parse(text);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw new Error(
      "Invalid JSON format. Please ensure the file is a valid project export.",
    );
  }

  const projectState = data as ProjectState;

  // Basic validation schema check
  if (
    !Array.isArray(projectState.templates) ||
    !Array.isArray(projectState.nodes) ||
    !Array.isArray(projectState.edges)
  ) {
    throw new Error(
      "Project file format is incorrect. Must contain 'templates', 'nodes', and 'edges' arrays.",
    );
  }

  return projectState;
}
