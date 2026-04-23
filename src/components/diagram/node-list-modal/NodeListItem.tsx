import React from "react";
import { MapPin, Tag } from "lucide-react";
import { type NodeListItemProps } from "../node-list-modal-types";

export const NodeListItem = ({
  node,
  groupBy,
  showDetails,
}: NodeListItemProps) => {
  return (
    <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      <div className="flex-1 px-5 py-3">
        <div className="font-medium text-zinc-900 dark:text-zinc-100 wrap-break-word max-w-full flex flex-col">
          <span className="truncate">{node.name}</span>
          {showDetails && (
            <div className="flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              {node.type && groupBy !== "type" && (
                <div className="mt-1 flex items-center gap-1">
                  <Tag size={12} />
                  {node.type}
                </div>
              )}
              {groupBy === "none" && node.location && (
                <div className="mt-1 flex items-center gap-1">
                  <MapPin size={12} />
                  {node.location}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="shrink-0 w-20 px-5 py-2 text-right border-l border-zinc-100 dark:border-zinc-800">
        <span className="text-gray-500 dark:text-zinc-500">
          {node.quantity}
        </span>
      </div>
    </div>
  );
};
