import React from "react";
import { type NodeListContentProps } from "../node-list-modal-types";
import { NodeListItem } from "./NodeListItem";

export const NodeListContent = ({ aggregatedNodes, groupBy, showDetails }: NodeListContentProps) => {
  return (
    <div className="max-h-[400px] overflow-y-auto">
      {aggregatedNodes.reduce((acc: React.ReactNode[], node, index) => {
        if (groupBy === "location") {
          const isNewLocation =
            index === 0 ||
            node.location !== aggregatedNodes[index - 1].location;
          if (isNewLocation) {
            acc.push(
              <div
                key={`header-${index}`}
                className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800"
              >
                {node.location || "unassigned"}
              </div>,
            );
          }
        }

        if (groupBy === "type") {
          const isNewType =
            index === 0 ||
            node.type !== aggregatedNodes[index - 1].type;
          if (isNewType) {
            acc.push(
              <div
                key={`header-${index}`}
                className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800"
              >
                {node.type || "unassigned"}
              </div>,
            );
          }
        }

        acc.push(
          <NodeListItem
            key={`${node.name}-${node.quantity}-${index}`}
            node={node}
            groupBy={groupBy}
            showDetails={showDetails}
          />
        );
        return acc;
      }, [])}
    </div>
  );
};
