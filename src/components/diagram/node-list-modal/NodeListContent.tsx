import React from "react";
import { type NodeListContentProps } from "../node-list-modal-types";
import { NodeListItem } from "./NodeListItem";

export const NodeListContent = ({
  aggregatedNodes,
  groupBy,
  showDetails,
}: NodeListContentProps) => {
  const elements: React.ReactNode[] = [];

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
          elements.push(
            <NodeListItem
              key={`summary-${index - 1}`}
              node={{
                name: "Power Sockets",
                quantity: powerSocketsInCurrentLoc,
                hasPower: false,
              }}
              showDetails={false}
              groupBy="none"
            />,
          );
          powerSocketsInCurrentLoc = 0;
        }

        elements.push(
          <div
            key={`header-${index}`}
            className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800"
          >
            {currentLoc}
          </div>,
        );
      }

      if (node.hasPower) {
        powerSocketsInCurrentLoc += node.quantity;
      }

      elements.push(
        <NodeListItem
          key={`${node.name}-${node.quantity}-${index}`}
          node={node}
          groupBy={groupBy}
          showDetails={showDetails}
        />,
      );
    });

    if (aggregatedNodes.length > 0) {
      elements.push(
        <NodeListItem
          key={`summary-last`}
          node={{
            name: "Power Sockets",
            quantity: powerSocketsInCurrentLoc,
            hasPower: false,
          }}
          showDetails={false}
          groupBy="none"
        />,
      );
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
          elements.push(
            <div
              key={`header-${index}`}
              className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800"
            >
              {currentType}
            </div>,
          );
        }
      }

      if (node.hasPower && node.location) {
        locationsWithPower.add(node.location);
      }

      elements.push(
        <NodeListItem
          key={`${node.name}-${node.quantity}-${index}`}
          node={node}
          groupBy={groupBy}
          showDetails={showDetails}
        />,
      );
    });
    if (locationsWithPower.size > 0) {
      elements.push(
        <NodeListItem
          key={`summary-breakout`}
          node={{
            name: "Power Breakout (Min.)",
            quantity: locationsWithPower.size,
            hasPower: false,
          }}
          showDetails={false}
          groupBy="none"
        />,
      );
    }
  }

  return <div className="max-h-[400px] overflow-y-auto">{elements}</div>;
};
