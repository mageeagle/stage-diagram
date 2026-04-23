export type GroupByMode = "none" | "location" | "type";

export interface GroupedNode {
  name: string;
  type?: string;
  location?: string;
  quantity: number;
}

export interface NodeListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface NodeListHeaderProps {
  onClose: () => void;
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
  aggregatedNodes: GroupedNode[];
  groupBy: GroupByMode;
  showDetails: boolean;
}
