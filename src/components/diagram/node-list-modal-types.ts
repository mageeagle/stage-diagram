import { type Edge, type Node } from "@xyflow/react";
import { type CustomNodeData } from "../../types/diagram";

export type GroupByMode = "none" | "location" | "type";
export type ExportFormat = "pdf" | "csv" | "json";

export interface GroupedNode {
  name: string;
  type?: string;
  location?: string;
  quantity: number;
  hasPower: boolean;
}

export interface NodeListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface NodeListHeaderProps {
  onClose: () => void;
  onExport?: (format: ExportFormat) => void;
  title: string;
  subtitle: string;
  preparedBy: string;
}

export interface NodeListTabsProps {
  groupBy: GroupByMode;
  setGroupBy: (mode: GroupByMode) => void;
}

export interface NodeListItemProps {
  node: GroupedNode;
  groupBy: GroupByMode;
  showDetails: boolean;
}

export interface NodeListContentProps {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  groupBy: GroupByMode;
  showDetails: boolean;
}
