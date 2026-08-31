import { CustomNodeData, NodeTemplate, CableTypeDef, NamedColorDef } from "@/types/diagram";
import { Edge, Node } from "@xyflow/react";

export interface ProjectState {
  templates: NodeTemplate[];
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  types: string[];
  locations: string[];
  cableTypes: CableTypeDef[];
  hideLegend?: boolean; // optional: absent in pre-styling project files
  hideCableLabels?: boolean; // optional: absent in pre-existing project files
  hideDetailsSignalFlow?: boolean; // optional: absent in pre-existing project files
  hideDetailsStagePlan?: boolean; // optional: absent in pre-existing project files
  signalFlowLabelFontSize?: number; // optional: absent in pre-existing project files
  signalFlowDetailsFontSize?: number;
  stagePlanLabelFontSize?: number;
  stagePlanDetailsFontSize?: number;
  defaultEdgeLineType?: string; // optional: absent in pre-existing project files
  riderListTitle: string;
  riderListSubtitle: string;
  riderListPreparedBy: string;
  canvasTitle: string;
  canvasSubtitle: string;
  canvasPreparedBy: string;
  stagePlanTitle: string;
  stagePlanSubtitle: string;
  stagePlanPreparedBy: string;
  stagePlanNodes: Node<CustomNodeData>[];
  namedColors?: NamedColorDef[]; // optional: absent in pre-existing project files
  locationBackgrounds?: Record<string, string>;
  typeBackgrounds?: Record<string, string>;
}

/**
 * Exports the current project state to a downloadable JSON file.
 * @param state The current project state.
 * @param customFilename Optional custom filename (defaults to "project.json").
 */
export function exportProject(state: ProjectState, customFilename?: string): void {
  const filename = customFilename || "project.json";
  const jsonString = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
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
