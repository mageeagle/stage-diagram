import { type Edge, type Node } from "@xyflow/react";
import { type CustomNodeData } from "../../../types/diagram";
import { type GroupByMode, type GroupedNode } from "../node-list-modal-types";
import { groupByName, groupByLocation, groupByType } from "../node-list-utils";

export type ReportRow = 
  | { type: 'header'; label: string }
  | { type: 'node'; node: GroupedNode }
  | { type: 'summary'; label: string; value: string | number }
  | { type: 'separator' };

export type Report = {
  nodesReport: ReportRow[];
  cablesReport: ReportRow[];
};

export function generateNodeListReport(
  nodes: Node<CustomNodeData>[],
  groupBy: GroupByMode,
  edges: Edge[]
): Report {
  const nodesReport: ReportRow[] = [];
  
  // Filter out nodes marked to hide from list (including edges connected to them)
  const visibleNodes = nodes.filter(
    (node) => !(node.data?.hideFromList === true || node.data?.exportingHidden === true)
  );
  
  const aggregatedNodes =
    visibleNodes.length > 0
      ? groupBy === "none"
        ? groupByName(visibleNodes)
        : groupBy === "location"
          ? groupByLocation(visibleNodes)
          : groupByType(visibleNodes)
      : [];

  if (groupBy === "location") {
    let powerSocketsInCurrentLoc = 0;

    aggregatedNodes.forEach((node, index) => {
      const currentLoc = node.location || "unassigned";
      const prevLoc =
        index === 0
          ? null
          : aggregatedNodes[index - 1].location || "unassigned";
      const isNewLocation = index === 0 || currentLoc !== prevLoc;

      if (isNewLocation) {
        if (index > 0 && powerSocketsInCurrentLoc > 0) {
          nodesReport.push({
            type: 'summary',
            label: "Power Sockets",
            value: powerSocketsInCurrentLoc,
          });
          powerSocketsInCurrentLoc = 0;
        }

        nodesReport.push({
          type: 'header',
          label: currentLoc,
        });
      }

      if (node.hasPower) {
        powerSocketsInCurrentLoc += node.quantity;
      }

      nodesReport.push({
        type: 'node',
        node: node,
      });
    });

    if (aggregatedNodes.length > 0) {
      nodesReport.push({
        type: 'summary',
        label: "Power Sockets",
        value: powerSocketsInCurrentLoc,
      });
    }
  } else {
    const locationsWithPower = new Set<string>();

    aggregatedNodes.forEach((node, index) => {
      if (groupBy === "type") {
        const currentType = node.type || "unassigned";
        const prevType =
          index === 0 ? null : aggregatedNodes[index - 1].type || "unassigned";
        const isNewType = index === 0 || currentType !== prevType;

        if (isNewType) {
          nodesReport.push({
            type: 'header',
            label: currentType,
          });
        }
      }

      if (node.hasPower && node.location) {
        locationsWithPower.add(node.location);
      }

      nodesReport.push({
        type: 'node',
        node: node,
      });
    });

    if (locationsWithPower.size > 0) {
      nodesReport.push({
        type: 'summary',
        label: "Power Breakout (Min.)",
        value: locationsWithPower.size,
      });
    }
  }

  // Cables section
  const cablesReport: ReportRow[] = [];
  
  // Get unique cable types from edges connected to visible nodes only
  const visibleEdges = visibleNodes.flatMap((n) =>
    edges.filter((e) => e.source === n.id || e.target === n.id)
  );
  
  const cableTypeCounts = new Map<string, number>();
  visibleEdges.forEach((edge) => {
    const type = edge.data?.cableType as string;
    if (type && type !== 'none') {
      cableTypeCounts.set(type, (cableTypeCounts.get(type) || 0) + 1);
    }
  });

  if (cableTypeCounts.size > 0) {
    cablesReport.push({
      type: 'header',
      label: 'Cables',
    });

    Array.from(cableTypeCounts.entries()).forEach(([type, count]) => {
      cablesReport.push({
        type: 'summary',
        label: type,
        value: count,
      });
    });
  }

  return {
    nodesReport,
    cablesReport,
  };
}
